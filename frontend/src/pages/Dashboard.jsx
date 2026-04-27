import { useState, useEffect, useCallback } from 'react';
import { getAllFiles, deleteFile } from '../services/api';
import { 
  FileText, Calendar, Search, 
  Trash2, ChevronLeft, ChevronRight, Plus, LayoutGrid, List as ListIcon
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Loader';
import Toast from '../components/ui/Toast';
import { Link, useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';

const Dashboard = () => {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [params, setParams] = useState({ page: 0, size: 8, search: '', date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await getAllFiles(params);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load history', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const load = async () => {
      await fetchHistory(false);
    };
    load();
  }, [fetchHistory]);

  const handleSearchChange = debounce((value) => {
    setParams(prev => ({ ...prev, search: value, page: 0 }));
  }, 500);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteFile(id);
      setToast({ message: 'Document deleted', type: 'success' });
      fetchHistory();
    } catch {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="p-10 animate-fade-in max-w-4xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Documents</h1>
          <p className="text-slate-400">Manage and view your OCR scan history</p>
        </div>
        <Link to="/upload">
          <Button icon={Plus}>New Scan</Button>
        </Link>
      </div>

      <div className="glass-card p-6 mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by filename or content..." 
              className="w-full pl-12 pr-4 py-3 bg-black/20 border-white/5 focus:border-primary/50"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <input 
            type="date" 
            className="bg-black/20 border-white/5 px-4 focus:border-primary/50"
            onChange={(e) => setParams(prev => ({ ...prev, date: e.target.value, page: 0 }))}
          />
        </div>
        <div className="flex bg-white/5 rounded-lg p-1">
          <button className="p-2 text-primary bg-white/5 rounded-md"><LayoutGrid size={18} /></button>
          <button className="p-2 text-slate-500 hover:text-white"><ListIcon size={18} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-4">
              <Skeleton height="160px" />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </div>
          ))}
        </div>
      ) : data.content.length === 0 ? (
        <div className="h-screen flex flex-col justify-center py-20 text-slate-500">
          <FileText size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-medium">No documents found</p>
          <p className="mt-2">Try a different search or upload a new file.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.content.map((item) => (
              <div 
                key={item.id} 
                className="glass-card p-4 group cursor-pointer hover:border-primary/50 transition-all hover:translate-y-[-4px]"
                onClick={() => navigate(`/result/${item.id}`)}
              >
                <div className="relative h-40 bg-black/40 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                  <FileText size={48} className="text-slate-700 group-hover:text-primary transition-colors" />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary">
                    {item.fileType || 'IMG'}
                  </div>
                </div>
                <h3 className="font-semibold truncate mb-1">{item.filename}</h3>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.uploadTime)}</span>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-slate-600 hover:text-error transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-12 px-2">
            <p className="text-sm text-slate-500">
              Showing <span className="text-white font-semibold">{data.content.length}</span> of <span className="text-white font-semibold">{data.totalElements}</span> results
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={params.page === 0}
                onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
                icon={ChevronLeft}
              >Previous</Button>
              <div className="flex items-center px-4 text-sm font-bold bg-white/5 rounded-lg border border-white/5">
                {params.page + 1} / {data.totalPages}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={params.page + 1 >= data.totalPages}
                onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
                icon={ChevronRight}
              >Next</Button>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Dashboard;
