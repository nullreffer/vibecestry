/**
 * Utility functions for generating person data
 */
export class PersonDataUtils {
  
  static sampleNames = {
    parent: ['Robert Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown', 'Michael Davis', 'Lisa Anderson'],
    child: ['Emma Doe', 'Michael Doe', 'Sofia Doe', 'James Doe', 'Olivia Smith', 'William Johnson'],
    spouse: ['Jane Smith', 'Lisa Johnson', 'Anna Wilson', 'Kate Brown', 'Jennifer Davis', 'Mark Thompson'],
    sibling: ['Alex Johnson', 'Taylor Smith', 'Jordan Wilson', 'Casey Brown', 'Riley Davis', 'Morgan Anderson'],
    default: ['John Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown']
  };

  static locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
  ];

  static occupations = [
    'Engineer', 'Teacher', 'Doctor', 'Lawyer', 'Artist', 'Manager',
    'Designer', 'Developer', 'Nurse', 'Accountant', 'Consultant', 'Writer',
    'Student', 'Retired', 'Entrepreneur', 'Scientist', 'Chef', 'Musician'
  ];

  /**
   * Generate person data based on relationship type
   */
  static generatePersonData(relationshipType = 'default') {
    const nameGroup = this.sampleNames[relationshipType] || this.sampleNames.default;
    const randomName = nameGroup[Math.floor(Math.random() * nameGroup.length)];
    
    return {
      name: randomName,
      biologicalSex: Math.random() > 0.5 ? 'male' : 'female',
      birthDate: this.generateBirthDate(relationshipType),
      deathDate: '',
      location: this.locations[Math.floor(Math.random() * this.locations.length)],
      occupation: this.occupations[Math.floor(Math.random() * this.occupations.length)],
      notes: ''
    };
  }

  /**
   * Generate realistic birth date based on relationship type
   */
  static generateBirthDate(relationshipType) {
    const currentYear = new Date().getFullYear();
    let yearRange;

    switch (relationshipType) {
      case 'parent':
        yearRange = { min: currentYear - 70, max: currentYear - 30 };
        break;
      case 'child':
        yearRange = { min: currentYear - 25, max: currentYear - 1 };
        break;
      case 'spouse':
        yearRange = { min: currentYear - 60, max: currentYear - 20 };
        break;
      case 'sibling':
        yearRange = { min: currentYear - 50, max: currentYear - 15 };
        break;
      default:
        yearRange = { min: currentYear - 80, max: currentYear - 20 };
    }

    const year = Math.floor(Math.random() * (yearRange.max - yearRange.min + 1)) + yearRange.min;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate person data
   */
  static validatePersonData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!data.biologicalSex) {
      errors.push('Biological sex is required');
    }
    
    if (data.birthDate && !this.isValidDate(data.birthDate)) {
      errors.push('Invalid birth date format');
    }
    
    if (data.deathDate && !this.isValidDate(data.deathDate)) {
      errors.push('Invalid death date format');
    }
    
    if (data.birthDate && data.deathDate && 
        new Date(data.birthDate) >= new Date(data.deathDate)) {
      errors.push('Death date must be after birth date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if date string is valid
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate, referenceDate = new Date()) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const reference = new Date(referenceDate);
    
    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format person display name with age
   */
  static formatDisplayName(personData) {
    const age = this.calculateAge(personData.birthDate);
    const ageText = age !== null ? ` (${age})` : '';
    return `${personData.name}${ageText}`;
  }
}
