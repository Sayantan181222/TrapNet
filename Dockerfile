FROM python:3.10-slim-bullseye

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN pip install -e . --no-cache-dir

EXPOSE 8000

CMD ["python", "app.py"]