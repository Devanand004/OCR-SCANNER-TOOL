import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle2, Scan, Camera } from 'lucide-react';
import { uploadFile } from '../services/api';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 10485760, // 10MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const response = await uploadFile(files[0], (progress) => {
        setUploadProgress(progress);
      });
      setToast({ message: 'Upload successful! Starting processing...', type: 'success' });
      setTimeout(() => navigate(`/processing/${response.data.id}`, {
        state: { storedFilename: response.data.storedFilename }
      }), 1000);
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Upload failed', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-10 animate-fade-in max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-slate-400">Scan your images or PDFs for text extraction</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div 
          {...getRootProps()} 
          className={`glass-card p-16 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer transition-all ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Upload className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragActive ? 'Drop your files here' : 'Click or drag files to upload'}
          </h3>
          <p className="text-slate-500 text-center max-w-sm">
            Support for high-resolution images (JPG, PNG) and PDF documents up to 10MB.
          </p>
        </div>

        {files.length > 0 && (
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 size={20} className="text-success" />
                Selected Files ({files.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setFiles([])} icon={X}>Clear All</Button>
            </div>
            
            <div className="space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                    {file.type.includes('image') ? (
                      <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="text-slate-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" icon={X} onClick={() => setFiles(files.filter((_, idx) => idx !== i))} />
                </div>
              ))}
            </div>

            {isUploading && (
              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-xs font-bold text-primary">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {!isUploading && (
              <div className="mt-8 flex gap-4">
                <Button className="flex-1" onClick={handleUpload} isLoading={isUploading}>
                  Start OCR Process
                </Button>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-primary flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Camera size={24} /></div>
          <div>
            <h5 className="font-bold mb-1">Camera Mode</h5>
            <p className="text-sm text-slate-500 mb-4">Capture documents directly using your webcam.</p>
            <Button variant="secondary" size="sm" onClick={() => navigate('/live')}>Open Camera</Button>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-indigo-400 flex items-start gap-4">
          <div className="p-3 bg-indigo-400/10 rounded-xl text-indigo-400"><Scan size={24} /></div>
          <div>
            <h5 className="font-bold mb-1">Live Detection</h5>
            <p className="text-sm text-slate-500 mb-4">Real-time text detection from video stream.</p>
            <Button variant="secondary" size="sm" onClick={() => navigate('/live')}>Start Live OCR</Button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UploadPage;
