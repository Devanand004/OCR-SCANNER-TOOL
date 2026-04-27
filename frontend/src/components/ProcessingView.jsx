import { useState, useEffect, useCallback } from 'react';
import { startPreprocessing, getProcessingStatus } from '../services/api';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

const ProcessingView = ({ fileId, originalUrl, onNext }) => {
  const [status, setStatus] = useState('PENDING');
  const [processedUrl, setProcessedUrl] = useState(null);
  const [error, setError] = useState(null);

  const pollStatus = useCallback(async () => {
    const interval = setInterval(async () => {
      try {
        const response = await getProcessingStatus(fileId);
        const { status: currentStatus, processedUrl: path } = response.data;
        
        setStatus(currentStatus);
        
        if (currentStatus === 'COMPLETED') {
          // Convert system path to URL
          const filename = path.split('\\').pop().split('/').pop();
          // If it's a PDF, path might be the same as original
          if (filename.toLowerCase().endsWith('.pdf')) {
            setProcessedUrl(originalUrl);
          } else {
            setProcessedUrl(`http://localhost:8080/processed/${filename}`);
          }
          clearInterval(interval);
        } else if (currentStatus === 'FAILED') {
          setError('Processing failed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fileId, originalUrl]);

  const startProcessing = useCallback(async () => {
    try {
      setStatus('PROCESSING');
      await startPreprocessing(fileId);
      pollStatus();
    } catch {
      setError('Failed to start processing');
      setStatus('FAILED');
    }
  }, [fileId, pollStatus]);

  useEffect(() => {
    const load = async () => {
      await startProcessing();
    };
    load();
  }, [startProcessing]);

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Image Enhancement</h2>
          <p className="subtitle">Optimizing image quality for better OCR accuracy</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {status === 'PROCESSING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Loader2 className="animate-spin" size={20} />
              <span>Enhancing...</span>
            </div>
          )}
          {status === 'COMPLETED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
              <span>Optimized</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="preview-container">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Original Image</p>
          <div className="preview-card" style={{ width: '100%', height: '300px' }}>
            <img src={originalUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="preview-container">
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Enhanced (for OCR)</p>
          <div className="preview-card" style={{ width: '100%', height: '300px', background: 'rgba(0,0,0,0.2)' }}>
            {status === 'COMPLETED' ? (
              <img src={processedUrl} alt="Processed" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {status === 'FAILED' ? (
                  <>
                    <AlertCircle size={48} color="var(--error)" />
                    <p style={{ marginTop: '1rem', color: 'var(--error)' }}>{error}</p>
                    <button className="btn-primary" onClick={startProcessing} style={{ marginTop: '1rem', width: 'auto' }}>
                      <RefreshCw size={16} /> Retry
                    </button>
                  </>
                ) : (
                  <>
                    <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Applying filters...</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {status === 'COMPLETED' && (
        <button className="btn-primary" onClick={() => onNext(processedUrl)} style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          Proceed to OCR Text Extraction <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default ProcessingView;
