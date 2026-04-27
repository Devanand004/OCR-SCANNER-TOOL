import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProcessingView from '../components/ProcessingView';
import OCRView from '../components/OCRView';
import { getFileMetadata } from '../services/api';

const ProcessingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [originalUrl, setOriginalUrl] = useState(() => {
    const storedFilename = location.state?.storedFilename;
    return storedFilename ? `http://localhost:8080/uploads/${storedFilename}` : null;
  });
  const [processedUrl, setProcessedUrl] = useState(null);
  const [step, setStep] = useState('processing'); // processing | ocr
  const [loading, setLoading] = useState(() => !location.state?.storedFilename);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (originalUrl) return;

    const loadMetadata = async () => {
      setLoading(true);
      try {
        const response = await getFileMetadata(Number(id));
        setOriginalUrl(`http://localhost:8080/uploads/${response.data.storedFilename}`);
      } catch (err) {
        console.error(err);
        setError('Unable to load file metadata.');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [id, location.state, originalUrl]);

  const handleNext = (url) => {
    setProcessedUrl(url);
    setStep('ocr');
  };

  const handleFinish = () => {
    navigate(`/result/${id}`);
  };

  if (loading) {
    return (
      <div className="ml-64 p-10">Loading processing data...</div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 p-10 text-red-400">{error}</div>
    );
  }

  return (
    <div className="ml-64 p-10 min-h-screen">
      {step === 'processing' ? (
        <ProcessingView fileId={Number(id)} originalUrl={originalUrl} onNext={handleNext} />
      ) : (
        <OCRView
          fileId={Number(id)}
          processedUrl={processedUrl || originalUrl}
          onBack={() => setStep('processing')}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
};

export default ProcessingPage;
