import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTextData, updateEditedText, getOCRResult } from '../services/api';
import { 
  ArrowLeft, Languages, Edit3, 
  CheckCircle2, Copy, Save, Loader2, Maximize2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import Translator from '../components/Translator';
import ExportButtons from '../components/ExportButtons';

const OCRResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('EDITOR'); // 'EDITOR', 'TRANSLATOR'

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [textRes, ocrRes] = await Promise.all([
          fetchTextData(id),
          getOCRResult(id)
        ]);
        setData({ ...textRes.data, ...ocrRes.data });
        setEditedText(textRes.data.editedText || textRes.data.processedText || '');
      } catch (err) {
        console.error(err);
        setToast({ message: 'Failed to load document', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEditedText(id, editedText);
      setToast({ message: 'Changes saved successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Save failed', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedText);
    setToast({ message: 'Copied to clipboard', type: 'success' });
  };

  const formattedLastEdited = useMemo(() => {
    if (!data || !data.lastUpdated) return '';
    return new Date(data.lastUpdated).toLocaleDateString();
  }, [data]);

  if (isLoading) {
    return (
      <div className="ml-64 p-10 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-slate-400 font-medium">Loading document data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-10 py-4 border-b border-white/5 bg-black/10 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold truncate max-w-[300px]">{data.filename}</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span className="text-primary">{data.status}</span>
              <span>•</span>
              <span>Last edited {formattedLastEdited}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={Copy} onClick={copyToClipboard}>Copy</Button>
          <Button size="sm" icon={Save} isLoading={isSaving} onClick={handleSave}>Save Changes</Button>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <ExportButtons fileId={id} />
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image Preview */}
        <div className="flex-1 bg-black/40 p-8 flex flex-col overflow-hidden border-r border-white/5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Source Document</p>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Maximize2 size={16} /></button>
          </div>
          <div className="flex-1 glass-card overflow-hidden relative group">
            <img 
              src={`http://localhost:8080/uploads/${data.storedFilename}`} 
              alt="Source" 
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* Right: Text Content & Tools */}
        <div className="w-[500px] xl:w-[600px] flex flex-col bg-bg-main overflow-hidden">
          {/* Tabs */}
          <div className="flex px-6 pt-6 gap-2">
            <button 
              onClick={() => setActiveTab('EDITOR')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${
                activeTab === 'EDITOR' ? 'bg-white/5 text-primary border-t-2 border-primary' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Edit3 size={16} /> Editor
            </button>
            <button 
              onClick={() => setActiveTab('TRANSLATOR')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${
                activeTab === 'TRANSLATOR' ? 'bg-white/5 text-indigo-400 border-t-2 border-indigo-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Languages size={16} /> Translation
            </button>
          </div>

          <div className="flex-1 bg-white/5 mx-6 mb-6 rounded-b-xl rounded-tr-xl p-6 flex flex-col border border-white/5">
            {activeTab === 'EDITOR' ? (
              <div className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed text-slate-200"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                />
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {editedText.length} Characters • {editedText.split(/\s+/).filter(Boolean).length} Words
                  </span>
                  <div className="flex gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-success" /> Auto-saved</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <Translator text={editedText} />
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OCRResultPage;
