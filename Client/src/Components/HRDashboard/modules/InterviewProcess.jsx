// components/HRDashboard/modules/InterviewProcess.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InterviewProcess = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/addcandidate/status/Interview Process');
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const updateStatus = async (candidateId, newStatus, joiningDetails = {}) => {
    try {
      await axios.put(`/api/addcandidate/${candidateId}/status`, {
        status: newStatus,
        joiningDetails
      });
      alert(`Candidate moved to ${newStatus}`);
      fetchCandidates();
    } catch (error) {
      alert('Error updating candidate status');
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Interview Process</h2>
      
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
                    <th>Interview Date</th>
                    <th>Round</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(candidate => (
                    <tr key={candidate._id}>
                      <td>{candidate.fullName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.appliedFor?.designation}</td>
                      <td>
                        {candidate.interviewDetails?.interviewDate ? 
                          new Date(candidate.interviewDetails.interviewDate).toLocaleDateString() : 
                          'Not set'
                        }
                      </td>
                      <td>{candidate.interviewDetails?.round || 'N/A'}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => updateStatus(candidate._id, 'Joining Data', {
                              joiningDate: new Date(),
                              salaryOffered: 0,
                              designation: candidate.appliedFor.designation
                            })}
                          >
                            Select
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
              <p>No candidates in interview process.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewProcess;