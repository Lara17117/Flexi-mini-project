import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  Plus,
  Heart,
  Trash2,
  Edit3,
  X,
  Search,
  Tag,
  Sparkles,
  BookOpen,
  AlertCircle,
  Calendar,
  Upload,
  Link as LinkIcon,
  RotateCw,
  Move,
  Save,
  Check,
  Sticker,
  Palette,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STICKER_PACKS = {
  flowers: {
    name: '🌸 Flowers & Garden',
    items: ['🌸', '🌹', '🌻', '🌼', '🌷', '🌿', '🍃', '💐', '🌾', '🍀', '🌺', '🪴']
  },
  aesthetic: {
    name: '🎀 Aesthetic & Coziness',
    items: ['🎀', '💖', '✨', '🧸', '🕯️', '☕', '🥐', '🍰', '🍓', '🍒', '🕊️', '🦋', '👒', '🪞']
  },
  mood: {
    name: '☀️ Moods & Sky',
    items: ['☀️', '🌊', '☁️', '🌧️', '⚡', '🌙', '⭐', '🌈', '🪐', '🔮', '💫']
  },
  tape: {
    name: '📌 Washi Tape & Stationery',
    items: ['📌', '📍', '📎', '🏷️', '💌', '📜', '🔖', '🎨', '📸', '📻', '✂️', '📖']
  },
  sports: {
    name: '⚽ Sports & Movement',
    items: ['🏀', '🏈', '⚽', '🏋️‍♀️', '🧘‍♀️', '🏃‍♀️', '👟', '🏆', '🥇', '🎾']
  }
};

const NOTE_COLORS = [
  { name: 'Butter', bg: '#fef08a', text: '#713f12' },
  { name: 'Blush', bg: '#fbcfe8', text: '#831843' },
  { name: 'Sage', bg: '#dcfce7', text: '#14532d' },
  { name: 'Sky', bg: '#e0f2fe', text: '#0c4a6e' },
  { name: 'Lavender', bg: '#ede9fe', text: '#4c1d95' }
];

