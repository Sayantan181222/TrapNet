import React, { useEffect, useState, useRef } from 'react';
import client from '../api/client';

export default function Train() {
  const [isTraining, setIsTraining] = useState(false);
  const [statusData, setStatusData] = useState({
    status: 'idle',
    stage: null,
    message: 'Pipeline is currently idle. Click below to begin retraining.',
  });

  const pollIntervalRef = useRef(null);

  const stages = [
    'Data Ingestion',
    'Data Validation',
    'Data Transformation',
    'Model Training',
  ];

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleStartTraining = async () => {
    if (isTraining) return;

    setIsTraining(true);
    const initialRunning = {
      status: 'running',
      stage: 'starting',
      message: 'Pipeline initializing...',
    };
    setStatusData(initialRunning);

    // Start polling every 5000ms
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await client.get('/train/status');
        if (res.data) {
          setStatusData(res.data);
          if (res.data.status === 'done' || res.data.status === 'error') {
            stopPolling();
            setIsTraining(false);
          }
        }
      } catch (pollErr) {
        console.error('Polling status error:', pollErr);
      }
    }, 5000);

    // Trigger training pipeline with no timeout
    try {
      const trainResponse = await client.get('/train', { timeout: 0 });
      setStatusData({
        status: 'done',
        stage: 'complete',
        message:
          typeof trainResponse.data === 'string'
            ? trainResponse.data
            : 'Training finished successfully',
      });
    } catch (err) {
      console.error('Training error:', err);
      setStatusData({
        status: 'error',
        stage: null,
        message:
          err.response?.data?.message ||
          err.message ||
          'Training pipeline encountered an error.',
      });
    } finally {
      stopPolling();
      setIsTraining(false);
    }
  };

  const getMessageColor = () => {
    switch (statusData.status) {
      case 'running':
        return 'var(--accent)';
      case 'done':
        return 'var(--accent)';
      case 'error':
        return 'var(--danger)';
      case 'idle':
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className="train-container">
      <style>{`
        .train-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Hero Banner */
        .train-hero {
          background: linear-gradient(135deg, #2D5016 0%, #4A7C23 100%);
          color: #FFFFFF;
          padding: 2rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        .train-hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 0.35rem;
          line-height: 1.2;
        }

        .train-hero-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
        }

        /* Card container */
        .train-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }

        .train-card-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        /* Pipeline Visual */
        .pipeline-flow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stage-pill {
          background: var(--accent);
          color: #FFFFFF;
          padding: 0.5rem 1.2rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--transition);
          user-select: none;
        }

        .stage-pill:hover {
          background: var(--accent-light);
        }

        .stage-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9A9A9A;
          display: inline-block;
          transition: background 0.3s ease;
        }

        .stage-dot.done {
          background: #4ADE80;
        }

        .stage-dot.error {
          background: var(--danger-light);
        }

        .stage-dot.pulsing {
          background: #4ADE80;
          animation: pulse 1.4s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .stage-arrow {
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 600;
          user-select: none;
        }

        /* Actions */
        .train-actions {
          margin-top: 1.5rem;
        }

        .btn-train {
          background: var(--accent);
          color: #FFFFFF;
          padding: 0.75rem 2rem;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-train:hover:not(:disabled) {
          background: var(--accent-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-train:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Status card */
        .status-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(45, 80, 22, 0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .status-message {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
        }

        /* MLflow footer card */
        .mlflow-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .mlflow-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          margin-left: 0.25rem;
        }

        .mlflow-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Hero Banner */}
      <div className="train-hero">
        <h1 className="train-hero-title">Retrain Model Pipeline</h1>
        <p className="train-hero-subtext">
          Triggers the full pipeline: ingestion → validation → transformation → training → S3 sync
        </p>
      </div>

      {/* Pipeline Architecture Visual & Trigger */}
      <div className="train-card">
        <h2 className="train-card-title">Pipeline Architecture</h2>
        <div className="pipeline-flow">
          {stages.map((stage, index) => {
            let dotClass = 'stage-dot';
            if (statusData.status === 'done') {
              dotClass += ' done';
            } else if (statusData.status === 'error') {
              dotClass += ' error';
            } else if (statusData.status === 'running') {
              // Pulse active stage or first stage while starting
              dotClass += ' pulsing';
            }

            return (
              <React.Fragment key={stage}>
                <div className="stage-pill">
                  <span className={dotClass} />
                  <span>{stage}</span>
                </div>
                {index < stages.length - 1 && (
                  <span className="stage-arrow">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="train-actions">
          <button
            className="btn-train"
            onClick={handleStartTraining}
            disabled={isTraining}
          >
            {isTraining ? 'Training in progress...' : 'Start Training'}
          </button>
        </div>
      </div>

      {/* Status Card (Always visible) */}
      <div className="status-box">
        {statusData.status === 'running' && <div className="status-spinner" />}
        <div
          className="status-message"
          style={{ color: getMessageColor() }}
        >
          {statusData.message}
        </div>
      </div>

      {/* MLflow Note Card */}
      <div className="mlflow-card">
        Experiment tracking via MLflow + DagsHub. View runs at{' '}
        <a
          href="https://dagshub.com/sayantanman508/networksecurity"
          target="_blank"
          rel="noopener noreferrer"
          className="mlflow-link"
        >
          dagshub.com/sayantanman508/networksecurity
        </a>
      </div>
    </div>
  );
}
