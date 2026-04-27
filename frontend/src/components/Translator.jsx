import { useState } from 'react';
import { Languages, ArrowRight, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { translateText } from '../services/api';

const LANGUAGES = [
  { code: 'ta', name: 'Tamil' },
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

const Translator = ({ text }) => {
  const [targetLang, setTargetLang] = useState('ta');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await translateText(text, targetLang);
      setTranslatedText(response.data.translatedText);
    } catch (err) {
      console.error("Translation failed", err);
      setError("Failed to translate text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="translator-container">
      <div className="translator-header">
        <div className="header-left">
          <Languages size={20} color="#6366f1" />
          <h3>Translation Module</h3>
        </div>
        <div className="language-selector">
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <button 
            className="btn-translate" 
            onClick={handleTranslate}
            disabled={isLoading || !text}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            Translate
          </button>
        </div>
      </div>

      <div className="translator-body">
        <div className="original-preview">
          <label>Source Text</label>
          <div className="preview-box">{text || "No text provided..."}</div>
        </div>
        
        <div className="translated-output">
          <div className="output-label-row">
            <label>Translated Text ({LANGUAGES.find(l => l.code === targetLang)?.name})</label>
            {translatedText && (
              <button className="icon-btn" onClick={copyToClipboard}>
                {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            )}
          </div>
          <div className={`output-box ${isLoading ? 'loading' : ''}`}>
            {translatedText ? (
              <p>{translatedText}</p>
            ) : (
              <p className="placeholder">Translated text will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="translator-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .translator-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-top: 20px;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .translator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header-left h3 { margin: 0; font-size: 1.1rem; }
        
        .language-selector { display: flex; gap: 10px; }
        .language-selector select {
          background: rgba(0, 0, 0, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px 12px;
          outline: none;
        }
        .btn-translate {
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-translate:hover:not(:disabled) { background: #4f46e5; }
        .btn-translate:disabled { opacity: 0.5; cursor: not-allowed; }

        .translator-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .original-preview, .translated-output {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
        .preview-box, .output-box {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 12px;
          min-height: 120px;
          font-size: 0.9rem;
          line-height: 1.6;
          overflow-y: auto;
          max-height: 200px;
        }
        .output-box.loading { opacity: 0.6; }
        .output-label-row { display: flex; justify-content: space-between; align-items: center; }
        .icon-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.05); color: white; }
        
        .placeholder { opacity: 0.3; font-style: italic; }
        .translator-error {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 12px;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .translator-body { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Translator;
