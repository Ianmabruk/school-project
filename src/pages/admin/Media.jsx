import { useState, useEffect, useRef } from 'react';
import { get, uploadFile, remove as apiRemove } from '../../services/api';
import './AdminMedia.css';

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadMedia = async () => {
      try {
        const data = await get('/api/media');
        if (!cancelled) setMedia(data);
      } catch { /* ignore */ }
    };
    loadMedia();
    return () => { cancelled = true; };
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setMedia([result, ...media]);
      setMessage('File uploaded');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await apiRemove(`/api/media/${id}`);
      setMedia(media.filter(m => m.id !== id));
      setMessage('File deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Media</h1>
      <p className="admin-subtitle">Manage images and videos for your website.</p>
      {message && <div className={message.includes('uploaded') || message.includes('deleted') ? 'success' : 'error'}>{message}</div>}

      <div className="upload-area">
        <label className="upload-label">
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} hidden />
          <span className="upload-btn">{uploading ? 'Uploading...' : 'Upload File'}</span>
        </label>
      </div>

      <div className="media-grid">
        {media.map(item => (
          <div key={item.id} className="media-card">
            <div className="media-preview">
              {item.mime_type?.startsWith('video/') ? (
                <video src={item.url} muted />
              ) : (
                <img src={item.url} alt={item.original_name} onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="%23F5E6C8" width="200" height="150"/><text fill="%23F28C28" x="100" y="80" text-anchor="middle">No Preview</text></svg>'; }} />
              )}
            </div>
            <div className="media-info">
              <p className="media-name">{item.original_name}</p>
              <p className="media-meta">{(item.size / 1024).toFixed(1)} KB</p>
              <button onClick={() => handleDelete(item.id)} className="btn-secondary delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
