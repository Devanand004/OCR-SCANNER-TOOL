import { useState } from 'react';
import { startOCR as triggerOCR, getOCRResult } from '../services/api';
import { Loader2, FileText, Copy, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import TextPostProcessing from './TextPostProcessing';

const OCRView = ({ fileId, processedUrl, onBack, onFinish }) => {
  const [status, setStatus] = useState('PENDING');
  const [extractedText, setExtractedText] = useState('');
  const [language, setLanguage] = useState('eng');
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const startOCR = async () => {
    try {
      setStatus('PROCESSING');
      setError(null);
      await triggerOCR(fileId, language);
      pollStatus();
    } catch {
      setError('Failed to start OCR processing. Ensure Tesseract is installed and configured.');
      setStatus('FAILED');
    }
  };

  const pollStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const response = await getOCRResult(fileId);
        const { status: currentStatus, text } = response.data;
        
        setStatus(currentStatus);
        
        if (currentStatus === 'COMPLETED') {
          setExtractedText(text);
          clearInterval(interval);
        } else if (currentStatus === 'FAILED') {
          setError('OCR Extraction failed.');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={16} /> Back to Enhancement
        </button>
        {status === 'COMPLETED' && (
          <button 
            onClick={onFinish} 
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Review Final Result <FileText size={16} style={{ marginLeft: '0.5rem' }} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Text Extraction</h2>
          <p className="subtitle">Convert images into editable text using Tesseract OCR</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="preview-container">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Optimized Image</p>
          <div className="preview-card" style={{ width: '100%', height: '300px' }}>
            <img src={processedUrl} alt="To Process" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Detection Language</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--glass-border)',
                color: 'white'
              }}
              disabled={status === 'PROCESSING'}
            >
              <option value="eng">English</option>
              <option value="tam">Tamil</option>
              <option value="hin">Hindi</option>
              <option value="eng+tam">English + Tamil</option>
            </select>

            {status !== 'COMPLETED' && (
              <button 
                className="btn-primary" 
                onClick={startOCR} 
                disabled={status === 'PROCESSING'}
                style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {status === 'PROCESSING' ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                {status === 'PROCESSING' ? 'Extracting Text...' : 'Start Extraction'}
              </button>
            )}
          </div>
        </div>

        <div className="preview-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Extracted Text</p>
            {status === 'COMPLETED' && (
              <button 
                onClick={copyToClipboard}
                style={{ background: 'none', border: 'none', color: isCopied ? 'var(--success)' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
              >
                {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {isCopied ? 'Copied!' : 'Copy Text'}
              </button>
            )}
          </div>
          <div className="preview-card" style={{ width: '100%', minHeight: '400px', background: 'rgba(0,0,0,0.3)', padding: '1rem', overflowY: 'auto' }}>
            {status === 'COMPLETED' ? (
              <TextPostProcessing 
                fileId={fileId} 
                rawText={extractedText} 
                onSaveSuccess={(edited) => setExtractedText(edited)} 
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
                {status === 'FAILED' ? (
                  <>
                    <AlertCircle size={48} color="var(--error)" />
                    <p style={{ marginTop: '1rem', color: 'var(--error)', textAlign: 'center' }}>{error}</p>
                  </>
                ) : status === 'PROCESSING' ? (
                  <>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Tesseract is analyzing the image...</p>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>Click 'Start Extraction' to begin</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRView;
