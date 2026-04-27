import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, StopCircle, RefreshCw, Scan, PlayCircle, Loader2 } from 'lucide-react';
import { performLiveOCR } from '../services/api';

const CameraOCR = () => {
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAutoCapture, setIsAutoCapture] = useState(false);
  const [intervalTime, setIntervalTime] = useState(3000); // 3 seconds
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [error, setError] = useState(null);

  const isProcessing = useRef(false);

  // Helper to compress image
  const compressImage = (base64Str, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality
      };
    });
  };

  // Manual Capture and OCR
  const captureAndProcess = useCallback(async () => {
    if (!webcamRef.current || isProcessing.current) return;
    
    isProcessing.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get high-quality screenshot
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // 2. Downscale and compress using canvas
      const compressedImage = await compressImage(imageSrc, 800, 600);

      // 3. Send optimized payload
      const response = await performLiveOCR(compressedImage);
      if (response.data.text) {
        setExtractedText(prev => prev + '\n' + response.data.text);
      }
    } catch (err) {
      console.error("Live OCR capture failed", err);
      setError("Failed to process frame");
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  }, [webcamRef]);

  // Auto-capture loop
  useEffect(() => {
    let interval;
    if (isCameraActive && isAutoCapture) {
      interval = setInterval(() => {
        if (!isProcessing.current) {
          captureAndProcess();
        }
      }, intervalTime);
    }
    return () => clearInterval(interval);
  }, [isCameraActive, isAutoCapture, intervalTime, captureAndProcess]);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    setExtractedText('');
    setError(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="camera-ocr-container">
      <div className="camera-ocr-header">
        <div className="title-section">
          <h2>Live Camera OCR</h2>
          <p>Instant text detection from your camera feed</p>
        </div>
        <div className="controls-main">
          <button 
            className={`btn-action ${isCameraActive ? 'active' : ''}`} 
            onClick={toggleCamera}
          >
            {isCameraActive ? <StopCircle size={20} /> : <PlayCircle size={20} />}
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </button>
          {isCameraActive && (
            <button className="btn-secondary" onClick={switchCamera}>
              <RefreshCw size={18} /> Switch
            </button>
          )}
        </div>
      </div>

      <div className="camera-ocr-body">
        <div className="viewport-section">
          {isCameraActive ? (
            <div className="webcam-wrapper">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode }}
                className="webcam-view"
              />
              <div className="scan-overlay">
                <div className="scan-reticle"></div>
              </div>
              {isLoading && (
                <div className="ocr-loading-overlay">
                  <Loader2 className="animate-spin" size={32} />
                  <span>Analyzing...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="camera-placeholder">
              <Camera size={64} opacity={0.2} />
              <p>Camera is currently inactive</p>
            </div>
          )}

          {isCameraActive && (
            <div className="capture-controls">
              <div className="settings-panel">
                <div className="setting-item">
                  <label>Auto Capture</label>
                  <input 
                    type="checkbox" 
                    checked={isAutoCapture} 
                    onChange={(e) => setIsAutoCapture(e.target.checked)} 
                  />
                </div>
                <div className="setting-item">
                  <label>Interval (ms)</label>
                  <select 
                    value={intervalTime} 
                    onChange={(e) => setIntervalTime(Number(e.target.value))}
                    disabled={!isAutoCapture}
                  >
                    <option value={1000}>1s</option>
                    <option value={2000}>2s</option>
                    <option value={3000}>3s</option>
                    <option value={5000}>5s</option>
                  </select>
                </div>
              </div>
              <button className="btn-capture-manual" onClick={captureAndProcess} disabled={isLoading}>
                <Scan size={24} />
                <span>Capture Now</span>
              </button>
            </div>
          )}
        </div>

        <div className="result-section">
          <div className="result-header">
            <h3>Extracted Text</h3>
            <button className="clear-btn" onClick={() => setExtractedText('')}>Clear</button>
          </div>
          <div className="text-display-box">
            {extractedText ? (
              <pre>{extractedText}</pre>
            ) : (
              <p className="placeholder-text">Extracted text will appear here...</p>
            )}
          </div>
          {error && <div className="ocr-error-msg">{error}</div>}
        </div>
      </div>

      <style jsx>{`
        .camera-ocr-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 24px;
          margin-top: 20px;
          color: white;
        }
        .camera-ocr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .title-section h2 { margin: 0; font-size: 1.5rem; }
        .title-section p { margin: 4px 0 0; font-size: 0.9rem; opacity: 0.6; }
        
        .controls-main { display: flex; gap: 12px; }
        .btn-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background: #6366f1;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action.active { background: #ef4444; }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .camera-ocr-body {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }
        
        .webcam-wrapper {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: black;
          aspect-ratio: 4/3;
        }
        .webcam-view {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .scan-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .scan-reticle {
          width: 70%;
          height: 50%;
          border: 2px solid #6366f1;
          border-radius: 12px;
          box-shadow: 0 0 0 1000px rgba(0,0,0,0.4);
          position: relative;
        }
        .scan-reticle::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 2px;
          background: #6366f1;
          box-shadow: 0 0 15px #6366f1;
          animation: scanLine 2s linear infinite;
        }
        @keyframes scanLine {
          0% { top: 0; }
          100% { top: 100%; }
        }

        .ocr-loading-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .camera-placeholder {
          aspect-ratio: 4/3;
          background: rgba(0,0,0,0.2);
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          opacity: 0.5;
        }

        .capture-controls {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .settings-panel {
          display: flex;
          gap: 20px;
          background: rgba(255,255,255,0.05);
          padding: 12px 20px;
          border-radius: 12px;
        }
        .setting-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
        .setting-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        .setting-item select {
          background: #1e293b;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 4px 8px;
        }

        .btn-capture-manual {
          background: white;
          color: black;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-capture-manual:hover:not(:disabled) { background: #e2e8f0; transform: scale(1.02); }
        .btn-capture-manual:disabled { opacity: 0.5; }

        .result-section {
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .result-header h3 { margin: 0; font-size: 1.1rem; }
        .clear-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .text-display-box {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          overflow-y: auto;
          max-height: 400px;
          font-family: monospace;
          line-height: 1.5;
        }
        .placeholder-text { opacity: 0.3; font-style: italic; font-size: 0.9rem; }
        .ocr-error-msg { margin-top: 12px; color: #ef4444; font-size: 0.85rem; }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .camera-ocr-body { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CameraOCR;
