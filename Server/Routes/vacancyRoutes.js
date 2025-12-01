// Routes/vacancyRoutes.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Vacancy = require('../models/Vacancy');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure upload directory exists
const uploadDir = 'public/vacancy-documents/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vacancy-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg', 
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ GET all vacancies
router.get('/', async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdDate: -1 });
    res.json({ 
      success: true, 
      vacancies: vacancies 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching vacancies',
      error: error.message 
    });
  }
});

// ✅ CREATE new vacancy
router.post('/', upload.single('document'), async (req, res) => {
  try {
    console.log('📥 Received request body:', req.body);
    console.log('📁 Received file:', req.file);

    const { vacancy, designation, date, platform, description } = req.body;

    // ✅ Validation
    if (!vacancy && !designation) {
      return res.status(400).json({
        success: false,
        message: 'Vacancy/Designation field is required'
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform field is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    // ✅ Process platform data
    let platformsArray = [];
    if (typeof platform === 'string') {
      platformsArray = platform.split(',').map(p => p.trim()).filter(p => p);
    } else if (Array.isArray(platform)) {
      platformsArray = platform;
    }

    if (platformsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one platform is required'
      });
    }

    // ✅ Create vacancy data
    const vacancyData = {
      designation: vacancy || designation,
      description: description || '',
      publishPlatform: platformsArray,
      createdDate: date ? new Date(date) : new Date(),
      status: 'Active',
      document: req.file.filename // Store filename
    };

    console.log('💾 Creating vacancy with:', vacancyData);

    const newVacancy = new Vacancy(vacancyData);
    await newVacancy.save();

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      vacancy: newVacancy
    });

  } catch (error) {
    console.error('❌ Error creating vacancy:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vacancy',
      error: error.message
    });
  }
});

module.exports = router;