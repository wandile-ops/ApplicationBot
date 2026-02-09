const validator = require('validator');
const moment = require('moment');

class ValidationService {
  static validateSAID(idNumber) {
    if (!idNumber || typeof idNumber !== 'string') {
      return { valid: false, message: 'ID number is required' };
    }
    
    const cleanId = idNumber.replace(/\D/g, '');
    
    if (cleanId.length !== 13) {
      return { valid: false, message: 'ID number must be 13 digits' };
    }
    
    if (!/^\d+$/.test(cleanId)) {
      return { valid: false, message: 'ID number must contain only digits' };
    }
    
    let sum = 0;
    let even = false;
    
    for (let i = cleanId.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanId.charAt(i), 10);
      
      if (even) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      even = !even;
    }
    
    if ((sum % 10) !== 0) {
      return { valid: false, message: 'Invalid ID number format' };
    }
    
    const yearPrefix = parseInt(cleanId.substring(0, 2), 10);
    const month = parseInt(cleanId.substring(2, 4), 10);
    const day = parseInt(cleanId.substring(4, 6), 10);
    
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const previousCentury = currentCentury - 100;
    
    let year = yearPrefix < 22 ? currentCentury + yearPrefix : previousCentury + yearPrefix;
    
    const dob = moment(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, 'YYYY-MM-DD');
    
    if (!dob.isValid()) {
      return { valid: false, message: 'Invalid date in ID number' };
    }
    
    if (dob.isAfter(moment())) {
      return { valid: false, message: 'Date of birth cannot be in the future' };
    }
    
    const age = moment().diff(dob, 'years');
    if (age < 16) {
      return { valid: false, message: 'Applicant must be at least 16 years old' };
    }
    if (age > 120) {
      return { valid: false, message: 'Invalid date of birth' };
    }
    
