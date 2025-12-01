// components/HRDashboard/modules/JoiningData.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JoiningData = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/addcandidate/status/Joining Data');
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Joining Data</h2>
      
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
                    <th>Designation</th>
                    <th>Joining Date</th>
                    <th>Salary Offered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(candidate => (
                    <tr key={candidate._id}>
                      <td>{candidate.fullName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.joiningDetails?.designation || candidate.appliedFor?.designation}</td>
                      <td>
                        {candidate.joiningDetails?.joiningDate ? 
                          new Date(candidate.joiningDetails.joiningDate).toLocaleDateString() : 
                          'Not set'
                        }
                      </td>
                      <td>
                        {candidate.joiningDetails?.salaryOffered ? 
                          `₹${candidate.joiningDetails.salaryOffered}` : 
                          'Not set'
                        }
                      </td>
                      <td>
                        <span className="badge bg-success">Selected</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <p>No candidates in joining data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoiningData;