const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  biologicalSex: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  birthDate: {
    type: String,
    default: ''
  },
  deathDate: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  }
});

const marriageSchema = new mongoose.Schema({
  husbandId: {
    type: String,
    default: ''
  },
  husbandName: {
    type: String,
    default: ''
  },
  wifeId: {
    type: String,
    default: ''
  },
  wifeName: {
    type: String,
    default: ''
  },
  marriageDate: {
    type: String,
    default: ''
  },
  separationDate: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
});

const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'person',
    enum: ['person', 'marriage']
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  // Disable strict mode to allow flexible data structure
  strict: false
});

const edgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  sourceHandle: String,
  targetHandle: String,
  type: {
    type: String,
    default: 'relationship'
  },
  data: {
    label: String,
    relationshipType: String
  },
  style: {
    stroke: String,
    strokeWidth: Number,
    strokeDasharray: String
  }
});

const chartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'vibecestrycharts'
});

module.exports = mongoose.model('Chart', chartSchema);