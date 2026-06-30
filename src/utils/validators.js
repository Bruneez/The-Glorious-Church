export function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
}

export function validatePhone(phone) {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return { valid: false, message: 'Please enter a valid 10-digit phone number' };
  }
  
  return { valid: true, message: '' };
}

export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true, message: '' };
}

export function validateMinLength(value, minLength, fieldName = 'This field') {
  if (!value) return { valid: false, message: `${fieldName} is required` };
  
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { valid: true, message: '' };
}

export function validateMaxLength(value, maxLength, fieldName = 'This field') {
  if (value && value.length > maxLength) {
    return { valid: false, message: `${fieldName} must not exceed ${maxLength} characters` };
  }
  
  return { valid: true, message: '' };
}

export function validateNumber(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  
  return { valid: true, message: '' };
}

export function validatePositiveNumber(value, fieldName = 'This field') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.valid) return numResult;
  
  const num = parseFloat(value);
  if (num <= 0) {
    return { valid: false, message: `${fieldName} must be greater than 0` };
  }
  
  return { valid: true, message: '' };
}

export function validateMinValue(value, minValue, fieldName = 'This field') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.valid) return numResult;
  
  const num = parseFloat(value);
  if (num < minValue) {
    return { valid: false, message: `${fieldName} must be at least ${minValue}` };
  }
  
  return { valid: true, message: '' };
}

export function validateMaxValue(value, maxValue, fieldName = 'This field') {
  const numResult = validateNumber(value, fieldName);
  if (!numResult.valid) return numResult;
  
  const num = parseFloat(value);
  if (num > maxValue) {
    return { valid: false, message: `${fieldName} must not exceed ${maxValue}` };
  }
  
  return { valid: true, message: '' };
}

export function validateDate(value, fieldName = 'This field') {
  if (!value) return { valid: false, message: `${fieldName} is required` };
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, message: `${fieldName} must be a valid date` };
  }
  
  return { valid: true, message: '' };
}

export function validateFutureDate(value, fieldName = 'This field') {
  const dateResult = validateDate(value, fieldName);
  if (!dateResult.valid) return dateResult;
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return { valid: false, message: `${fieldName} must be in the future` };
  }
  
  return { valid: true, message: '' };
}

export function validatePastDate(value, fieldName = 'This field') {
  const dateResult = validateDate(value, fieldName);
  if (!dateResult.valid) return dateResult;
  
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (date > today) {
    return { valid: false, message: `${fieldName} must be in the past` };
  }
  
  return { valid: true, message: '' };
}

export function validateAge(dateOfBirth, minAge = 0, maxAge = 120) {
  if (!dateOfBirth) return { valid: false, message: 'Date of birth is required' };
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { valid: false, message: 'Please enter a valid date of birth' };
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { valid: false, message: `Must be at least ${minAge} years old` };
  }
  
  if (age > maxAge) {
    return { valid: false, message: `Invalid age` };
  }
  
  return { valid: true, message: '' };
}

export function validateUrl(value, fieldName = 'This field') {
  if (!value) return { valid: true, message: '' };
  
  try {
    new URL(value);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: `${fieldName} must be a valid URL` };
  }
}

export function validateFile(file, allowedTypes = [], maxSizeMB = 5) {
  if (!file) return { valid: false, message: 'File is required' };
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `File size must not exceed ${maxSizeMB}MB` };
  }
  
  return { valid: true, message: '' };
}

export function validateForm(formData, validationRules) {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    for (const rule of rules) {
      const result = rule(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
}
