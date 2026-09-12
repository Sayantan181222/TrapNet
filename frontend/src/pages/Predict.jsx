import React, { useState, useRef } from 'react';
import client from '../api/client';

export default function Predict() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selected = droppedFiles[0];
      if (selected.name.endsWith('.csv')) {
        setFile(selected);
      } else {
        setError('Please select a valid .csv file.');
      }
    }
  };

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.endsWith('.csv')) {
        setFile(selected);
      } else {
        setError('Please select a valid .csv file.');
      }
    }
  };

  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRunPrediction = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'text',
      });

      // Parse HTML response using DOMParser to extract <table>
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      const table = doc.querySelector('table');

      if (!table) {
        throw new Error('No prediction table was returned by the server.');
      }

      // Extract column headers
      const theadThs = table.querySelectorAll('thead th');
      const thElements =
        theadThs.length > 0
          ? Array.from(theadThs)
          : Array.from(table.querySelectorAll('tr:first-child th'));

      const headers = thElements.map((th, index) => {
        const text = th.textContent.trim();
        if (index === 0 && !text) return '#';
        return text || `column_${index}`;
      });

      // Extract rows
      const tbodyRows = table.querySelectorAll('tbody tr');
      const trElements =
        tbodyRows.length > 0
          ? Array.from(tbodyRows)
          : Array.from(table.querySelectorAll('tr')).slice(1);

      const parsedData = [];
      trElements.forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td'));
        if (cells.length > 0) {
          const rowObj = {};
          cells.forEach((cell, cellIdx) => {
            const key = headers[cellIdx] || `col_${cellIdx}`;
            rowObj[key] = cell.textContent.trim();
          });
          parsedData.push(rowObj);
        }
      });

      setResults(parsedData);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to run prediction. Please check your backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (!results || results.length === 0) return;

    const headers = Object.keys(results[0]);
    const csvLines = [];
    csvLines.push(headers.join(','));

    results.forEach((row) => {
      const line = headers
        .map((header) => {
          const value = (row[header] ?? '').toString().replace(/"/g, '""');
          return `"${value}"`;
        })
        .join(',');
      csvLines.push(line);
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trapnet_prediction_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="predict-container">
      <style>{`
        .predict-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .section-subtext {
          font-family: 'Inter', sans-serif;
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        /* Drag & drop zone */
        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          background: #FFFFFF;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .drop-zone.drag-active {
          border-color: var(--accent);
          background: #F0F5EC;
        }

        .drop-zone-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .drop-zone-text {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .drop-zone-file-name {
          color: var(--accent);
          font-weight: 600;
          font-size: 1.05rem;
          word-break: break-all;
        }

        /* Predict button */
        .predict-actions {
          margin-top: 1.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-predict {
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

        .btn-predict:hover:not(:disabled) {
          background: var(--accent-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-predict:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .error-banner {
          margin-top: 1.25rem;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius);
          background: #FDF2F2;
          border: 1px solid #F8D7DA;
          color: var(--danger);
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Results table */
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .results-count {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
          background: #FFFFFF;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-family: 'Inter', sans-serif;
        }

        .results-table th {
          background: var(--accent);
          color: #FFFFFF;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .results-table td {
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .row-phishing {
          background: #FFF0F0;
          transition: var(--transition);
        }

        .row-safe {
          background: #F0FFF4;
          transition: var(--transition);
        }

        .results-table tbody tr:hover {
          opacity: 0.85;
          cursor: default;
        }

        .badge-phishing {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(139, 26, 26, 0.12);
          color: var(--danger);
          font-weight: 600;
          font-size: 0.8rem;
        }

        .badge-safe {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(45, 80, 22, 0.12);
          color: var(--accent);
          font-weight: 600;
          font-size: 0.8rem;
        }

        .btn-download {
          background: var(--bg-card);
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 0.65rem 1.5rem;
          border-radius: var(--radius);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-download:hover {
          background: var(--accent);
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      {/* Section 1 — Upload Card */}
      <section className="section-card">
        <h1 className="section-title">Upload CSV for Prediction</h1>
        <p className="section-subtext">
          Upload a phishing dataset CSV. The model will classify each row.
        </p>

        <div
          className={`drop-zone ${dragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="drop-zone-icon">{file ? '📄' : '☁️'}</div>

          {file ? (
            <div>
              <div className="drop-zone-file-name">{file.name}</div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}
              >
                Click or drag another file to replace
              </div>
            </div>
          ) : (
            <p className="drop-zone-text">
              Drag & drop your CSV here, or click to browse
            </p>
          )}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="predict-actions">
          <button
            className="btn-predict"
            onClick={handleRunPrediction}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner">⟳</span> Predicting...
              </>
            ) : (
              'Run Prediction'
            )}
          </button>
        </div>
      </section>

      {/* Section 2 — Results Table */}
      {results && (
        <section className="section-card">
          <div className="results-header">
            <h2 className="section-title">Prediction Results</h2>
            <div className="results-count">{results.length} rows analysed</div>
          </div>

          <div className="table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  {Object.keys(results[0] || {}).map((headerKey) => (
                    <th key={headerKey}>{headerKey}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, rowIdx) => {
                  const pred = (row['predicted_column'] ?? '').toString();
                  const isPhishing = pred === '1';
                  const isSafe = pred === '0';
                  const rowClass = isPhishing
                    ? 'row-phishing'
                    : isSafe
                    ? 'row-safe'
                    : '';

                  return (
                    <tr key={rowIdx} className={rowClass}>
                      {Object.entries(row).map(([key, val], cellIdx) => {
                        if (key === 'predicted_column') {
                          return (
                            <td key={cellIdx}>
                              {isPhishing ? (
                                <span className="badge-phishing">⚠ Phishing</span>
                              ) : isSafe ? (
                                <span className="badge-safe">✓ Safe</span>
                              ) : (
                                val
                              )}
                            </td>
                          );
                        }
                        return <td key={cellIdx}>{val}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button className="btn-download" onClick={handleDownloadResults}>
            ↓ Download Results
          </button>
        </section>
      )}
    </div>
  );
}
