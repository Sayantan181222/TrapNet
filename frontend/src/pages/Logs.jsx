import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export default function Logs() {
  const [lines, setLines] = useState([]);
  const [filename, setFilename] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const terminalRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchLogs = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await client.get('/logs');
      if (response.data) {
        setLines(response.data.lines || []);
        setFilename(response.data.filename || null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load logs from backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchLogs(true);
  }, []);

  // Auto-refresh interval management
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs(false);
      }, 10000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh]);

  // Auto-scroll to bottom when new log lines arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="logs-page-container">
      <style>{`
        .logs-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .logs-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .logs-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .logs-controls {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        /* Refresh button */
        .btn-refresh {
          background: transparent;
          border: 1.5px solid var(--accent);
          color: var(--accent);
          padding: 0.4rem 1rem;
          border-radius: var(--radius);
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .btn-refresh:hover {
          background: var(--accent);
          color: #FFFFFF;
        }

        /* Toggle switch */
        .toggle-label-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .toggle-input {
          display: none;
        }

        .toggle-pill {
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: var(--border);
          position: relative;
          transition: var(--transition);
          display: inline-block;
          vertical-align: middle;
        }

        .toggle-input:checked + .toggle-pill {
          background: var(--accent);
        }

        .toggle-circle {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          transition: var(--transition);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .toggle-input:checked + .toggle-pill .toggle-circle {
          transform: translateX(20px);
        }

        .logs-filename {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: -0.5rem;
        }

        /* Terminal box */
        .logs-terminal {
          background: #1A1A1A;
          color: #E8E8E8;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.8rem;
          border-radius: var(--radius);
          padding: 1.5rem;
          height: 500px;
          overflow-y: auto;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .log-line {
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.45;
        }

        .log-error {
          color: #FF6B6B;
        }

        .log-warning {
          color: #FFD93D;
        }

        .log-info {
          color: #6BCB77;
        }

        .log-default {
          color: #E8E8E8;
        }

        .log-status-text {
          font-style: italic;
          font-size: 0.9rem;
          padding: 1rem 0;
        }
      `}</style>

      {/* Header Row */}
      <div className="logs-header-row">
        <h1 className="logs-title">Live Logs</h1>

        <div className="logs-controls">
          <button
            className="btn-refresh"
            onClick={() => fetchLogs(false)}
            title="Refresh logs"
          >
            ↻ Refresh
          </button>

          <label className="toggle-label-wrap">
            <span>Auto-refresh</span>
            <input
              type="checkbox"
              className="toggle-input"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="toggle-pill">
              <span className="toggle-circle" />
            </span>
          </label>
        </div>
      </div>

      {/* Subtitle / Filename */}
      {filename && (
        <div className="logs-filename">Reading from: {filename}</div>
      )}

      {/* Log Terminal Box */}
      <div className="logs-terminal" ref={terminalRef}>
        {loading && lines.length === 0 ? (
          <div className="log-status-text" style={{ color: '#6BCB77' }}>
            Fetching logs...
          </div>
        ) : error ? (
          <div className="log-status-text" style={{ color: '#FF6B6B' }}>
            Error: {error}
          </div>
        ) : lines.length === 0 ? (
          <div className="log-status-text" style={{ color: 'var(--text-muted)' }}>
            No log entries found.
          </div>
        ) : (
          lines.map((line, idx) => {
            let colorClass = 'log-default';
            if (line.includes('ERROR')) {
              colorClass = 'log-error';
            } else if (line.includes('WARNING')) {
              colorClass = 'log-warning';
            } else if (line.includes('INFO')) {
              colorClass = 'log-info';
            }

            return (
              <div key={idx} className={`log-line ${colorClass}`}>
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
