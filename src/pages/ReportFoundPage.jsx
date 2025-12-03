import React, { useState } from 'react';
import { Upload, MapPin, Send, CheckCircle, X, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/api';

const CATEGORIES = [
  'BuzzCard',
  'Electronics',
  'Water Bottle',
  'Clothing',
  'Bag',
  'Keys',
  'Books',
  'Other'
];

const GT_BUILDINGS = [
  { name: 'Student Center', lat: 33.7738, lng: -84.3980 },
  { name: 'Klaus Building', lat: 33.7770, lng: -84.3963 },
  { name: 'Library West', lat: 33.7760, lng: -84.3955 },
  { name: 'Library East', lat: 33.7760, lng: -84.3945 },
  { name: 'CRC', lat: 33.7755, lng: -84.4035 },
  { name: 'Van Leer', lat: 33.7760, lng: -84.3970 },
  { name: 'Clough Commons', lat: 33.7750, lng: -84.3963 },
  { name: 'Howey Building', lat: 33.7775, lng: -84.3985 },
  { name: 'Tech Square', lat: 33.7770, lng: -84.3890 },
  { name: 'Scheller College', lat: 33.7765, lng: -84.3875 },
  { name: 'College of Computing', lat: 33.7775, lng: -84.3970 },
  { name: 'Instructional Center', lat: 33.7750, lng: -84.4010 },
  { name: 'Other', lat: 33.7756, lng: -84.3963 }
];

// Staff email for reporting found items
const STAFF_EMAIL = 'lostandfoundgatech@gmail.com';
const STAFF_NAME = 'GT Lost & Found Staff';

export default function ReportFoundPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    building: GT_BUILDINGS[0].name,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: CATEGORIES[0],
      description: '',
      building: GT_BUILDINGS[0].name,
    });
    removePhoto();
    setSubmitResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter an item name');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photo if provided
      let photoUrl = null;
      if (photo) {
        try {
          photoUrl = await adminApi.uploadImage(photo);
        } catch (uploadError) {
          console.warn('Failed to upload image, proceeding without photo:', uploadError);
        }
      }

      // 2. Get location coordinates
      const locationData = GT_BUILDINGS.find(b => b.name === formData.building) || GT_BUILDINGS[0];

      // 3. Prepare item data
      const itemData = {
        userId: 'staff_admin',
        title: formData.title,
        category: formData.category,
        description: formData.description,
        location: {
          building: formData.building,
          lat: locationData.lat,
          lng: locationData.lng,
        },
        photoUrl: photoUrl,
        reporterEmail: STAFF_EMAIL,
        reporterName: STAFF_NAME,
      };

      // 4. Submit to backend
      const response = await adminApi.reportFoundItem(itemData);

      // 5. Show success result
      setSubmitResult({
        success: true,
        itemId: response.itemId,
        matchCount: response.matches?.length || 0,
        matches: response.matches || []
      });

    } catch (err) {
      console.error('Error submitting found item:', err);
      setError(err.message || 'Failed to report found item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (submitResult?.success) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Report Found Item</h1>
          <p className="page-subtitle">Staff interface for reporting items turned in to Lost & Found</p>
        </div>

        <div className="card" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h2 style={{ marginBottom: '8px', color: '#065f46' }}>Item Successfully Reported</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Item ID: <code style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                {submitResult.itemId}
              </code>
            </p>

            {submitResult.matchCount > 0 ? (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={20} color="#d97706" />
                  <strong style={{ color: '#92400e' }}>
                    {submitResult.matchCount} Potential Match{submitResult.matchCount > 1 ? 'es' : ''} Found!
                  </strong>
                </div>
                <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '12px' }}>
                  The system found items that may belong to someone who reported them lost.
                  Automatic emails have been sent to notify both parties.
                </p>
                <div style={{ fontSize: '13px' }}>
                  {submitResult.matches.map((match, idx) => (
                    <div key={idx} style={{
                      background: 'white',
                      padding: '10px',
                      borderRadius: '6px',
                      marginTop: idx > 0 ? '8px' : 0
                    }}>
                      <strong>{match.title}</strong>
                      <span style={{
                        marginLeft: '8px',
                        background: '#10b981',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {Math.round(match.similarity * 100)}% match
                      </span>
                      <div style={{ color: '#666', marginTop: '4px' }}>{match.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ color: '#1e40af', fontSize: '14px' }}>
                  No matching lost items found at this time. The item has been added to the database
                  and will be automatically matched if someone reports it as lost.
                </p>
              </div>
            )}

            <button className="btn btn-primary" onClick={resetForm}>
              Report Another Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Report Found Item</h1>
        <p className="page-subtitle">Staff interface for reporting items turned in to Lost & Found</p>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Item Name */}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., Black BuzzCard, Blue Water Bottle"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Describe the item in detail - color, brand, distinguishing features, any visible name or ID..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Found Location *
            </label>
            <select
              name="building"
              className="form-input"
              value={formData.building}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              {GT_BUILDINGS.map(building => (
                <option key={building.name} value={building.name}>{building.name}</option>
              ))}
            </select>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">
              <Upload size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Photo (Optional but Recommended)
            </label>

            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  disabled={isSubmitting}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => document.getElementById('photo-input').click()}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gt-gold)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <Upload size={32} color="#999" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#666', marginBottom: '4px' }}>Click to upload a photo</p>
                <p style={{ color: '#999', fontSize: '12px' }}>JPEG, PNG, or WebP (max 5MB)</p>
              </div>
            )}
            <input
              id="photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </div>

          {/* Staff Info Notice */}
          <div style={{
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#666'
          }}>
            <strong>Reporter:</strong> {STAFF_NAME} ({STAFF_EMAIL})
            <br />
            <span style={{ fontSize: '12px' }}>
              This email will be used for match notifications and correspondence.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Report Found Item
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
