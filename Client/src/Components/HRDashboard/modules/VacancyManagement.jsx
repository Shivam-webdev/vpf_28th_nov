// components/HRDashboard/modules/VacancyManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VacancyManagement = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vacancy: '', // ✅ Backend expects this field name
    date: new Date().toISOString().split('T')[0],
    platform: [], 
    description: '',
    document: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/vacancynotice');
      console.log('✅ Vacancies API Response:', response.data);
      setVacancies(response.data.vacancies || []);
    } catch (error) {
      console.error('❌ Error fetching vacancies:', error);
      setError('Failed to load vacancies');
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation
    if (!formData.vacancy.trim()) {
      alert('Please enter vacancy designation');
      return;
    }

    if (formData.platform.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (!formData.document) {
      alert('Please upload a document');
      return;
    }

    setSubmitLoading(true);
    
    try {
      // ✅ FormData create karo
      const submitData = new FormData();
      
      // ✅ Text fields append karo
      submitData.append('vacancy', formData.vacancy);
      submitData.append('designation', formData.vacancy); // Both fields for compatibility
      submitData.append('date', formData.date);
      submitData.append('platform', formData.platform.join(', ')); // Comma separated string
      submitData.append('description', formData.description || '');
      
      // ✅ File append karo - CORRECT FIELD NAME 'document'
      submitData.append('document', formData.document);
      
      // Debug: Check FormData contents
      console.log('📤 FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      // ✅ API call
      const response = await axios.post('/api/vacancynotice', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Create vacancy response:', response.data);
      
      if (response.data.success) {
        alert('🎉 Vacancy created successfully!');
        setShowForm(false);
        fetchVacancies();
        resetForm();
      } else {
        alert('❌ Error: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error creating vacancy:', error);
      
      if (error.response) {
        const errorMsg = error.response.data?.message || error.response.data?.error || 'Failed to create vacancy';
        alert(`❌ Server Error: ${errorMsg}`);
      } else if (error.request) {
        alert('🌐 Network Error: Cannot connect to server.');
      } else {
        alert('⚠️ Error: ' + error.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vacancy: '',
      date: new Date().toISOString().split('T')[0],
      platform: [],
      description: '',
      document: null
    });
    
    // Reset file input
    const fileInput = document.getElementById('documentUpload');
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      const validTypes = [
        'application/pdf',
        'image/jpeg', 
        'image/png', 
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('❌ Please upload PDF, DOC, DOCX, JPG, or PNG files only');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  const handlePlatformChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, platform: selectedOptions }));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0 text-muted">Loading vacancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Vacancy Management</h2>
          <p className="text-muted mb-0">Create and manage job vacancies</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={submitLoading}
        >
          + Create Vacancy
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show">
          <strong>⚠️ Connection Issue:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Vacancy Creation Form */}
      {showForm && (
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">📝 Create New Vacancy</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Vacancy Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Vacancy Designation *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vacancy}
                  onChange={(e) => setFormData(prev => ({ ...prev, vacancy: e.target.value }))}
                  required
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>

              <div className="row">
                {/* Date Field */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Date *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                {/* Platform Selection */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Publish Platform *
                  </label>
                  <select
                    multiple
                    className="form-control"
                    value={formData.platform}
                    onChange={handlePlatformChange}
                    required
                    style={{ height: '100px' }}
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Company Website">Company Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Job Portal">Job Portal</option>
                  </select>
                  <small className="text-muted">
                    Hold Ctrl to select multiple | Selected: {formData.platform.length}
                  </small>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Job Description
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter job description..."
                />
              </div>

              {/* Document Upload */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Document Upload *
                </label>
                <input
                  id="documentUpload"
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                <small className="text-muted">
                  PDF, DOC, DOCX, JPG, PNG (Max 5MB) | 
                  {formData.document ? ` Selected: ${formData.document.name}` : ' No file selected'}
                </small>
              </div>

              {/* Form Actions */}
              <div className="d-flex gap-2 pt-3 border-top">
                <button 
                  type="submit" 
                  className="btn btn-success px-4"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Vacancy'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacancies List */}
      <div className="card">
        <div className="card-header bg-light text-black">
          <h5 className="mb-0">
            Active Vacancies 
            <span className="badge bg-primary ms-2">{vacancies.length}</span>
          </h5>
        </div>
        <div className="card-body">
          {vacancies.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>Platforms</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancies.map(vacancy => (
                    <tr key={vacancy._id}>
                      <td>{vacancy.designation}</td>
                      <td>{vacancy.publishPlatform?.join(', ')}</td>
                      <td>{vacancy.description || 'No description'}</td>
                      <td>{new Date(vacancy.createdDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${vacancy.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {vacancy.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <p>No vacancies available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacancyManagement;