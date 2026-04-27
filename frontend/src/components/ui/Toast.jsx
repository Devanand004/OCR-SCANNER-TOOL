import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="text-success" size={20} />,
    error: <AlertCircle className="text-error" size={20} />,
    info: <Info className="text-info" size={20} />
  };

  const bgColors = {
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)'
  };

  const borderColors = {
    success: 'rgba(16, 185, 129, 0.2)',
    error: 'rgba(239, 68, 68, 0.2)',
    info: 'rgba(59, 130, 246, 0.2)'
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] animate-fade-in flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl"
      style={{ 
        backgroundColor: bgColors[type], 
        borderColor: borderColors[type],
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      {icons[type]}
      <p className="text-sm font-medium text-white pr-6">{message}</p>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