// Helper to resize uploaded images
const compressImage = (file, maxWidth = 900, maxHeight = 900) => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export default function Scrapbook() {
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'journal'

  // --- CANVAS / STICKER BOARD STATE ---
  const [boardItems, setBoardItems] = useState(() => {
    const saved = localStorage.getItem('vibevault_scrapbook_board');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default aesthetic starter stickers
    return [
      { id: '1', type: 'image', content: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80', caption: 'Yellow blooms & sunbeams', x: 80, y: 50, scale: 1, rotate: -4, zIndex: 1 },
      { id: '2', type: 'sticker', content: '🌸', x: 260, y: 35, scale: 1.5, rotate: 12, zIndex: 2 },
      { id: '3', type: 'sticker', content: '🎀', x: 60, y: 260, scale: 1.4, rotate: -10, zIndex: 3 },
      { id: '4', type: 'note', content: '“The world belongs to those who see the quiet magic in little moments.”', color: NOTE_COLORS[0], x: 380, y: 70, scale: 1, rotate: 3, zIndex: 2 },
      { id: '5', type: 'sticker', content: '✨', x: 530, y: 240, scale: 1.6, rotate: 15, zIndex: 3 },
      { id: '6', type: 'sticker', content: '☕', x: 350, y: 280, scale: 1.3, rotate: -6, zIndex: 3 }
    ];
  });

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeStickerCategory, setActiveStickerCategory] = useState('flowers');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedNoteColor, setSelectedNoteColor] = useState(NOTE_COLORS[0]);
  const [boardSavedMessage, setBoardSavedMessage] = useState(false);

  const canvasRef = useRef(null);
  const canvasFileInputRef = useRef(null);

  // --- JOURNAL STATE ---
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Journal Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [uploadMode, setUploadMode] = useState('file');

  const journalFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    tags: '',
    entryDate: new Date().toISOString().split('T')[0],
    isFavorite: false
  });

  // Fetch journal memories
  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      let query = `?tag=${selectedTag}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (onlyFavorites) query += `&isFavorite=true`;

      const res = await api.get(`/scrapbook${query}`);
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error('Failed to load scrapbook:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedTag, onlyFavorites]);

  // Save board to local storage
  const handleSaveBoard = () => {
    localStorage.setItem('vibevault_scrapbook_board', JSON.stringify(boardItems));
    setBoardSavedMessage(true);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
    setTimeout(() => setBoardSavedMessage(false), 2500);
  };

  // Add sticker to canvas
  const handleAddSticker = (emoji) => {
    const newItem = {
      id: Date.now().toString(),
      type: 'sticker',
      content: emoji,
      x: 200 + Math.floor(Math.random() * 80) - 40,
      y: 150 + Math.floor(Math.random() * 80) - 40,
      scale: 1.4,
      rotate: Math.floor(Math.random() * 30) - 15,
      zIndex: boardItems.length + 1
    };
    setBoardItems([...boardItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Add Note to canvas
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      type: 'note',
      content: newNoteText.trim(),
      color: selectedNoteColor,
      x: 180 + Math.floor(Math.random() * 60),
      y: 120 + Math.floor(Math.random() * 60),
      scale: 1,
      rotate: Math.floor(Math.random() * 12) - 6,
      zIndex: boardItems.length + 1
    };
    setBoardItems([...boardItems, newItem]);
    setNewNoteText('');
    setSelectedItemId(newItem.id);
  };

  // Upload image to canvas
  const handleCanvasImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      const newItem = {
        id: Date.now().toString(),
        type: 'image',
        content: base64,
        caption: 'Pasted memory',
        x: 140 + Math.floor(Math.random() * 60),
        y: 80 + Math.floor(Math.random() * 60),
        scale: 1,
        rotate: Math.floor(Math.random() * 14) - 7,
        zIndex: boardItems.length + 1
      };
      setBoardItems([...boardItems, newItem]);
      setSelectedItemId(newItem.id);
    } catch (err) {
      alert('Could not upload image.');
    }
  };

  // Item Transformations
  const handleRotateItem = (id, delta) => {
    setBoardItems(boardItems.map(item => {
      if (item.id === id) {
        return { ...item, rotate: (item.rotate || 0) + delta };
      }
      return item;
    }));
  };

  const handleScaleItem = (id, delta) => {
    setBoardItems(boardItems.map(item => {
      if (item.id === id) {
        const nextScale = Math.max(0.6, Math.min(2.8, (item.scale || 1) + delta));
        return { ...item, scale: Number(nextScale.toFixed(2)) };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id) => {
    setBoardItems(boardItems.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Mouse drag handling on canvas
  const handleMouseDown = (e, item) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggingId(item.id);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDragOffset({
      x: e.clientX - canvasRect.left - item.x,
      y: e.clientY - canvasRect.top - item.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(canvasRect.width - 60, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(canvasRect.height - 60, e.clientY - canvasRect.top - dragOffset.y));

    setBoardItems(prev => prev.map(item => {
      if (item.id === draggingId) {
        return { ...item, x: Math.round(newX), y: Math.round(newY) };
      }
      return item;
    }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // --- JOURNAL ACTIONS ---
  const handleOpenAddJournal = () => {
    setEditingEntry(null);
    setUploadMode('file');
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      tags: '',
      entryDate: new Date().toISOString().split('T')[0],
      isFavorite: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditJournal = (entry, e) => {
    if (e) e.stopPropagation();
    setEditingEntry(entry);
    setUploadMode(entry.imageUrl?.startsWith('data:') ? 'file' : 'url');
    setFormData({
      title: entry.title,
      content: entry.content,
      imageUrl: entry.imageUrl || '',
      tags: entry.tags ? entry.tags.join(', ') : '',
      entryDate: entry.entryDate ? new Date(entry.entryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      isFavorite: entry.isFavorite || false
    });
    setIsModalOpen(true);
  };

  const handleJournalFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrl: base64 }));
    } catch (err) {
      alert('Could not process image.');
    }
  };

  const handleSubmitJournal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (editingEntry) {
        const res = await api.patch(`/scrapbook/${editingEntry._id}`, formData);
        setEntries(entries.map(e => e._id === editingEntry._id ? res.data.entry : e));
      } else {
        const res = await api.post('/scrapbook', formData);
        setEntries([res.data.entry, ...entries]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save entry.');
    }
  };

  const toggleFavorite = async (entry, e) => {
    if (e) e.stopPropagation();
    try {
      const updated = !entry.isFavorite;
      const res = await api.patch(`/scrapbook/${entry._id}`, { isFavorite: updated });
      setEntries(entries.map(e => e._id === entry._id ? res.data.entry : e));
    } catch (err) {
      console.error('Could not toggle favorite:', err);
    }
  };

  const handleDeleteJournal = async () => {
    if (!entryToDelete) return;
    try {
      await api.delete(`/scrapbook/${entryToDelete._id}`);
      setEntries(entries.filter(e => e._id !== entryToDelete._id));
      if (viewingEntry?._id === entryToDelete._id) setViewingEntry(null);
      setEntryToDelete(null);
    } catch (err) {
      alert('Could not delete memory.');
    }
  };

  const selectedItem = boardItems.find(i => i.id === selectedItemId);

  return (
    <div className="main-wrapper" onMouseUp={handleMouseUp}>
      <Header
        title="Visual Scrapbook"
        subtitle="A dreamy creative space to paste stickers, pin polaroids, and write memories."
      />

      {/* Main Mode Switcher: Studio Canvas vs Memory Journal */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 22px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('canvas')}
            className={activeTab === 'canvas' ? 'btn-primary' : 'btn-secondary'}
          >
            <Sticker size={16} />
            Scrapbook Studio (Paste Stickers & Photos)
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={activeTab === 'journal' ? 'btn-primary' : 'btn-secondary'}
          >
            <BookOpen size={16} />
            Memory Journal ({entries.length})
          </button>
        </div>

        {activeTab === 'canvas' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {boardSavedMessage && (
              <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={16} /> Saved to Universe!
              </span>
            )}
            <button onClick={handleSaveBoard} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Save size={14} />
              Save Board
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          1. INTERACTIVE SCRAPBOOK STUDIO / CANVAS
      ======================================================== */}
      {activeTab === 'canvas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          {/* Studio Toolbar (Stickers Palette & Image Upload) */}
          <div className="glass-panel" style={{ padding: '18px 22px' }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(STICKER_PACKS).map(([key, pack]) => (
                  <button
                    key={key}
                    onClick={() => setActiveStickerCategory(key)}
                    className={activeStickerCategory === key ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    {pack.name}
                  </button>
                ))}
              </div>

              {/* Paste Photo Button */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={canvasFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCanvasImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => canvasFileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <Upload size={14} />
                  Paste Photo
                </button>
              </div>
            </div>

            {/* Sticker selector shelf */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '12px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-color)', fontWeight: 600 }}>
                Click sticker to paste:
              </span>
              {STICKER_PACKS[activeStickerCategory].items.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSticker(emoji)}
                  style={{
                    fontSize: '1.6rem',
                    background: 'none',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  title="Click to paste onto scrapbook"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Sticky Note Creator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px',
                flexWrap: 'wrap'
              }}
            >
              <input
                type="text"
                placeholder="Write a sweet note or poetic quote to pin..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                style={{
                  flex: '1 1 240px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  fontSize: '0.88rem'
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedNoteColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c.bg,
                      border: selectedNoteColor.name === c.name ? '2px solid #000' : '1px solid rgba(0,0,0,0.15)',
                      cursor: 'pointer'
                    }}
                    title={c.name}
                  />
                ))}
              </div>
              <button onClick={handleAddNote} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                <Plus size={14} />
                Pin Note
              </button>
            </div>
          </div>

          {/* Interactive Canvas Board */}
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            style={{
              width: '100%',
              minHeight: '620px',
              height: '620px',
              position: 'relative',
              borderRadius: '24px',
              border: '2px dashed var(--border-color)',
              background: '#faf6ee',
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.03), var(--card-shadow)',
              overflow: 'hidden',
              cursor: draggingId ? 'grabbing' : 'default',
              userSelect: 'none'
            }}
            onClick={() => setSelectedItemId(null)}
          >
            {/* Aesthetic Corner Washi Tapes */}
            <div style={{ position: 'absolute', top: '-10px', left: '20px', width: '80px', height: '24px', background: 'rgba(254, 215, 170, 0.7)', transform: 'rotate(-5deg)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '-10px', right: '20px', width: '80px', height: '24px', background: 'rgba(251, 207, 232, 0.7)', transform: 'rotate(5deg)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10px', left: '30px', width: '80px', height: '24px', background: 'rgba(224, 242, 254, 0.7)', transform: 'rotate(4deg)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10px', right: '30px', width: '80px', height: '24px', background: 'rgba(254, 240, 138, 0.7)', transform: 'rotate(-4deg)', zIndex: 0 }} />

            {/* Instruction watermark */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '20px',
                fontSize: '0.78rem',
                color: 'rgba(0,0,0,0.3)',
                pointerEvents: 'none'
              }}
            >
              ✦ Drag stickers, polaroids & notes anywhere on this board
            </div>

            {/* Render items on canvas */}
            {boardItems.map(item => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: `rotate(${item.rotate || 0}deg) scale(${item.scale || 1})`,
                    transformOrigin: 'center center',
                    zIndex: item.zIndex || 1,
                    cursor: 'grab',
                    transition: draggingId === item.id ? 'none' : 'transform 0.1s ease',
                    outline: isSelected ? '2px dashed var(--accent-color)' : 'none',
                    outlineOffset: '4px',
                    borderRadius: '8px'
                  }}
                >
                  {/* Item Type: STICKER */}
                  {item.type === 'sticker' && (
                    <div
                      style={{
                        fontSize: '3.2rem',
                        lineHeight: 1,
                        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))'
                      }}
                    >
                      {item.content}
                    </div>
                  )}

                  {/* Item Type: IMAGE / POLAROID */}
                  {item.type === 'image' && (
                    <div
                      style={{
                        padding: '10px 10px 24px 10px',
                        background: '#ffffff',
                        borderRadius: '6px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        maxWidth: '220px',
                        textAlign: 'center'
                      }}
                    >
                      <img
                        src={item.content}
                        alt="Scrapbook piece"
                        style={{
                          width: '180px',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          display: 'block'
                        }}
                      />
                      {item.caption && (
                        <p style={{ fontFamily: 'var(--font-editorial)', fontSize: '0.82rem', marginTop: '8px', color: '#3f3f46' }}>
                          {item.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Item Type: NOTE */}
                  {item.type === 'note' && (
                    <div
                      style={{
                        padding: '14px 18px',
                        background: item.color?.bg || '#fef08a',
                        color: item.color?.text || '#713f12',
                        borderRadius: '4px',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                        maxWidth: '240px',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        position: 'relative'
                      }}
                    >
                      {/* Pushpin pin motif */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '1rem'
                        }}
                      >
                        📌
                      </div>
                      {item.content}
                    </div>
                  )}

                  {/* Selected Controls Floating Toolbar */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '4px',
                        background: 'rgba(0,0,0,0.75)',
                        padding: '3px 6px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleRotateItem(item.id, -15)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 4px' }}
                        title="Rotate left"
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateItem(item.id, 15)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 4px' }}
                        title="Rotate right"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScaleItem(item.id, 0.15)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 4px', fontSize: '0.78rem' }}
                        title="Scale larger"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScaleItem(item.id, -0.15)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 4px', fontSize: '0.78rem' }}
                        title="Scale smaller"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px 4px', fontSize: '0.78rem' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          2. POLAROID JOURNAL MEMORIES TAB
      ======================================================== */}
      {activeTab === 'journal' && (
        <>
          {/* Control Bar */}
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
            <form onSubmit={(e) => { e.preventDefault(); fetchEntries(); }} style={{ display: 'flex', gap: '8px', flex: '1 1 300px', maxWidth: '420px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-color)' }}
                />
                <input
                  type="text"
                  placeholder="Search memories, quotes, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
              <button type="submit" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Search
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={onlyFavorites ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Heart size={14} fill={onlyFavorites ? 'currentColor' : 'none'} />
                Favorites
              </button>
              <button onClick={handleOpenAddJournal} className="btn-primary">
                <Plus size={16} />
                <span>New Memory</span>
              </button>
            </div>
          </div>

          {/* Scrapbook Cards Grid (Polaroid Style) */}
          {loadingEntries ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted-color)' }}>
              <Sparkles className="spin" size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p>Flipping through your scrapbook pages...</p>
            </div>
          ) : entries.length === 0 ? (
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
                <BookOpen size={30} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Your journal is blank</h3>
              <p style={{ color: 'var(--muted-color)', marginBottom: '22px', fontSize: '0.92rem' }}>
                Capture a warm memory from today, a quote that touched your heart, or a polaroid photo.
              </p>
              <button onClick={handleOpenAddJournal} className="btn-primary">
                <Plus size={16} />
                Write First Memory
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '28px',
                marginBottom: '40px'
              }}
            >
              {entries.map(entry => (
                <article
                  key={entry._id}
                  onClick={() => setViewingEntry(entry)}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  {entry.imageUrl ? (
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        height: '210px',
                        marginBottom: '14px',
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }}
                    >
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(-2deg)',
                          width: '60px',
                          height: '18px',
                          background: 'rgba(255, 230, 160, 0.75)',
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '10px',
                        width: '50px',
                        margin: '0 auto 12px',
                        background: 'var(--border-color)',
                        borderRadius: '4px',
                        opacity: 0.5
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {new Date(entry.entryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(entry, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: entry.isFavorite ? '#e11d48' : 'var(--muted-color)',
                        padding: '4px'
                      }}
                      title={entry.isFavorite ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart size={16} fill={entry.isFavorite ? '#e11d48' : 'none'} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: 1.3 }}>{entry.title}</h4>
                  <p
                    style={{
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}
                  >
                    {entry.content}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '10px',
                      borderTop: '1px dashed var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {entry.tags && entry.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => handleOpenEditJournal(entry, e)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(entry);
                        }}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#e11d48' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Reader Modal */}
      {viewingEntry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setViewingEntry(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  {new Date(viewingEntry.entryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <h2 style={{ fontSize: '1.8rem', marginTop: '6px' }}>{viewingEntry.title}</h2>
              </div>
              <button
                onClick={() => setViewingEntry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-color)' }}
              >
                <X size={22} />
              </button>
            </div>

            {viewingEntry.imageUrl && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', maxHeight: '350px' }}>
                <img
                  src={viewingEntry.imageUrl}
                  alt={viewingEntry.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                marginBottom: '24px'
              }}
            >
              {viewingEntry.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setViewingEntry(null)} className="btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Journal Modal with File Upload */}
      {isModalOpen && (
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
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>
                {editingEntry ? 'Edit Memory' : 'Create Scrapbook Memory'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-color)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitJournal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Tea & Pressed Sunflowers"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              {/* Memory Photo File Upload & Preview */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Photo Attachment</label>
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
                      URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div>
                    <input
                      ref={journalFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleJournalFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => journalFileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--input-bg)'
                      }}
                    >
                      <Upload size={24} color="var(--accent-color)" style={{ margin: '0 auto 6px' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to browse photo from computer</p>
                    </div>
                  </div>
                ) : (
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

                {formData.imageUrl && (
                  <div style={{ marginTop: '10px', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Memory / Journal Story *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="What made this moment special?..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEntry ? 'Save Changes' : 'Pin to Scrapbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '420px', padding: '28px', textAlign: 'center' }}>
            <AlertCircle size={38} color="#e11d48" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Remove memory?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem', marginBottom: '22px' }}>
              Delete <strong>"{entryToDelete.title}"</strong> from your journal?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setEntryToDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDeleteJournal} className="btn-primary" style={{ background: '#e11d48' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
