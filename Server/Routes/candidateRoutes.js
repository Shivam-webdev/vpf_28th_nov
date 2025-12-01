// Routes/candidateRoutes.js
const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/candidate-resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created candidate resumes directory:', uploadDir);
}

// Configure multer for resume upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add new candidate with grading system - DEBUG VERSION
router.post('/add', upload.single('resume'), async (req, res) => {
  try {
    console.log('📥 Received request body:', req.body);
    console.log('📁 Received resume file:', req.file);

    // ✅ DEBUG: Check all fields
    console.log('🔍 Field Check:');
    console.log('candidateName:', req.body.candidateName);
    console.log('mobileNo:', req.body.mobileNo);
    console.log('appliedFor:', req.body.appliedFor);
    console.log('vehicle:', req.body.vehicle, 'type:', typeof req.body.vehicle);
    console.log('spokenEnglish:', req.body.spokenEnglish, 'type:', typeof req.body.spokenEnglish);

    const {
      candidateName, mobileNo, email, designation, education, ageGroup,
      vehicle, location, nativePlace, spokenEnglish, salaryExpectation,
      administrative, insuranceSales, anySales, fieldWork,
      dataManagement, backOffice, mis, appliedFor, interviewDate
    } = req.body;

    // ✅ SIMPLE VALIDATION - Remove strict checks temporarily
    if (!candidateName || !mobileNo) {
      return res.status(400).json({
        success: false,
        message: 'Candidate Name and Mobile Number are required'
      });
    }

    // ✅ Check if appliedFor is valid ObjectId
    if (!appliedFor) {
      return res.status(400).json({
        success: false,
        message: 'Please select a vacancy to apply for'
      });
    }

    // ✅ Convert string booleans to actual booleans
    const vehicleBool = vehicle === 'true';
    const spokenEnglishBool = spokenEnglish === 'true';

    const candidateData = {
      candidateName,
      mobileNo,
      email: email || '',
      designation: designation || '',
      education: education || '',
      ageGroup: ageGroup || '',
      vehicle: vehicleBool,
      location: location || '',
      nativePlace: nativePlace || '',
      spokenEnglish: spokenEnglishBool,
      salaryExpectation: salaryExpectation || '',
      experienceFields: {
        administrative: parseInt(administrative) || 0,
        insuranceSales: parseInt(insuranceSales) || 0,
        anySales: parseInt(anySales) || 0,
        fieldWork: parseInt(fieldWork) || 0
      },
      operationalActivities: {
        dataManagement: parseInt(dataManagement) || 0,
        backOffice: parseInt(backOffice) || 0,
        mis: parseInt(mis) || 0
      },
      appliedFor,
      interviewDate: interviewDate || null,
      currentStage: 'Career Enquiry',
      currentStatus: 'Career Enquiry',
      appliedDate: new Date()
    };

    console.log('💾 Candidate data to save:', candidateData);

    if (req.file) {
      candidateData.resume = req.file.filename;
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    // Populate appliedFor details
    await candidate.populate('appliedFor', 'designation');

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      candidate: {
        ...candidate.toObject(),
        totalMarks: candidate.totalMarks,
        shortlisted: candidate.shortlisted
      }
    });
  } catch (error) {
    console.error('❌ Error adding candidate:', error);
    
    // ✅ More detailed error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message,
        details: error.errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding candidate',
      error: error.message
    });
  }
});

// Update candidate stage
router.put('/:id/stage', async (req, res) => {
  try {
    const { currentStage, interviewDate } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { 
        currentStage,
        interviewDate: interviewDate || null,
        currentStatus: currentStage === 'Selected' ? 'Joining Data' : 
                      currentStage === 'Joining Data' ? 'Joining Data' : currentStage
      },
      { new: true }
    ).populate('appliedFor', 'designation');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      message: `Candidate moved to ${currentStage}`,
      candidate
    });
  } catch (error) {
    console.error('❌ Error updating candidate stage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating candidate stage',
      error: error.message
    });
  }
});

// Get candidates by stage
router.get('/stage/:stage', async (req, res) => {
  try {
    const filter = req.params.stage === 'All' ? {} : { currentStage: req.params.stage };
    
    const candidates = await Candidate.find(filter)
      .populate('appliedFor', 'designation')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || []
    });
  } catch (error) {
    console.error('❌ Error fetching candidates by stage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
});

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('appliedFor', 'designation')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      candidates: candidates || []
    });
  } catch (error) {
    console.error('❌ Error fetching all candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
});

module.exports = router;