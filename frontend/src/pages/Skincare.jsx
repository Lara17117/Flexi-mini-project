import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import {
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit3,
  X,
  Droplet,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRODUCT_CATEGORIES = [
  'cleanser',
  'toner',
  'serum',
  'moisturizer',
  'sunscreen',
  'mask',
  'treatment',
  'eye-cream',
  'other'
];

export default function Skincare() {
  const [activeTab, setActiveTab] = useState('routine'); // 'routine' | 'products'
  const [timeFilter, setTimeFilter] = useState('morning'); // 'morning' | 'evening' | 'all'
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [routineSteps, setRoutineSteps] = useState([]);
  const [products, setProducts] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepToDelete, setStepToDelete] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Forms
  const [stepForm, setStepForm] = useState({
    name: '',
    timeOfDay: 'morning',
    productId: '',
    order: 0
  });

  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'cleanser',
    instructions: '',
    imageUrl: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stepsRes, prodsRes, compsRes] = await Promise.all([
        api.get('/skincare/routine'),
        api.get('/skincare/products'),
        api.get(`/skincare/completions?date=${currentDate}`)
      ]);

      setRoutineSteps(stepsRes.data.steps || []);
      setProducts(prodsRes.data.products || []);

      // Build map of routineStepId -> boolean
      const compMap = {};
      (compsRes.data.completions || []).forEach(c => {
        compMap[c.routineStepId] = c.completed;
      });
      setCompletions(compMap);
    } catch (err) {
      console.error('Error fetching skincare data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  // Toggle routine step completion for selected date
  const handleToggleStep = async (stepId) => {
    const nextVal = !completions[stepId];
    setCompletions(prev => ({ ...prev, [stepId]: nextVal }));

    if (nextVal) {
      // Gentle celebratory micro-sparkle
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#ec4899', '#10b981', '#3b82f6']
        });
      } catch (e) {}
    }

    try {
      await api.post('/skincare/completions', {
        routineStepId: stepId,
        completionDate: currentDate,
        completed: nextVal
      });
    } catch (err) {
      console.error('Failed to sync completion:', err);
      // Revert on error
      setCompletions(prev => ({ ...prev, [stepId]: !nextVal }));
    }
  };

  // Step modal actions
  const handleOpenAddStep = () => {
    setEditingStep(null);
    setStepForm({
      name: '',
      timeOfDay: timeFilter === 'evening' ? 'evening' : 'morning',
      productId: '',
      order: routineSteps.length + 1
    });
    setIsStepModalOpen(true);
  };

  const handleOpenEditStep = (step) => {
    setEditingStep(step);
    setStepForm({
      name: step.name,
      timeOfDay: step.timeOfDay,
      productId: step.productId?._id || step.productId || '',
      order: step.order || 0
    });
    setIsStepModalOpen(true);
  };

  const handleSaveStep = async (e) => {
    e.preventDefault();
    if (!stepForm.name.trim()) return;

    try {
      const payload = {
        ...stepForm,
        productId: stepForm.productId || null
      };

      if (editingStep) {
        const res = await api.patch(`/skincare/routine/${editingStep._id}`, payload);
        setRoutineSteps(routineSteps.map(s => s._id === editingStep._id ? res.data.step : s));
      } else {
        const res = await api.post('/skincare/routine', payload);
        setRoutineSteps([...routineSteps, res.data.step]);
      }
      setIsStepModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save routine step.');
    }
  };

  const handleDeleteStep = async () => {
    if (!stepToDelete) return;
    try {
      await api.delete(`/skincare/routine/${stepToDelete._id}`);
      setRoutineSteps(routineSteps.filter(s => s._id !== stepToDelete._id));
      setStepToDelete(null);
    } catch (err) {
      alert('Could not delete step.');
    }
  };

  // Product modal actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      category: 'cleanser',
      instructions: '',
      imageUrl: ''
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand || '',
      category: prod.category || 'cleanser',
      instructions: prod.instructions || '',
      imageUrl: prod.imageUrl || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    try {
      if (editingProduct) {
        const res = await api.patch(`/skincare/products/${editingProduct._id}`, productForm);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data.product : p));
      } else {
        const res = await api.post('/skincare/products', productForm);
        setProducts([...products, res.data.product]);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/skincare/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setProductToDelete(null);
    } catch (err) {
      alert('Could not delete product.');
    }
  };

  // Filtered steps
  const filteredSteps = routineSteps.filter(s => {
    if (timeFilter === 'all') return true;
    return s.timeOfDay === timeFilter || s.timeOfDay === 'both';
  });

  const completedStepsCount = filteredSteps.filter(s => completions[s._id]).length;
  const progressPercent = filteredSteps.length > 0
    ? Math.round((completedStepsCount / filteredSteps.length) * 100)
    : 0;

  return (
    <div className="main-wrapper">
      <Header
        title="Skincare Rituals"
        subtitle="A gentle routine, just for you. Pamper your skin barrier and glow at your own pace."
      />

      {/* Main Tabs & Date Picker */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('routine')}
            className={activeTab === 'routine' ? 'btn-primary' : 'btn-secondary'}
          >
            <Sparkles size={16} />
            Daily Routine
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}
          >
            <Droplet size={16} />
            Product Shelf ({products.length})
          </button>
        </div>

        {activeTab === 'routine' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted-color)', fontWeight: 600 }}>
              Date:
            </label>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-color)',
                fontSize: '0.88rem'
              }}
            />
          </div>
        )}
      </div>

      {/* ROUTINE VIEW */}
      {activeTab === 'routine' && (
        <>
          {/* Progress Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '22px 28px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Today's Ritual Progress</h3>
                <span className="badge">
                  {completedStepsCount} of {filteredSteps.length} complete
                </span>
              </div>
              <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem' }}>
                {progressPercent === 100
                  ? '✨ All steps complete! Your skin is radiant and deeply cared for.'
                  : 'Take a quiet moment to nourish and protect your skin.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 200px', maxWidth: '320px' }}>
              <div
                style={{
                  height: '10px',
                  width: '100%',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'var(--accent-gradient)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-color)' }}>
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Time Filter Pills & Add Step Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTimeFilter('morning')}
                className={timeFilter === 'morning' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Sun size={15} />
                Morning
              </button>
              <button
                onClick={() => setTimeFilter('evening')}
                className={timeFilter === 'evening' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Moon size={15} />
                Evening
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={timeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                All Rituals
              </button>
            </div>

            <button onClick={handleOpenAddStep} className="btn-primary">
              <Plus size={16} />
              Add Routine Step
            </button>
          </div>

          {/* Steps List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted-color)' }}>
              <Sparkles className="spin" size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p>Preparing your gentle skincare steps...</p>
            </div>
          ) : filteredSteps.length === 0 ? (
            <div
              className="glass-panel"
              style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '500px', margin: '40px auto' }}
            >
              <Droplet size={36} color="var(--accent-color)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No steps in this routine yet</h3>
              <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Add your morning cleanse, vitamin C serum, sunscreen, or evening mask.
              </p>
              <button onClick={handleOpenAddStep} className="btn-primary">
                <Plus size={16} />
                Add First Step
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
              {filteredSteps.map((step, index) => {
                const isDone = !!completions[step._id];
                return (
                  <div
                    key={step._id}
                    className="glass-panel"
                    style={{
                      padding: '18px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      opacity: isDone ? 0.85 : 1,
                      borderLeft: isDone ? '4px solid #10b981' : '4px solid var(--border-color)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      {/* Checkbox circle */}
                      <button
                        onClick={() => handleToggleStep(step._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isDone ? '#10b981' : 'var(--muted-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px'
                        }}
                        aria-label={`Mark ${step.name} as ${isDone ? 'incomplete' : 'complete'}`}
                      >
                        {isDone ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 600,
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--muted-color)' : 'var(--text-heading)'
                            }}
                          >
                            {step.name}
                          </span>
                          <span className="badge" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                            {step.timeOfDay === 'morning' ? '☀️ Morning' : step.timeOfDay === 'evening' ? '🌙 Evening' : '✨ Both'}
                          </span>
                        </div>

                        {step.productId && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--muted-color)' }}>
                            Using: <strong>{step.productId.name}</strong> {step.productId.brand ? `(${step.productId.brand})` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEditStep(step)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setStepToDelete(step)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#e11d48' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PRODUCTS VIEW */}
      {activeTab === 'products' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Skincare Cabinet</h3>
            <button onClick={handleOpenAddProduct} className="btn-primary">
              <Plus size={16} />
              Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div
              className="glass-panel"
              style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '500px', margin: '40px auto' }}
            >
              <Droplet size={36} color="var(--accent-color)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Your shelf is empty</h3>
              <p style={{ color: 'var(--muted-color)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Add your favorite cleansers, serums, sunscreens, and toners.
              </p>
              <button onClick={handleOpenAddProduct} className="btn-primary">
                <Plus size={16} />
                Add First Product
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
              {products.map(prod => (
                <div
                  key={prod._id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  {prod.imageUrl && (
                    <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span className="badge" style={{ textTransform: 'capitalize', fontSize: '0.72rem' }}>
                        {prod.category}
                      </span>
                      {prod.brand && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted-color)', fontWeight: 600 }}>
                          {prod.brand}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '1.15rem', marginTop: '6px', marginBottom: '8px' }}>
                      {prod.name}
                    </h4>
                    {prod.instructions && (
                      <p style={{ fontSize: '0.84rem', color: 'var(--muted-color)', lineHeight: 1.5 }}>
                        {prod.instructions}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <Edit3 size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => setProductToDelete(prod)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#e11d48' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Routine Step Modal */}
      {isStepModalOpen && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem' }}>{editingStep ? 'Edit Routine Step' : 'New Routine Step'}</h3>
              <button onClick={() => setIsStepModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStep} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Step Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Double Cleanse with Warm Water"
                  value={stepForm.name}
                  onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Time of Day
                  </label>
                  <select
                    value={stepForm.timeOfDay}
                    onChange={(e) => setStepForm({ ...stepForm, timeOfDay: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="both">Both Morning & Evening</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Link Product
                  </label>
                  <select
                    value={stepForm.productId}
                    onChange={(e) => setStepForm({ ...stepForm, productId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  >
                    <option value="">(None / General Step)</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} {p.brand ? `— ${p.brand}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsStepModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStep ? 'Save Step' : 'Add Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem' }}>{editingProduct ? 'Edit Product' : 'Add Skincare Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydrating Hyaluronic Cloud Serum"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Botanique Pure"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-color)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Usage Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Gently pat 3-4 drops into damp skin morning and night..."
                  value={productForm.instructions}
                  onChange={(e) => setProductForm({ ...productForm, instructions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Product' : 'Add to Shelf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Step */}
      {stepToDelete && (
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
          <div className="glass-panel" style={{ maxWidth: '400px', padding: '26px', textAlign: 'center' }}>
            <AlertCircle size={36} color="#e11d48" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Remove step?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Delete <strong>"{stepToDelete.name}"</strong> from your routine?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setStepToDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDeleteStep} className="btn-primary" style={{ background: '#e11d48' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Product */}
      {productToDelete && (
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
          <div className="glass-panel" style={{ maxWidth: '400px', padding: '26px', textAlign: 'center' }}>
            <AlertCircle size={36} color="#e11d48" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Remove product?</h3>
            <p style={{ color: 'var(--muted-color)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Delete <strong>"{productToDelete.name}"</strong> from your shelf?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setProductToDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDeleteProduct} className="btn-primary" style={{ background: '#e11d48' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
