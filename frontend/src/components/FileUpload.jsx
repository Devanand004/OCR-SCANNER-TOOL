import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Camera, FileText, CheckCircle2, AlertCircle, History, ArrowLeft, Scan } from 'lucide-react';
import Webcam from 'react-webcam';
import { uploadFile } from '../services/api';
import ProcessingView from './ProcessingView';
import OCRView from './OCRView';
import TextEditor from './TextEditor';
import HistoryDashboard from './HistoryDashboard';
import CameraOCR from './CameraOCR';
import { useAuth } from '../context/useAuth';
import { LogOut } from 'lucide-react';

const FileUpload = () => {
  const { logout, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [uploadedFile, setUploadedFile] = useState(null); // To store {id, url}
  const [currentView, setCurrentView] = useState('UPLOAD'); // 'UPLOAD', 'PROCESSING', 'OCR', 'OUTPUT', 'HISTORY'
  const [processedUrl, setProcessedUrl] = useState(null);
  
  const webcamRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
    setStatus({ type: '', message: '' });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFiles(prev => [...prev, Object.assign(file, {
          preview: URL.createObjectURL(file)
        })]);
        setIsCameraOpen(false);
      });
  }, [webcamRef]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const response = await uploadFile(files[0], (progress) => {
        setUploadProgress(progress);
      });
      
      setStatus({ 
        type: 'success', 
        message: `Successfully uploaded ${response.data.filename}!` 
      });
      
      setUploadedFile({
        id: response.data.id,
        url: `http://localhost:8080/uploads/${response.data.storedFilename}`
      });
      setCurrentView('PROCESSING');
      
      setFiles([]);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Upload failed. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectFromHistory = (file) => {
    setUploadedFile({
      id: file.id,
      url: `http://localhost:8080/uploads/${file.storedFilename}`
    });
    // If it's already completed, go to OUTPUT, else go to PROCESSING/OCR
    if (file.ocrStatus === 'COMPLETED') {
      setCurrentView('OUTPUT');
    } else {
      setCurrentView('PROCESSING');
    }
  };

  if (currentView === 'HISTORY') {
    return (
      <div className="card">
        <button 
          onClick={() => setCurrentView('UPLOAD')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Upload
        </button>
        <HistoryDashboard onSelectFile={handleSelectFromHistory} />
      </div>
    );
  }

  if (currentView === 'LIVE_OCR') {
    return (
      <div className="card">
        <button 
          onClick={() => setCurrentView('UPLOAD')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Upload
        </button>
        <CameraOCR />
      </div>
    );
  }

  if (currentView === 'OCR' && uploadedFile) {
    return (
      <OCRView 
        fileId={uploadedFile.id} 
        processedUrl={processedUrl}
        onBack={() => setCurrentView('PROCESSING')}
        onFinish={() => setCurrentView('OUTPUT')}
      />
    );
  }

  if (currentView === 'OUTPUT' && uploadedFile) {
    return (
      <div className="card">
         <button 
          onClick={() => setCurrentView('UPLOAD')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <TextEditor fileId={uploadedFile.id} />
      </div>
    );
  }

  if (currentView === 'PROCESSING' && uploadedFile) {
    return (
      <ProcessingView 
        fileId={uploadedFile.id} 
        originalUrl={uploadedFile.url} 
        onNext={(url) => {
          setProcessedUrl(url);
          setCurrentView('OCR');
        }}
      />
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            OCR Scanner
            <span style={{ fontSize: '0.9rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>
              Hi, {user?.username}
            </span>
          </h1>
          <p className="subtitle">Upload documents or images for instant text extraction</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn-logout" 
            onClick={logout}
            title="Logout"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={20} />
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setCurrentView('LIVE_OCR')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer' }}
          >
            <Scan size={20} />
            Live OCR
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setCurrentView('HISTORY')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer' }}
          >
            <History size={20} />
            Scan History
          </button>
          <button 
            className="btn-capture" 
            onClick={() => setIsCameraOpen(!isCameraOpen)}
            style={{ background: isCameraOpen ? 'var(--error)' : 'white', color: isCameraOpen ? 'white' : 'black' }}
          >
            {isCameraOpen ? <X size={20} /> : <Camera size={20} />}
            {isCameraOpen ? 'Close Camera' : 'Camera Input'}
          </button>
        </div>
      </div>

      {isCameraOpen && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
          />
          <div className="camera-controls">
            <button className="btn-capture" onClick={capture}>
              <Camera size={20} /> Capture Photo
            </button>
          </div>
        </div>
      )}

      {!isCameraOpen && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <Upload className="dropzone-icon" />
          <h3>{isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Supports JPG, PNG, PDF (Max 10MB)
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="preview-grid">
          {files.map((file, index) => (
            <div key={index} className="preview-card">
              {file.type.includes('image') ? (
                <img src={file.preview} alt="preview" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(255,255,255,0.05)' }}>
                  <FileText size={48} color="var(--primary)" />
                  <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center', padding: '0 0.5rem' }}>{file.name}</span>
                </div>
              )}
              <div className="overlay">
                <button className="btn-remove" onClick={() => removeFile(index)}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {status.message && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {status.type === 'success' ? <CheckCircle2 size={20} color="var(--success)" /> : <AlertCircle size={20} color="var(--error)" />}
          <span style={{ color: status.type === 'success' ? 'var(--success)' : 'var(--error)' }}>{status.message}</span>
        </div>
      )}

      {files.length > 0 && !isUploading && (
        <button 
          className="btn-primary" 
          onClick={handleUpload}
          style={{ marginTop: '2rem' }}
        >
          Process {files.length} {files.length === 1 ? 'File' : 'Files'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
