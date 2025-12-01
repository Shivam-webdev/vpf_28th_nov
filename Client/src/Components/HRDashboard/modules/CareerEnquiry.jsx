// components/HRDashboard/modules/CareerEnquiry.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CareerEnquiry = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/addcandidate/status/Career Enquiry');
      console.log('Career Enquiry API Response:', response.data);
      
      // ✅ Ensure candidates is always an array
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load candidates');
      setCandidates([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (candidateId, newStatus) => {
    try {
      const response = await axios.put(`/api/addcandidate/${candidateId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        alert(`Candidate moved to ${newStatus}`);
        fetchCandidates(); // Refresh the list
      } else {
        alert('Error updating candidate: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      alert('Error updating candidate status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          <h5>Error Loading Candidates</h5>
          <p className="mb-0">{error}</p>
          <button 
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={fetchCandidates}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Career Enquiry</h2>
        <div>
          <span className="badge bg-primary me-2">{candidates.length} Candidates</span>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={fetchCandidates}
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body">
          {candidates.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Applied For</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(candidate => (
                    <tr key={candidate._id}>
                      <td>{candidate.fullName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.appliedFor?.designation || 'N/A'}</td>
                      <td>{new Date(candidate.appliedDate).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => updateStatus(candidate._id, 'Resume Shortlisted')}
                          >
                            Shortlist
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => updateStatus(candidate._id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <p>No candidates in Career Enquiry.</p>
              <small>Add candidates from the "Add Candidate" page.</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerEnquiry;