import React, { useState } from 'react';

export default function Dashboard() {
  const [metrics] = useState({
    f1Score: '0.97',
    precision: '0.96',
    recall: '0.98',
    model: 'Random Forest',
  });

  const stages = [
    'Data Ingestion',
    'Data Validation',
    'Data Transformation',
    'Model Training',
  ];

  const techStack = [
    'FastAPI',
    'MongoDB',
    'Scikit-Learn',
    'MLflow',
    'DagsHub',
    'AWS S3',
    'Docker',
  ];

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Hero Banner */
        .hero-banner {
          background: linear-gradient(135deg, #2D5016 0%, #4A7C23 100%);
          color: #FFFFFF;
          padding: 2.5rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.4rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .hero-subtext {
          font-family: 'Inter', sans-serif;
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
        }

        /* Metric Cards Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .metric-card {
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          transition: var(--transition);
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          background: var(--bg-card-hover);
        }

        .metric-value {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--accent);
          line-height: 1.1;
          margin-bottom: 0.35rem;
        }

        .metric-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Sections common styling */
        .section-box {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }

        .section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        /* Pipeline Stages */
        .pipeline-flow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
        }

        .stage-pill {
          background: var(--accent);
          color: #FFFFFF;
          padding: 0.5rem 1.2rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: var(--transition);
          cursor: default;
          white-space: nowrap;
          user-select: none;
        }

        .stage-pill:hover {
          background: var(--accent-light);
        }

        .stage-arrow {
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 600;
          user-select: none;
        }

        /* Tech Stack */
        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tech-pill {
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 0.3rem 0.8rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: #FFFFFF;
          font-weight: 500;
          transition: var(--transition);
        }

        .tech-pill:hover {
          border-color: var(--accent-light);
          color: var(--accent);
          background: var(--bg-card-hover);
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .pipeline-flow {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .hero-banner {
            padding: 1.75rem;
          }
          .hero-title {
            font-size: 1.9rem;
          }
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .metric-value {
            font-size: 1.8rem;
          }
        }
      `}</style>

      {/* Hero Banner Card */}
      <div className="hero-banner">
        <h1 className="hero-title">TrapNet — Network Phishing Detector</h1>
        <p className="hero-subtext">
          End-to-end ML pipeline for real-time phishing URL classification
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.f1Score}</div>
          <div className="metric-label">F1 Score</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.precision}</div>
          <div className="metric-label">Precision</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.recall}</div>
          <div className="metric-label">Recall</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.model}</div>
          <div className="metric-label">Best Model</div>
        </div>
      </div>

      {/* Pipeline Architecture Section */}
      <div className="section-box">
        <h2 className="section-title">Pipeline Architecture</h2>
        <div className="pipeline-flow">
          {stages.map((stage, index) => (
            <React.Fragment key={stage}>
              <div className="stage-pill">{stage}</div>
              {index < stages.length - 1 && (
                <span className="stage-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="section-box">
        <h3 className="section-title" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          Tech Stack
        </h3>
        <div className="tech-tags">
          {techStack.map((tech) => (
            <div key={tech} className="tech-pill">
              {tech}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
