import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Heart,
  Trash2,
  Edit3,
  X,
  Shirt,
  Sparkles,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' }
];

const SEASONS = ['all-season', 'spring', 'summer', 'fall', 'winter'];

// Helper to resize uploaded images to ensure crisp display without huge payload
const compressImage = (file, maxWidth = 1000, maxHeight = 1000) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Wardrobe() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tops',
    color: '',
    season: 'all-season',
    occasion: '',
    imageUrl: '',
    isFavorite: false
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      let query = `?category=${selectedCategory}`;
      if (selectedSeason !== 'all') query += `&season=${selectedSeason}`;
      if (onlyFavorites) query += `&isFavorite=true`;

      const res = await api.get(`/wardrobe${query}`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to load wardrobe:', err);
      setError('Please sign in or check your connection to view your wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedSeason, onlyFavorites]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setUploadMode('file');
    setFormData({
      name: '',
      description: '',
      category: 'tops',
      color: '',
      season: 'all-season',
      occasion: '',
      imageUrl: '',
      isFavorite: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setUploadMode(item.imageUrl?.startsWith('data:') ? 'file' : 'url');
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      color: item.color || '',
      season: item.season || 'all-season',
      occasion: item.occasion || '',
      imageUrl: item.imageUrl || '',
      isFavorite: item.isFavorite || false
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const base64 = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Could not process this image file. Please try another one.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingItem) {
        const res = await api.patch(`/wardrobe/${editingItem._id}`, formData);
        setItems(items.map(i => i._id === editingItem._id ? res.data.item : i));
      } else {
        const res = await api.post('/wardrobe', formData);
        setItems([res.data.item, ...items]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save wardrobe item.');
    }
  };

  const toggleFavorite = async (item) => {
    try {
      const updated = !item.isFavorite;
      const res = await api.patch(`/wardrobe/${item._id}`, { isFavorite: updated });
      setItems(items.map(i => i._id === item._id ? res.data.item : i));
    } catch (err) {
      console.error('Could not toggle favorite:', err);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/wardrobe/${itemToDelete._id}`);
      setItems(items.filter(i => i._id !== itemToDelete._id));
      setItemToDelete(null);
    } catch (err) {
      alert('Could not delete item.');
    }
  };

  return (
    <div className="main-wrapper">
      <Header
        title="My Wardrobe"
        subtitle="Find a look that feels like you. Organize, cherish, and style."
      />

      {/* Control Bar: Filters & Add Button */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={onlyFavorites ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            title="Show only favorites"
          >
            <Heart size={14} fill={onlyFavorites ? 'currentColor' : 'none'} />
            Favorites
          </button>

          <button onClick={handleOpenAddModal} className="btn-primary">
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Items Gallery */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted-color)' }}>
          <Sparkles className="spin" size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p>Curating your wardrobe closet...</p>
        </div>
      ) : items.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            maxWidth: '540px',
            margin: '40px auto'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-light)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}
          >
            <Shirt size={30} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Your wardrobe is waiting</h3>
          <p style={{ color: 'var(--muted-color)', marginBottom: '22px', fontSize: '0.92rem' }}>
            {onlyFavorites
              ? 'No favorite items found. Mark the heart on items you love to find them here!'
              : 'Add your favorite sweaters, beloved dresses, comfy sneakers, and everyday staples.'}
          </p>
          <button onClick={handleOpenAddModal} className="btn-primary">
            <Plus size={16} />
            Add First Item
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {items.map(item => (
            <div
              key={item._id}
              className="glass-panel"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all var(--transition-normal)'
              }}
            >
              {/* Image Container with robust display */}
              <div
                style={{
                  height: '250px',
                  width: '100%',
                  position: 'relative',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted-color)',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <Shirt size={40} opacity={0.4} />
                    <span style={{ fontSize: '0.8rem' }}>No image added</span>
                  </div>
                )}

                {/* Floating Favorite Heart */}
                <button
                  onClick={() => toggleFavorite(item)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: item.isFavorite ? '#e11d48' : '#71717a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  title={item.isFavorite ? 'Remove favorite' : 'Add to favorites'}
                >
                  <Heart size={18} fill={item.isFavorite ? '#e11d48' : 'none'} />
                </button>

                {/* Category Pill */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Item Info */}
              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{item.name}</h4>
                {item.description && (
                  <p style={{ color: 'var(--muted-color)', fontSize: '0.86rem', marginBottom: '12px', flex: 1 }}>
                    {item.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    fontSize: '0.78rem',
                    color: 'var(--muted-color)',
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  {item.color && <span>🎨 {item.color}</span>}
                  {item.season && <span>• 🌿 {item.season}</span>}
                  {item.occasion && <span>• ✨ {item.occasion}</span>}
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '12px'
                  }}
                >
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#e11d48' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal with File Upload & Live Preview */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '28px',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>
                {editingItem ? 'Edit Wardrobe Item' : 'Add to Wardrobe'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-color)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* IMAGE UPLOAD & LIVE PREVIEW SECTION */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Item Photo
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      <Upload size={12} />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      <LinkIcon size={12} />
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Upload from Computer */}
                {uploadMode === 'file' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'var(--input-bg)',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      <Upload size={28} color="var(--accent-color)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {uploadingImage ? 'Processing image...' : 'Click to browse image from your computer'}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted-color)', marginTop: '2px' }}>
                        Supports JPG, PNG, WEBP, GIF
                      </p>
                    </div>
                  </div>
                )}

                {/* Enter Image URL */}
                {uploadMode === 'url' && (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.92rem'
                    }}
                  />
                )}

                {/* Live Preview Box */}
                {formData.imageUrl && (
                  <div
                    style={{
                      marginTop: '12px',
                      position: 'relative',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: '160px',
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      ✓ Image ready
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oatmeal Cableknit Sweater"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.92rem'
                    }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Butter Cream, Sage"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Season
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.92rem'
                    }}
                  >
                    {SEASONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Occasion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunday Brunch, Work"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Description / Styling Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Pairs wonderfully with wide-leg trousers and gold jewelry..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    fontSize: '0.92rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="modal-fav"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                />
                <label htmlFor="modal-fav" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>
                  Mark as a favorite staple
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Add to Closet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '420px',
              padding: '28px',
              textAlign: 'center'
            }}
          >
            <AlertCircle size={38} color="#e11d48" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Remove this item?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem', marginBottom: '22px' }}>
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> from your wardrobe?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setItemToDelete(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-primary"
                style={{ background: '#e11d48', borderColor: '#e11d48' }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
