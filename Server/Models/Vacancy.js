// models/Vacancy.js
const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  publishPlatform: [{
    type: String,
    required: true
  }],
  images: [String],
  pdf: String,
  createdDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);