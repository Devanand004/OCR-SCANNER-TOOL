import { useState, useEffect, useCallback } from 'react';
import { processText, saveProcessedText } from '../services/api';

const TextPostProcessing = ({ fileId, rawText, onSaveSuccess }) => {
  const [editableText, setEditableText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('processed'); // 'raw' | 'processed'
  const [saveStatus, setSaveStatus] = useState(null);

  const handleProcess = useCallback(async (showLoading = true) => {
    if (showLoading) setIsProcessing(true);
    try {
      const response = await processText(fileId, rawText);
      setEditableText(response.data.processedText);
    } catch (error) {
      console.error("Processing failed", error);
    } finally {
      setIsProcessing(false);
    }
  }, [fileId, rawText]);

  useEffect(() => {
    if (!rawText) return;
    const runProcess = async () => {
      await handleProcess();
    };
    runProcess();
  }, [rawText, handleProcess]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveProcessedText(fileId, editableText);
      setSaveStatus('success');
      if (onSaveSuccess) onSaveSuccess(editableText);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className="post-processing-container">
      <div className="header-actions">
        <h3>Text Post-Processing</h3>
        <div className="button-group">
          <button 
            className={`toggle-btn ${viewMode === 'raw' ? 'active' : ''}`}
            onClick={() => setViewMode('raw')}
          >
            Raw View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'processed' ? 'active' : ''}`}
            onClick={() => setViewMode('processed')}
          >
            Processed View
          </button>
        </div>
      </div>

      <div className="content-area">
        {isProcessing ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cleaning and formatting text...</p>
          </div>
        ) : (
          <textarea
            className={`text-editor ${viewMode}`}
            value={viewMode === 'raw' ? rawText : editableText}
            onChange={(e) => viewMode === 'processed' && setEditableText(e.target.value)}
            readOnly={viewMode === 'raw'}
            placeholder="No text available..."
          />
        )}
      </div>

      <div className="footer-actions">
        <button className="process-btn" onClick={handleProcess} disabled={isProcessing}>
          Re-Process
        </button>
        <button className="save-btn" onClick={handleSave} disabled={isProcessing || viewMode === 'raw'}>
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <style jsx>{`
        .post-processing-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-top: 20px;
          font-family: 'Inter', sans-serif;
        }
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .button-group {
          background: #f1f5f9;
          padding: 4px;
          border-radius: 8px;
          display: flex;
        }
        .toggle-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .text-editor {
          width: 100%;
          min-height: 400px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .text-editor:focus {
          border-color: #2563eb;
        }
        .text-editor.raw {
          background-color: #f8fafc;
          color: #475569;
          font-family: monospace;
        }
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .footer-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          justify-content: flex-end;
        }
        .process-btn {
          padding: 10px 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .save-btn {
          padding: 10px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .save-btn:hover {
          background: #1d4ed8;
        }
        .save-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default TextPostProcessing;
