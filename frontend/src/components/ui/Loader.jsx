import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, color = 'var(--primary)', className = '' }) => (
  <Loader2 
    className={`animate-spin ${className}`} 
    size={size} 
    style={{ color }} 
  />
);

export const Skeleton = ({ width = '100%', height = '20px', className = '' }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ 
      width, 
      height, 
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div className="skeleton-shimmer" />
    <style jsx>{`
      .skeleton-shimmer {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export const PageLoader = () => (
  <div className="fixed inset-0 bg-bg-main/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size={48} />
      <p className="text-slate-400 font-medium">Loading application...</p>
    </div>
  </div>
);
