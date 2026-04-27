import { useState, useEffect, useMemo } from 'react';
import { fetchTextData, updateEditedText } from '../services/api';
import { Copy, Save, Check, AlertCircle, Loader2, Eye, Edit3, RotateCcw, Search, Languages } from 'lucide-react';
import debounce from 'lodash.debounce';
import ExportButtons from './ExportButtons';
import Translator from './Translator';

const TextEditor = ({ fileId }) => {
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'edit' | 'preview' | 'split'
  const [showTranslator, setShowTranslator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchTextData(fileId);
        const data = response.data;
        const initialText = data.editedText || data.processedText || '';
        setText(initialText);
        setOriginalText(data.processedText || '');
      } catch (err) {
        console.error("Failed to load text", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  const debouncedSave = useMemo(() => debounce(async (newText) => {
    setSaveStatus('saving');
    try {
      await updateEditedText(fileId, newText);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }, 2000), [fileId]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setSaveStatus('idle');
    debouncedSave(newText);
  };

  const handleManualSave = async () => {
    debouncedSave.cancel();
    setSaveStatus('saving');
    try {
      await updateEditedText(fileId, text);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const highlightedPreview = useMemo(() => {
    if (!text) return <p className="empty-text">No text to display</p>;

    let content = text;
    
    // Escape HTML to prevent XSS in preview
    content = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Highlight search term
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      content = content.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // Auto-highlight patterns (dates, emails)
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    content = content.replace(emailRegex, '<span class="email-highlight">$1</span>');

    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g;
    content = content.replace(dateRegex, '<span class="date-highlight">$1</span>');

    return (
      <div 
        className="preview-content" 
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} 
      />
    );
  }, [text, searchTerm]);

  if (isLoading) {
    return (
      <div className="editor-loader">
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
        <p>Fetching processed text...</p>
      </div>
    );
  }

  return (
    <div className="output-editor-container">
      <div className="editor-header">
        <div className="header-left">
          <div className="title-section">
            <h3>Output Display & Editor</h3>
            <span className="status-badge">
              {saveStatus === 'saving' && <><Loader2 className="animate-spin" size={14} /> Saving...</>}
              {saveStatus === 'success' && <><Check size={14} color="#10b981" /> All changes saved</>}
              {saveStatus === 'error' && <><AlertCircle size={14} color="#ef4444" /> Failed to save</>}
              {saveStatus === 'idle' && text !== originalText && <span className="unsaved">Unsaved changes</span>}
            </span>
          </div>
          
          <div className="view-toggles">
            <button 
              className={viewMode === 'edit' ? 'active' : ''} 
              onClick={() => setViewMode('edit')}
              title="Edit Mode"
            >
              <Edit3 size={16} /> Edit
            </button>
            <button 
              className={viewMode === 'preview' ? 'active' : ''} 
              onClick={() => setViewMode('preview')}
              title="Preview Mode"
            >
              <Eye size={16} /> Preview
            </button>
            <button 
              className={viewMode === 'split' ? 'active' : ''} 
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              Split
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className={`tool-btn ${showTranslator ? 'active' : ''}`} 
            onClick={() => setShowTranslator(!showTranslator)}
            title="Translate Text"
          >
            <Languages size={18} />
            <span>Translate</span>
          </button>
          <ExportButtons fileId={fileId} />
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Highlight keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="icon-btn" onClick={copyToClipboard} title="Copy to clipboard">
            {isCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button className="save-btn" onClick={handleManualSave} disabled={saveStatus === 'saving'}>
            <Save size={18} />
            <span>Save Now</span>
          </button>
        </div>
      </div>

      {showTranslator && <Translator text={text} />}

      <div className={`editor-body ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane">
            <textarea
              className="main-textarea"
              value={text}
              onChange={handleTextChange}
              placeholder="Start editing your extracted text here..."
              spellCheck="false"
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            {highlightedPreview}
          </div>
        )}
      </div>

      <div className="editor-footer">
        <div className="footer-left">
          <p className="char-count">{text.length} characters</p>
          <p className="line-count">{text.split('\n').length} lines</p>
        </div>
        <div className="footer-right">
          <button className="reset-btn" onClick={() => { if(window.confirm("Reset to original processed text? This will overwrite your current edits.")) setText(originalText); }}>
            <RotateCcw size={14} /> Reset to Original
          </button>
        </div>
      </div>

      <style jsx>{`
        .output-editor-container {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          margin-top: 1rem;
          height: 650px;
          color: #1e293b;
        }
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 15px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .title-section h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }
        .status-badge .unsaved {
          color: #f59e0b;
          font-style: italic;
        }
        .view-toggles {
          display: flex;
          background: #e2e8f0;
          padding: 3px;
          border-radius: 8px;
        }
        .view-toggles button {
          padding: 6px 12px;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .view-toggles button.active {
          background: white;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .action-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: #94a3b8;
        }
        .search-box input {
          padding: 8px 12px 8px 34px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
          width: 200px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-box input:focus {
          border-color: #2563eb;
        }
        .icon-btn, .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
        }
        .icon-btn:hover {
          background: #f1f5f9;
        }
        .save-btn {
          background: #2563eb;
          color: white;
          border: none;
        }
        .save-btn:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        .save-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .editor-body.split .editor-pane {
          border-right: 1px solid #e2e8f0;
        }
        .editor-pane, .preview-pane {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          background: #ffffff;
        }
        .preview-pane {
          padding: 24px;
          background: #fafafa;
        }
        .main-textarea {
          width: 100%;
          height: 100%;
          border: none;
          padding: 24px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          resize: none;
          outline: none;
        }
        .preview-content {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          white-space: pre-wrap;
          word-break: break-word;
        }
        :global(.search-highlight) {
          background-color: #fef08a;
          color: #854d0e;
          padding: 0 2px;
          border-radius: 2px;
        }
        :global(.email-highlight) {
          color: #2563eb;
          text-decoration: underline;
        }
        :global(.date-highlight) {
          color: #059669;
          font-weight: 500;
        }
        .empty-text {
          color: #94a3b8;
          text-align: center;
          margin-top: 100px;
        }
        .editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .footer-left {
          display: flex;
          gap: 20px;
        }
        .char-count, .line-count {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
        .reset-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .reset-btn:hover {
          text-decoration: underline;
        }
        .editor-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #64748b;
          gap: 15px;
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

export default TextEditor;
