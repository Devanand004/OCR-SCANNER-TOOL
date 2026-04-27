import { useState, useEffect, useCallback } from 'react';
import { getAllFiles, deleteFile } from '../services/api';
import { 
  FileText, Calendar, ArrowRight, Loader2, Search, 
  Trash2, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import debounce from 'lodash.debounce';

const HistoryDashboard = ({ onSelectFile }) => {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [params, setParams] = useState({ page: 0, size: 8, search: '', date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllFiles(params);
      setData(response.data);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
      setError("Failed to load scan history");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const load = async () => {
      await fetchHistory();
    };
    load();
  }, [fetchHistory]);

  const handleSearchChange = debounce((value) => {
    setParams(prev => ({ ...prev, search: value, page: 0 }));
  }, 500);

  const handleDateChange = (value) => {
    setParams(prev => ({ ...prev, date: value, page: 0 }));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this scan?")) return;
    
    try {
      await deleteFile(id);
      fetchHistory();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="title-area">
          <h2>Scan Dashboard</h2>
          <p>Manage and search your previously processed documents</p>
        </div>
        
        <div className="filters-area">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search filename or content..." 
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="date-filter">
            <Calendar size={18} />
            <input 
              type="date" 
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="dashboard-state">
          <Loader2 className="animate-spin" size={40} color="#6366f1" />
          <p>Fetching records...</p>
        </div>
      ) : error ? (
        <div className="dashboard-state error">
          <AlertCircle size={40} />
          <p>{error}</p>
          <button onClick={fetchHistory}>Retry</button>
        </div>
      ) : data.content.length === 0 ? (
        <div className="dashboard-state empty">
          <FileText size={64} opacity={0.2} />
          <p>No scans match your criteria</p>
        </div>
      ) : (
        <>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((item) => (
                  <tr key={item.id} onClick={() => onSelectFile(item)}>
                    <td>
                      <div className="doc-col">
                        <div className="doc-icon"><FileText size={16} /></div>
                        <span>{item.filename}</span>
                      </div>
                    </td>
                    <td><span className="text-preview">{item.textPreview || "No text extracted"}</span></td>
                    <td>
                      <div className="date-col">
                        <span>{formatDate(item.uploadTime)}</span>
                        <small>{new Date(item.uploadTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-tag ${item.ocrStatus.toLowerCase()}`}>
                        {item.ocrStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-col">
                        <button className="del-btn" onClick={(e) => handleDelete(e, item.id)}>
                          <Trash2 size={16} />
                        </button>
                        <ArrowRight size={16} className="go-icon" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-footer">
            <div className="info">
              Showing {data.content.length} of {data.totalElements} records
            </div>
            <div className="nav">
              <button 
                disabled={params.page === 0} 
                onClick={() => setParams(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="page-info">Page {params.page + 1} of {data.totalPages}</span>
              <button 
                disabled={params.page + 1 >= data.totalPages} 
                onClick={() => setParams(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .dashboard-container { padding: 10px; }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        .title-area h2 { margin: 0; font-size: 1.6rem; }
        .title-area p { margin: 4px 0 0; color: #94a3b8; font-size: 0.9rem; }

        .filters-area { display: flex; gap: 12px; }
        .search-bar, .date-filter {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px 14px;
          gap: 10px;
        }
        .search-bar input, .date-filter input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 0.85rem;
        }
        .search-bar { width: 260px; }

        .history-table-wrapper {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .history-table th {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px 20px;
          font-size: 0.8rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .history-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .history-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
        .history-table tr:last-child td { border-bottom: none; }

        .doc-col { display: flex; align-items: center; gap: 12px; font-weight: 600; }
        .doc-icon {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          padding: 8px;
          border-radius: 8px;
        }
        .text-preview {
          display: block;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .date-col { display: flex; flex-direction: column; gap: 2px; }
        .date-col small { opacity: 0.5; font-size: 0.75rem; }

        .status-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .status-tag.completed { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status-tag.pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

        .action-col { display: flex; align-items: center; gap: 16px; justify-content: flex-end; }
        .del-btn {
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .del-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .go-icon { color: #475569; opacity: 0; transition: all 0.2s; }
        .history-table tr:hover .go-icon { opacity: 1; transform: translateX(4px); color: #818cf8; }

        .pagination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding: 0 10px;
        }
        .pagination-footer .info { color: #64748b; font-size: 0.85rem; }
        .pagination-footer .nav { display: flex; align-items: center; gap: 16px; }
        .nav button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .nav button:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-info { font-size: 0.9rem; font-weight: 600; }

        .dashboard-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 16px;
          color: #94a3b8;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HistoryDashboard;