    return {
      valid: true,
      message: 'Valid ID number',
      data: {
        idNumber: cleanId,
        dateOfBirth: dob.format('YYYY-MM-DD'),
        age: age
      }
    };
  }

  static validateEmail(email) {
    if (!email) {
      return { valid: false, message: 'Email is required' };
    }
    
    if (!validator.isEmail(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    const domain = email.split('@')[1];
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    if (!allowedDomains.includes(domain.toLowerCase()) && 
        !domain.toLowerCase().endsWith('.co.za') && 
        !domain.toLowerCase().includes('.ac.za')) {
      return { 
        valid: false, 
        message: 'Please use a valid email provider or South African domain' 
      };
    }
    
    return { valid: true, message: 'Valid email' };
  }

  static validatePhone(phone) {
    if (!phone) {
      return { valid: false, message: 'Phone number is required' };
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone.match(/^(0|27)/)) {
      return { valid: false, message: 'Please enter a valid South African phone number' };
    }
    
    let formattedPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '27' + cleanPhone.substring(1);
    } else {
      formattedPhone = cleanPhone;
    }
    
    if (formattedPhone.length !== 11) {
      return { valid: false, message: 'Phone number must be 10 digits (including area code)' };
    }
    
    const prefix = formattedPhone.substring(2, 3);
    if (!['6', '7', '8'].includes(prefix)) {
      return { valid: false, message: 'Please enter a valid mobile number' };
    }
    
    return {
      valid: true,
      message: 'Valid phone number',
      data: {
        formatted: `+${formattedPhone}`,
        whatsappFormat: formattedPhone
      }
    };
  }

  static validateDOB(dob) {
    if (!dob) {
      return { valid: false, message: 'Date of birth is required' };
    }
    
    const formats = ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];
    const date = moment(dob, formats, true);
    
    if (!date.isValid()) {
      return { valid: false, message: 'Please enter date in format DD/MM/YYYY (e.g., 15/01/1990)' };
    }
    
    if (date.isAfter(moment())) {
      return { valid: false, message: 'Date of birth cannot be in the future' };
    }
    
    const age = moment().diff(date, 'years');
    if (age < 16) {
      return { valid: false, message: 'You must be at least 16 years old to apply' };
    }
    
    if (age > 120) {
      return { valid: false, message: 'Please enter a valid date of birth' };
    }
    
    return {
      valid: true,
      message: 'Valid date of birth',
      data: {
        dob: date.format('YYYY-MM-DD'),
        age: age
      }
    };
  }

  static validateName(name) {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: 'Name is required and must be at least 2 characters' };
    }
    
    if (name.length > 100) {
      return { valid: false, message: 'Name is too long (maximum 100 characters)' };
    }
    
    if (!/^[A-Za-zÀ-ÿ\s\-\']+$/.test(name)) {
      return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { valid: true, message: 'Valid name' };
  }

  static validateBusinessName(name) {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: 'Business name is required and must be at least 2 characters' };
    }
    
    if (name.length > 200) {
      return { valid: false, message: 'Business name is too long (maximum 200 characters)' };
    }
    
    return { valid: true, message: 'Valid business name' };
  }

  static validateCIPC(cipc) {
    if (!cipc || cipc.toLowerCase() === 'skip') {
      return { valid: true, message: 'No CIPC provided (optional)' };
    }
    
    const cleanCIPC = cipc.replace(/\s/g, '').toUpperCase();
    const pattern = /^[A-Z]{2}\d{4}\/\d{6}\/\d{2}$/;
    
    if (!pattern.test(cleanCIPC)) {
      return { valid: false, message: 'Please enter CIPC in format: CK2012/123456/07 or type SKIP' };
    }
    
    return { valid: true, message: 'Valid CIPC number' };
  }

  static validateNumber(input, min = 0, max = 1000000000) {
    if (!input && input !== 0) {
      return { valid: false, message: 'This field is required' };
    }
    
    const num = parseInt(input, 10);
    
    if (isNaN(num)) {
      return { valid: false, message: 'Please enter a valid number' };
    }
    
    if (num < min) {
      return { valid: false, message: `Value must be at least ${min}` };
    }
    
    if (num > max) {
      return { valid: false, message: `Value must be less than ${max}` };
    }
    
    return { valid: true, message: 'Valid number', data: num };
  }

  static validateCurrencyAmount(amount, min = 1000, max = 10000000) {
    if (!amount && amount !== 0) {
      return { valid: false, message: 'Funding amount is required' };
    }
    
    const cleanAmount = String(amount).replace(/[R$,]/g, '').trim();
    const num = parseFloat(cleanAmount);
    
    if (isNaN(num)) {
      return { valid: false, message: 'Please enter a valid amount (numbers only)' };
    }
    
    if (num < min) {
      return { valid: false, message: `Funding amount must be at least R${min.toLocaleString()}` };
    }
    
    if (num > max) {
      return { valid: false, message: `Funding amount must be less than R${max.toLocaleString()}` };
    }
    
    return {
      valid: true,
      message: 'Valid funding amount',
      data: num
    };
  }

  static validateFundingAmount(amount) {
    return this.validateCurrencyAmount(amount, 1000, 10000000);
  }

  static validateYearsInOperation(years) {
    const validation = this.validateNumber(years, 0, 50);
    
    if (!validation.valid) {
      return validation;
    }
    
    return {
      valid: true,
      message: 'Valid years in operation',
      data: validation.data
    };
  }

  static validateEmployeeCount(count) {
    const validation = this.validateNumber(count, 0, 1000);
    
    if (!validation.valid) {
      return validation;
    }
    
    return {
      valid: true,
      message: 'Valid employee count',
      data: validation.data
    };
  }

  static validateAddressField(field, fieldName) {
    if (!field || field.trim().length === 0) {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    if (field.length > 200) {
      return { valid: false, message: `${fieldName} is too long (maximum 200 characters)` };
    }
    
    return { valid: true, message: `Valid ${fieldName.toLowerCase()}` };
  }

  static validateZipCode(zip) {
    if (!zip) {
      return { valid: false, message: 'ZIP code is required' };
    }
    
    const cleanZip = zip.replace(/\s/g, '');
    
    if (!/^\d{4}$/.test(cleanZip)) {
      return { valid: false, message: 'ZIP code must be 4 digits (e.g., 2000)' };
    }
    
    const zipNum = parseInt(cleanZip, 10);
    
    if (zipNum < 1 || zipNum > 9999) {
      return { valid: false, message: 'Please enter a valid South African postal code' };
    }
    
    return { valid: true, message: 'Valid ZIP code', data: cleanZip };
  }

  static validateSelection(input, options) {
    if (!input) {
      return { valid: false, message: 'Please make a selection' };
    }
    
    const normalizedInput = input.toLowerCase().trim();
    const normalizedOptions = options.map(opt => opt.toLowerCase().trim());
    
    if (normalizedOptions.includes(normalizedInput)) {
      return { valid: true, message: 'Valid selection' };
    }
    
    const num = parseInt(normalizedInput, 10);
    if (!isNaN(num) && num >= 1 && num <= options.length) {
      return { 
        valid: true, 
        message: 'Valid selection',
        data: options[num - 1]
      };
    }
    
    return { 
      valid: false, 
      message: `Please select one of: ${options.join(', ')}` 
    };
  }

  static validateMultipleSelections(input, options) {
    if (!input) {
      return { valid: true, message: 'No selections made (optional)' };
    }
    
    const selections = input.split(',').map(s => s.trim()).filter(s => s);
    const validSelections = [];
    
    for (const selection of selections) {
      const normalizedSelection = selection.toLowerCase();
      const foundOption = options.find(opt => 
        opt.toLowerCase().includes(normalizedSelection) || 
        normalizedSelection.includes(opt.toLowerCase())
      );
      
      if (foundOption) {
        validSelections.push(foundOption);
      }
    }
    
    if (validSelections.length === 0) {
      return { 
        valid: false, 
        message: `Please select from: ${options.join(', ')}` 
      };
    }
    
    return { 
      valid: true, 
      message: 'Valid selections',
      data: validSelections
    };
  }

  static validateTextField(text, fieldName, minLength = 10, maxLength = 1000) {
    if (!text || text.trim().length === 0) {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    if (text.trim().length < minLength) {
      return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
    }
    
    if (text.length > maxLength) {
      return { valid: false, message: `${fieldName} is too long (maximum ${maxLength} characters)` };
    }
    
    return { valid: true, message: `Valid ${fieldName.toLowerCase()}` };
  }
}

module.exports = ValidationService;