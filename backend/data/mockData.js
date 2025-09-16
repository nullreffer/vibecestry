// Mock data for family tree flows
let flows = [
  {
    id: '1',
    name: 'Smith Family Tree',
    description: 'The Smith family ancestry going back 4 generations',
    nodeCount: 4,
    edgeCount: 3,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '2',
    name: 'Johnson Heritage',
    description: 'Johnson family lineage from Ireland to America',
    nodeCount: 4,
    edgeCount: 4,
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    name: 'Garcia Ancestry',
    description: 'Garcia family tree with Spanish and Mexican roots',
    nodeCount: 6,
    edgeCount: 7,
    createdAt: '2024-01-13T16:20:00Z',
    updatedAt: '2024-01-14T08:30:00Z'
  }
];

// Sample family tree data for specific flows
let flowsData = {
  '1': {
    id: '1',
    name: 'Smith Family Tree',
    description: 'The Smith family ancestry going back 4 generations',
    nodes: [
      {
        id: '1',
        type: 'person',
        data: { 
          name: 'John Smith',
          biologicalSex: 'male',
          birthDate: '1965-03-15',
          location: 'Boston, MA',
          occupation: 'Engineer',
          notes: ''
        },
        position: { x: 400, y: 200 },
      },
      {
        id: '2',
        type: 'person',
        data: { 
          name: 'Mary Johnson',
          biologicalSex: 'female',
          birthDate: '1967-08-22',
          location: 'Boston, MA',
          occupation: 'Teacher',
          notes: ''
        },
        position: { x: 650, y: 200 },
      },
      {
        id: '3',
        type: 'person',
        data: { 
          name: 'Robert Smith',
          biologicalSex: 'male',
          birthDate: '1940-12-05',
          location: 'New York, NY',
          occupation: 'Retired',
          notes: ''
        },
        position: { x: 400, y: 50 },
      },
      {
        id: '4',
        type: 'person',
        data: { 
          name: 'Emily Davis',
          biologicalSex: 'female',
          birthDate: '1992-05-10',
          location: 'Boston, MA',
          occupation: 'Designer',
          notes: ''
        },
        position: { x: 525, y: 350 },
      },
    ],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        type: 'relationship',
        data: { label: 'Husband', relationshipType: 'spouse' },
        style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
      },
      { 
        id: 'e3-1', 
        source: '3', 
        target: '1', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e1-4', 
        source: '1', 
        target: '4', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Johnson Heritage',
    description: 'Johnson family lineage from Ireland to America',
    nodes: [
      {
        id: '1',
        type: 'person',
        data: { 
          name: 'Sarah Johnson',
          biologicalSex: 'female',
          birthDate: '1945-11-30',
          location: 'Chicago, IL',
          occupation: 'Nurse',
          notes: ''
        },
        position: { x: 300, y: 150 },
      },
      {
        id: '2',
        type: 'person',
        data: { 
          name: 'Michael Thompson',
          biologicalSex: 'male',
          birthDate: '1970-07-18',
          location: 'Chicago, IL',
          occupation: 'Lawyer',
          notes: ''
        },
        position: { x: 300, y: 300 },
      },
      {
        id: '3',
        type: 'person',
        data: { 
          name: 'Lisa Anderson',
          biologicalSex: 'female',
          birthDate: '1972-02-14',
          location: 'Milwaukee, WI',
          occupation: 'Doctor',
          notes: ''
        },
        position: { x: 550, y: 300 },
      },
      {
        id: '4',
        type: 'person',
        data: { 
          name: 'James Thompson',
          biologicalSex: 'male',
          birthDate: '2000-09-05',
          location: 'Chicago, IL',
          occupation: 'Student',
          notes: ''
        },
        position: { x: 425, y: 450 },
      }
    ],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        type: 'relationship',
        data: { label: 'Mother', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        type: 'relationship',
        data: { label: 'Husband', relationshipType: 'spouse' },
        style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
      },
      { 
        id: 'e2-4', 
        source: '2', 
        target: '4', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e3-4', 
        source: '3', 
        target: '4', 
        type: 'relationship',
        data: { label: 'Mother', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Garcia Ancestry',
    description: 'Garcia family tree with Spanish and Mexican roots',
    nodes: [
      {
        id: '1',
        type: 'person',
        data: { 
          name: 'Carlos Garcia',
          biologicalSex: 'male',
          birthDate: '1935-04-12',
          location: 'Mexico City, Mexico',
          occupation: 'Farmer',
          notes: 'Immigrated to US in 1960'
        },
        position: { x: 400, y: 100 },
      },
      {
        id: '2',
        type: 'person',
        data: { 
          name: 'Maria Lopez',
          biologicalSex: 'female',
          birthDate: '1938-09-03',
          location: 'Guadalajara, Mexico',
          occupation: 'Homemaker',
          notes: ''
        },
        position: { x: 650, y: 100 },
      },
      {
        id: '3',
        type: 'person',
        data: { 
          name: 'Juan Garcia',
          biologicalSex: 'male',
          birthDate: '1962-12-18',
          location: 'Los Angeles, CA',
          occupation: 'Mechanic',
          notes: ''
        },
        position: { x: 300, y: 250 },
      },
      {
        id: '4',
        type: 'person',
        data: { 
          name: 'Sofia Garcia',
          biologicalSex: 'female',
          birthDate: '1965-06-25',
          location: 'Los Angeles, CA',
          occupation: 'Nurse',
          notes: ''
        },
        position: { x: 525, y: 250 },
      },
      {
        id: '5',
        type: 'person',
        data: { 
          name: 'Rosa Garcia',
          biologicalSex: 'female',
          birthDate: '1968-01-14',
          location: 'Phoenix, AZ',
          occupation: 'Teacher',
          notes: ''
        },
        position: { x: 750, y: 250 },
      },
      {
        id: '6',
        type: 'person',
        data: { 
          name: 'Diego Garcia',
          biologicalSex: 'male',
          birthDate: '1995-03-08',
          location: 'Los Angeles, CA',
          occupation: 'Software Engineer',
          notes: ''
        },
        position: { x: 412, y: 400 },
      }
    ],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        type: 'relationship',
        data: { label: 'Husband', relationshipType: 'spouse' },
        style: { stroke: '#e24a90', strokeWidth: 3, strokeDasharray: '5,5' }
      },
      { 
        id: 'e1-3', 
        source: '1', 
        target: '3', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e1-4', 
        source: '1', 
        target: '4', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e1-5', 
        source: '1', 
        target: '5', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        type: 'relationship',
        data: { label: 'Mother', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e2-4', 
        source: '2', 
        target: '4', 
        type: 'relationship',
        data: { label: 'Mother', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
      { 
        id: 'e3-6', 
        source: '3', 
        target: '6', 
        type: 'relationship',
        data: { label: 'Father', relationshipType: 'biological-parent' },
        animated: true,
        style: { stroke: '#6ede87', strokeWidth: 2 }
      },
    ],
  }
};

// Default flow data for new flows (used by AddFlow)
let defaultFlowData = {
  nodes: [
    {
      id: '1',
      type: 'person',
      position: { x: 400, y: 300 },
      data: {
        name: 'John Doe',
        biologicalSex: 'male',
        birthDate: '1950-01-15',
        deathDate: '',
        location: 'New York, NY',
        occupation: 'Engineer',
        notes: 'Family patriarch'
      }
    },
    {
      id: '2',
      type: 'person',
      position: { x: 600, y: 300 },
      data: {
        name: 'Jane Smith',
        biologicalSex: 'female',
        birthDate: '1952-03-22',
        deathDate: '',
        location: 'New York, NY',
        occupation: 'Teacher',
        notes: 'Loving mother'
      }
    },
    {
      id: '3',
      type: 'person',
      position: { x: 500, y: 150 },
      data: {
        name: 'Robert Doe',
        biologicalSex: 'male',
        birthDate: '1975-07-10',
        deathDate: '',
        location: 'Boston, MA',
        occupation: 'Doctor',
        notes: 'Eldest son'
      }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'relationship',
      data: { label: 'Spouse', relationshipType: 'spouse' },
      style: { stroke: '#ff69b4', strokeWidth: 2, strokeDasharray: '3,3' }
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'relationship',
      data: { label: 'Father', relationshipType: 'biological-parent' },
      style: { stroke: '#6ede87', strokeWidth: 2, strokeDasharray: 'none' }
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'relationship',
      data: { label: 'Mother', relationshipType: 'biological-parent' },
      style: { stroke: '#6ede87', strokeWidth: 2, strokeDasharray: 'none' }
    }
  ]
};

module.exports = {
  flows,
  flowsData,
  defaultFlowData
};
