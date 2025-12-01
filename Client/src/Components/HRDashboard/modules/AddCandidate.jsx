// components/HRDashboard/modules/AddCandidate.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaList, FaStar, FaFilePdf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AddCandidate = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [vacancies, setVacancies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    candidateName: "",
    mobileNo: "",
    email: "",
    designation: "",
    education: "",
    ageGroup: "",
    vehicle: false,
    location: "",
    nativePlace: "",
    spokenEnglish: false,
    salaryExpectation: "",
    administrative: 0,
    insuranceSales: 0,
    anySales: 0,
    fieldWork: 0,
    dataManagement: 0,
    backOffice: 0,
    mis: 0,
    appliedFor: "",
    interviewDate: ""
  });
  
  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetchVacancies();
    fetchCandidates();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vacancynotice');
      setVacancies(response.data.vacancies || []);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/addcandidate');
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appliedFor) {
      alert('Please select a vacancy to apply for');
      return;
    }

    setSubmitLoading(true);
    
    const submitData = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'boolean') {
        submitData.append(key, formData[key].toString());
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    if (resume) {
      submitData.append('resume', resume);
    }

    try {
      const response = await axios.post('/api/addcandidate/add', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        alert('Candidate added successfully!');
        resetForm();
        fetchCandidates();
        setActiveTab('view');
      } else {
        alert('Error adding candidate: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Error adding candidate. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: "",
      mobileNo: "",
      email: "",
      designation: "",
      education: "",
      ageGroup: "",
      vehicle: false,
      location: "",
      nativePlace: "",
      spokenEnglish: false,
      salaryExpectation: "",
      administrative: 0,
      insuranceSales: 0,
      anySales: 0,
      fieldWork: 0,
      dataManagement: 0,
      backOffice: 0,
      mis: 0,
      appliedFor: "",
      interviewDate: ""
    });
    setResume(null);
  };

  const calculateTotalMarks = (candidate = null) => {
    const data = candidate || formData;
    let marks = 0;
    
    // Education marks
    switch(data.education) {
      case 'Graduate in any': marks += 2; break;
      case 'Graduate in Maths/Economics': marks += 3; break;
      case 'MBA/PG with financial subject': marks += 4; break;
    }
    
    // Age group marks
    switch(data.ageGroup) {
      case '20-25yr': marks += 1; break;
      case '26-30yr': marks += 2; break;
      case '31-45yr': marks += 3; break;
      case '45 & above': marks += 2; break;
    }
    
    // Vehicle marks
    if (data.vehicle) marks += 4;
    
    // Experience fields marks
    marks += parseInt(data.experienceFields?.administrative || data.administrative) || 0;
    marks += parseInt(data.experienceFields?.insuranceSales || data.insuranceSales) || 0;
    marks += parseInt(data.experienceFields?.anySales || data.anySales) || 0;
    marks += parseInt(data.experienceFields?.fieldWork || data.fieldWork) || 0;
    
    // Operational activities marks
    marks += parseInt(data.operationalActivities?.dataManagement || data.dataManagement) || 0;
    marks += parseInt(data.operationalActivities?.backOffice || data.backOffice) || 0;
    marks += parseInt(data.operationalActivities?.mis || data.mis) || 0;
    
    // Location marks
    const locationMarks = { 
      'H.B Road': 4, 
      'Arera Colony': 3, 
      'BHEL': 2, 
      'Mandideep': 2, 
      'Others': 1 
    };
    marks += locationMarks[data.location] || 0;
    
    // Native place marks
    if (data.nativePlace === 'Bhopal') marks += 3; 
    else marks += 1;
    
    // Spoken English marks
    if (data.spokenEnglish) marks += 4;
    
    // Salary expectation marks
    const salaryMarks = { 
      '10K-12K': 4, 
      '12-15K': 3, 
      '15-18K': 3, 
      '18-20K': 2, 
      '20-25K': 2, 
      '25K & Above': 1 
    };
    marks += salaryMarks[data.salaryExpectation] || 0;
    
    return marks;
  };

  const getMarksBadge = (marks) => {
    if (marks >= 25) return 'badge bg-success';
    if (marks >= 20) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  };

  const totalMarks = calculateTotalMarks();
  const isShortlisted = totalMarks >= 20;

  return (
    <div className="p-4 black-text-all" style={{ color: 'black' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: 'black' }}>Candidate Management</h2>
          <p className="text-muted mb-0">Add and manage job candidates</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="card mb-4">
        <div className="card-header bg-white border-bottom-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
                style={{ color: activeTab === 'add' ? '#0d6efd' : 'black' }}
              >
                <FaUserPlus className="me-2" />
                Add Candidate
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => setActiveTab('view')}
                style={{ color: activeTab === 'view' ? '#0d6efd' : 'black' }}
              >
                <FaList className="me-2" />
                View Candidates ({candidates.length})
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* Add Candidate Tab */}
          {activeTab === 'add' && (
            <AddCandidateForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              resume={resume}
              setResume={setResume}
              vacancies={vacancies}
              loading={loading}
              submitLoading={submitLoading}
              totalMarks={totalMarks}
              isShortlisted={isShortlisted}
              getMarksBadge={getMarksBadge}
            />
          )}

          {/* View Candidates Tab */}
          {activeTab === 'view' && (
            <ViewCandidates
              candidates={candidates}
              calculateTotalMarks={calculateTotalMarks}
              getMarksBadge={getMarksBadge}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Add Candidate Form Component
const AddCandidateForm = ({
  formData,
  handleChange,
  handleSubmit,
  resume,
  setResume,
  vacancies,
  loading,
  submitLoading,
  totalMarks,
  isShortlisted,
  getMarksBadge
}) => (
  <form onSubmit={handleSubmit}>
    <div className="row text-black">
      {/* Personal Details */}
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">Personal Details</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Candidate Name *</label>
              <input
                type="text"
                className="form-control"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleChange}
                required
                style={{ color: 'black' }}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Mobile No *</label>
              <input
                type="text"
                className="form-control"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                required
                style={{ color: 'black' }}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Education & Location */}
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">Education & Location</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Education</label>
              <select
                className="form-control"
                name="education"
                value={formData.education}
                onChange={handleChange}
                style={{ color: 'black' }}
              >
                <option value="">--Choose Education--</option>
                <option value="Graduate in any">Graduate in any</option>
                <option value="Graduate in Maths/Economics">Graduate in Maths/Economics</option>
                <option value="MBA/PG with financial subject">MBA/PG with financial subject</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Age Group</label>
              <select
                className="form-control"
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                style={{ color: 'black' }}
              >
                <option value="">--Choose Age Group--</option>
                <option value="20-25yr">20-25yr</option>
                <option value="26-30yr">26-30yr</option>
                <option value="31-45yr">31-45yr</option>
                <option value="45 & above">45 & above</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Location</label>
              <select
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={{ color: 'black' }}
              >
                <option value="">--Choose Location--</option>
                <option value="H.B Road">H.B Road</option>
                <option value="Arera Colony">Arera Colony</option>
                <option value="BHEL">BHEL</option>
                <option value="Mandideep">Mandideep</option>
                <option value="Others">Others</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Native Place</label>
              <input
                type="text"
                className="form-control"
                name="nativePlace"
                value={formData.nativePlace}
                onChange={handleChange}
                style={{ color: 'black' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Skills & Preferences */}
    <div className="row">
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-header bg-warning text-dark">
            <h6 className="mb-0">Skills & Preferences</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-6">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="vehicle"
                    checked={formData.vehicle}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Has Vehicle</label>
                </div>
              </div>
              <div className="col-6">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="spokenEnglish"
                    checked={formData.spokenEnglish}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Spoken English</label>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Salary Expectation</label>
              <select
                className="form-control"
                name="salaryExpectation"
                value={formData.salaryExpectation}
                onChange={handleChange}
                style={{ color: 'black' }}
              >
                <option value="">--Choose Salary--</option>
                <option value="10K-12K">10K-12K</option>
                <option value="12-15K">12-15K</option>
                <option value="15-18K">15-18K</option>
                <option value="18-20K">18-20K</option>
                <option value="20-25K">20-25K</option>
                <option value="25K & Above">25K & Above</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Applied For *</label>
              {loading ? (
                <div className="form-control">
                  <small>Loading vacancies...</small>
                </div>
              ) : (
                <select
                  className="form-control"
                  name="appliedFor"
                  value={formData.appliedFor}
                  onChange={handleChange}
                  required
                  style={{ color: 'black' }}
                >
                  <option value="">Select Vacancy</option>
                  {vacancies.map(vacancy => (
                    <option key={vacancy._id} value={vacancy._id}>
                      {vacancy.designation}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Experience & Activities */}
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">Experience & Activities (Marks 0-5)</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-6 mb-2">
                <label className="small">Administrative</label>
                <input
                  type="number"
                  className="form-control"
                  name="administrative"
                  value={formData.administrative}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">Insurance Sales</label>
                <input
                  type="number"
                  className="form-control"
                  name="insuranceSales"
                  value={formData.insuranceSales}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">Any Sales</label>
                <input
                  type="number"
                  className="form-control"
                  name="anySales"
                  value={formData.anySales}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">Field Work</label>
                <input
                  type="number"
                  className="form-control"
                  name="fieldWork"
                  value={formData.fieldWork}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">Data Management</label>
                <input
                  type="number"
                  className="form-control"
                  name="dataManagement"
                  value={formData.dataManagement}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">Back Office</label>
                <input
                  type="number"
                  className="form-control"
                  name="backOffice"
                  value={formData.backOffice}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="col-6 mb-2">
                <label className="small">MIS</label>
                <input
                  type="number"
                  className="form-control"
                  name="mis"
                  value={formData.mis}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Resume & Grading */}
    <div className="row">
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-header bg-secondary text-white">
            <h6 className="mb-0">Resume Upload</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setResume(e.target.files[0])}
              />
              <small className="text-muted">
                PDF, DOC, DOCX, JPG, PNG (Max 5MB)
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">Grading Summary</h6>
          </div>
          <div className="card-body text-center">
            <div className="display-4 mb-2">
              {isShortlisted ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-danger" />}
            </div>
            <h4 className={getMarksBadge(totalMarks).replace('badge', '')}>
              {totalMarks} Points
            </h4>
            <p className="mb-1">
              Status: <strong>{isShortlisted ? 'SHORTLISTED' : 'NOT SHORTLISTED'}</strong>
            </p>
            <small className="text-muted">
              Minimum 20 points required for shortlisting
            </small>
          </div>
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className="text-center">
      <button 
        type="submit" 
        className="btn btn-success btn-lg px-5"
        disabled={submitLoading || loading}
      >
        {submitLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Adding Candidate...
          </>
        ) : (
          <>
            <FaUserPlus className="me-2" />
            Add Candidate
          </>
        )}
      </button>
    </div>
  </form>
);

// View Candidates Component
const ViewCandidates = ({ candidates, calculateTotalMarks, getMarksBadge }) => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0">All Candidates ({candidates.length})</h5>
      <div className="btn-group">
        <button className="btn btn-outline-primary btn-sm">All</button>
        <button className="btn btn-outline-success btn-sm">Shortlisted</button>
        <button className="btn btn-outline-warning btn-sm">Pending</button>
      </div>
    </div>

    {candidates.length === 0 ? (
      <div className="text-center py-5">
        <FaList className="display-1 text-muted mb-3" />
        <h5>No Candidates Found</h5>
        <p className="text-muted">Add your first candidate to get started</p>
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Candidate</th>
              <th>Contact</th>
              <th>Applied For</th>
              <th>Education</th>
              <th>Experience</th>
              <th>Marks</th>
              <th>Status</th>
              <th>Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const totalMarks = calculateTotalMarks(candidate);
              const isShortlisted = totalMarks >= 20;
              
              return (
                <tr key={candidate._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                        {candidate.candidateName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <strong>{candidate.candidateName}</strong>
                        <br />
                        <small className="text-muted">{candidate.designation}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{candidate.mobileNo}</div>
                    <small className="text-muted">{candidate.email}</small>
                  </td>
                  <td>{candidate.appliedFor?.designation || 'N/A'}</td>
                  <td>
                    <small>{candidate.education}</small>
                    <br />
                    <small className="text-muted">{candidate.ageGroup}</small>
                  </td>
                  <td>
                    <small>Admin: {candidate.experienceFields?.administrative || 0}</small>
                    <br />
                    <small>Sales: {candidate.experienceFields?.anySales || 0}</small>
                  </td>
                  <td>
                    <span className={getMarksBadge(totalMarks)}>
                      {totalMarks} pts
                    </span>
                  </td>
                  <td>
                    {isShortlisted ? (
                      <span className="badge bg-success">
                        <FaCheckCircle className="me-1" />
                        Shortlisted
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        <FaTimesCircle className="me-1" />
                        Not Shortlisted
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-info">{candidate.currentStage}</span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="View">
                        <FaStar />
                      </button>
                      <button className="btn btn-outline-success" title="Download Resume">
                        <FaFilePdf />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AddCandidate;