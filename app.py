import sys
import os
from contextlib import asynccontextmanager

import certifi
ca = certifi.where()

from dotenv import load_dotenv
load_dotenv()
mongo_db_url = os.getenv("MONGO_DB_URL")
print(mongo_db_url)
import pymongo
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.pipeline.training_pipeline import TrainingPipeline

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile,Request
from uvicorn import run as app_run
from fastapi.responses import Response, JSONResponse
from starlette.responses import RedirectResponse
import pandas as pd

from networksecurity.utils.main_utils.utils import load_object

from networksecurity.utils.ml_utils.model.estimator import NetworkModel


client = pymongo.MongoClient(mongo_db_url, tlsCAFile=ca)

from networksecurity.constant.training_pipeline import DATA_INGESTION_COLLECTION_NAME
from networksecurity.constant.training_pipeline import DATA_INGESTION_DATABASE_NAME

database = client[DATA_INGESTION_DATABASE_NAME]
collection = database[DATA_INGESTION_COLLECTION_NAME]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    model_path = "final_model/model.pkl"
    preprocessor_path = "final_model/preprocessor.pkl"
    if os.path.exists(model_path) and os.path.exists(preprocessor_path):
        logging.info("Model files found locally. Ready to serve predictions.")
    else:
        logging.warning("Model files missing. /predict will fail until training is run.")

    dagshub_token = os.getenv("DAGSHUB_TOKEN")
    if not dagshub_token:
        logging.warning("DAGSHUB_TOKEN not set. MLflow tracking disabled.")
    yield
    # shutdown

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_training_status = {"status": "idle", "stage": None, "message": ""}

from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="./templates")

@app.get("/", tags=["authentication"])
async def index():
    return RedirectResponse(url="/docs")

@app.get("/train/status")
async def train_status():
    return JSONResponse(content=_training_status)

@app.get("/logs")
async def get_logs():
    logs_dir = "logs"
    if not os.path.exists(logs_dir):
        return JSONResponse(content={"lines": [], "filename": None})
    
    log_files = []
    for root, _, files in os.walk(logs_dir):
        for file in files:
            if file.endswith(".log"):
                log_files.append(os.path.join(root, file))
                
    if not log_files:
        return JSONResponse(content={"lines": [], "filename": None})
        
    latest_file = max(log_files, key=os.path.getmtime)
    try:
        with open(latest_file, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        last_lines = [line.rstrip("\r\n") for line in lines[-200:]]
        return JSONResponse(content={"lines": last_lines, "filename": os.path.basename(latest_file)})
    except Exception as e:
        return JSONResponse(content={"lines": [f"Error reading log file: {str(e)}"], "filename": os.path.basename(latest_file)})

@app.get("/train")
async def train_route():
    global _training_status
    try:
        _training_status = {"status": "running", "stage": "starting", "message": "Pipeline initializing..."}
        train_pipeline=TrainingPipeline()
        train_pipeline.run_pipeline()
        _training_status = {"status": "done", "stage": "complete", "message": "Training finished successfully"}
        return Response("Training is successful")
    except Exception as e:
        _training_status = {"status": "error", "stage": None, "message": str(e)}
        raise NetworkSecurityException(e,sys)
    
@app.post("/predict")
async def predict_route(request: Request,file: UploadFile = File(...)):
    try:
        df=pd.read_csv(file.file)
        #print(df)
        preprocesor=load_object("final_model/preprocessor.pkl")
        final_model=load_object("final_model/model.pkl")
        network_model = NetworkModel(preprocessor=preprocesor,model=final_model)
        print(df.iloc[0])
        y_pred = network_model.predict(df)
        print(y_pred)
        df['predicted_column'] = y_pred
        print(df['predicted_column'])
        #df['predicted_column'].replace(-1, 0)
        #return df.to_json()
        df.to_csv('prediction_output/output.csv')
        table_html = df.to_html(classes='table table-striped')
        #print(table_html)
        return templates.TemplateResponse("table.html", {"request": request, "table": table_html})

    except Exception as e:
        raise NetworkSecurityException(e,sys)
    

    
if __name__=="__main__":
    app_run(app,host="0.0.0.0",port=8000)
