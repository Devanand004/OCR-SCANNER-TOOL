
import { useState } from 'react';
import { FileText, Download, FileJson, FileType, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportAsTxt, exportAsPdf, exportAsDocx } from '../services/api';

const ExportButtons = ({ fileId }) => {
  const [isExporting, setIsExporting] = useState(null); // 'txt' | 'pdf' | 'docx' | null
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async (format, exportFn) => {
    setIsExporting(format);
    setError(null);
    setShowSuccess(false);
    
    try {
      const response = await exportFn(fileId);
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `exported_document_${Date.now()}.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(`Export to ${format} failed`, err);
      setError(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="export-container-glass">
      <div className="export-header-mini">
        <Download size={14} className="icon-pulse" />
        <span>Export Results</span>
      </div>
      
      <div className="export-grid">
        <button 
          className={`glass-export-btn txt ${isExporting === 'txt' ? 'loading' : ''}`} 
          onClick={() => handleExport('txt', exportAsTxt)}
          disabled={isExporting !== null}
        >
          {isExporting === 'txt' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={18} />}
          <div className="btn-label">
            <span className="main">TXT</span>
            <span className="sub">Plain Text</span>
          </div>
        </button>
        
        <button 
          className={`glass-export-btn pdf ${isExporting === 'pdf' ? 'loading' : ''}`} 
          onClick={() => handleExport('pdf', exportAsPdf)}
          disabled={isExporting !== null}
        >
          {isExporting === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileType size={18} />}
          <div className="btn-label">
            <span className="main">PDF</span>
            <span className="sub">Document</span>
          </div>
        </button>
        
        <button 
          className={`glass-export-btn docx ${isExporting === 'docx' ? 'loading' : ''}`} 
          onClick={() => handleExport('docx', exportAsDocx)}
          disabled={isExporting !== null}
        >
          {isExporting === 'docx' ? <Loader2 className="animate-spin" size={16} /> : <FileJson size={18} />}
          <div className="btn-label">
            <span className="main">DOCX</span>
            <span className="sub">MS Word</span>
          </div>
        </button>
      </div>

      {showSuccess && (
        <div className="export-feedback success">
          <CheckCircle2 size={14} />
          <span>Download started successfully!</span>
        </div>
      )}

      {error && (
        <div className="export-feedback error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .export-container-glass {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          min-width: 320px;
        }
        .export-header-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-left: 4px;
        }
        .icon-pulse {
          color: #6366f1;
        }
        .export-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .glass-export-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .glass-export-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .glass-export-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .glass-export-btn.txt:hover { color: #94a3b8; }
        .glass-export-btn.pdf:hover { color: #ef4444; }
        .glass-export-btn.docx:hover { color: #3b82f6; }
        
        .btn-label {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .btn-label .main {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .btn-label .sub {
          font-size: 0.65rem;
          opacity: 0.5;
        }
        .glass-export-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .export-feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          animation: fadeIn 0.3s ease;
        }
        .export-feedback.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .export-feedback.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportButtons;
