const Airtable = require('airtable');
const winston = require('winston');
const moment = require('moment');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'airtable.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class AirtableService {
  constructor() {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      logger.error('Airtable configuration missing');
      throw new Error('Airtable configuration missing');
    }
    
    this.base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);
    
    this.tableName = 'Applicants';
    
    // Valid status options from your Airtable schema
    this.validStatusOptions = ['Draft', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
    
    // Define field name mappings - EXACTLY matching your schema
    // EXCLUDING computed fields that cannot be set manually
    this.fieldMappings = {
      // Primary Field
      'South African ID': 'South African ID',
      
      // Personal Information
      'Full Name': 'Full Name',
      'Date of Birth': 'Date of Birth',
      'Phone Number': 'Phone Number',
      'Email Address': 'Email Address',
      
      // Business Information
      'Business Name': 'Business Name',
      'Trading Name': 'Trading Name',
      'Business Type': 'Business Type',
      'CIPC Registration Number': 'CIPC Registration Number',
      'Industry': 'Industry',
      'Sub-Sector': 'Sub-Sector',
      'Business Description': 'Business Description',
      'Years in Operation': 'Years in Operation',
      
      // Address Information
      'Street Address': 'Street Address',
      'Township': 'Township',
      'City': 'City',
      'District': 'District',
      'Zip Code': 'Zip Code',
      'Province': 'Province',
      
      // Employee Information
      'Total Employees': 'Total Employees',
      'Full-Time Count': 'Full-Time Count',
      'Part-Time Count': 'Part-Time Count',
      
      // Financial Information
      'Monthly Revenue Range': 'Monthly Revenue Range',
      
      // Funding Details
      'Funding Amount ZAR': 'Funding Amount ZAR',
      'Funding Purpose': 'Funding Purpose',
      'Other Purpose Details': 'Other Purpose Details',
      'Preferred Funding Type': 'Preferred Funding Type',
      'Loan Repayment Ability': 'Loan Repayment Ability',
      'Funding Justification': 'Funding Justification',
      
      // Readiness Assessment
      'Business Plan Status': 'Business Plan Status',
      'Financial Records': 'Financial Records',
      'Bank Statements': 'Bank Statements',
      'Business Training': 'Business Training',
      'Cooperative Interest': 'Cooperative Interest',
      'Self-Assessment Readiness': 'Self-Assessment Readiness',
      'Support Needs': 'Support Needs',
      
      // Metadata - Only fields that exist in your schema
      'Session ID': 'Session ID',
      'Status': 'Status',
      'Submission Date': 'Submission Date',
      'Applicant UUID': 'Applicant UUID',
      'Record ID': 'Record ID'
      
      // EXCLUDED COMPUTED FIELDS - Do not try to set these:
      // 'Confidence Score': 'Confidence Score', - Computed
      // 'Assigned Layer': 'Assigned Layer', - Computed
      // 'Readiness Assessments': 'Readiness Assessments', - Computed
      // 'Manual Review Queues': 'Manual Review Queues', - Computed
      // 'Latest Assessment Total Score': 'Latest Assessment Total Score', - Computed
      // 'Latest Assessment Confidence %': 'Latest Assessment Confidence %', - Computed
      // 'Assessment Count': 'Assessment Count', - Computed
      // 'Manual Review Count': 'Manual Review Count', - Computed
      // 'Funding Justification Summary (AI)': 'Funding Justification Summary (AI)', - AI Generated
      // 'Funding Purpose Category (AI)': 'Funding Purpose Category (AI)', - AI Generated
      // 'Layer Assignment Logics': 'Layer Assignment Logics', - Computed
      // 'Disqualifier Reason': 'Disqualifier Reason', - Computed
      // 'Auto Assigned Layer': 'Auto Assigned Layer', - Computed
      // 'Layer Confidence Score': 'Layer Confidence Score', - Computed
      // 'Auto-Assigned Layer': 'Auto-Assigned Layer', - Computed
      // 'Users': 'Users', - Likely a relation field
      // 'Dashboard Completion %': 'Dashboard Completion %', - Computed
      // 'Current Risk Status': 'Current Risk Status', - Computed
      // 'Assigned Support Layer': 'Assigned Support Layer' - Computed
    };
    
    logger.info('Airtable service initialized', { 
      tableName: this.tableName,
      fields: Object.keys(this.fieldMappings).length,
      validStatusOptions: this.validStatusOptions
    });
  }

  // Helper function to normalize single select values
  normalizeSingleSelectValue(fieldName, value) {
    if (!value) return '';
    
    const valueStr = value.toString().trim();
    
    // Status field - must use valid options
    if (fieldName === 'Status') {
      // Check if the value is in valid options (case insensitive)
      const match = this.validStatusOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase()
      );
      
      if (match) {
        return match;
      }
      
      // Default to 'Draft' if not valid
      logger.warn(`Invalid status value "${valueStr}", defaulting to "Draft"`);
      return 'Draft';
    }
    
    // Loan Repayment Ability options
    if (fieldName === 'Loan Repayment Ability') {
      const upperValue = valueStr.toUpperCase();
      if (upperValue === 'YES' || upperValue === 'Y') return 'Yes';
      if (upperValue === 'NO' || upperValue === 'N') return 'No';
      if (upperValue === 'UNSURE' || upperValue === 'U') return 'Unsure';
      return valueStr;
    }
    
    // Business Type options
    if (fieldName === 'Business Type') {
      const validOptions = [
        'Sole Proprietor',
        'Partnership',
        'Private Company',
        'Public Company',
        'Cooperative',
        'Non-Profit',
        'Other'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase()) ||
        valueStr.toLowerCase().includes(opt.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Industry options
    if (fieldName === 'Industry') {
      const validOptions = [
        'Agriculture',
        'Manufacturing',
        'Retail',
        'Services',
        'Technology',
        'Construction',
        'Other'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Monthly Revenue Range options
    if (fieldName === 'Monthly Revenue Range') {
      const validOptions = [
        '< R10,000',
        'R10,000 - R50,000',
        'R50,001 - R200,000',
        '> R200,000'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Province options
    if (fieldName === 'Province') {
      const validOptions = [
        'Eastern Cape',
        'Free State',
        'Gauteng',
        'KwaZulu-Natal',
        'Limpopo',
        'Mpumalanga',
        'North West',
        'Northern Cape',
        'Western Cape'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Business Plan Status options
    if (fieldName === 'Business Plan Status') {
      const validOptions = [
        'Yes - I have a written plan',
        'Yes - I have a basic plan (not written)',
        'No - I don\'t have one',
        'I need help creating one'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Financial Records options
    if (fieldName === 'Financial Records') {
      const validOptions = [
        'Yes - Detailed records (spreadsheets/software)',
        'Yes - Basic records (notebook/paper)',
        'No - I don\'t keep records',
        'I need help with this'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Bank Statements options
    if (fieldName === 'Bank Statements') {
      const validOptions = [
        'Yes - I have them ready',
        'Yes - But in a personal account',
        'No - Don\'t have business banking',
        'No - Need to open business account'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Business Training options
    if (fieldName === 'Business Training') {
      const validOptions = [
        'Yes - Formal business training',
        'Yes - Some workshops/courses',
        'No - No formal training',
        'I want training opportunities'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Cooperative Interest options
    if (fieldName === 'Cooperative Interest') {
      const validOptions = [
        'Yes - Already a member',
        'Yes - Want to join one',
        'Yes - Want to form one',
        'No - Prefer to work alone',
        'Not sure what it is'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Self-Assessment Readiness options
    if (fieldName === 'Self-Assessment Readiness') {
      const validOptions = [
        '1 - Just starting (need lots of help)',
        '2 - Early stage',
        '3 - Developing',
        '4 - Almost ready',
        '5 - Fully ready (professional operation)'
      ];
      
      // If just a number is provided (e.g., "4"), map it to the full option
      if (/^[1-5]$/.test(valueStr)) {
        const index = parseInt(valueStr) - 1;
        return validOptions[index];
      }
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase() ||
        opt.toLowerCase().includes(valueStr.toLowerCase()) ||
        valueStr.toLowerCase().includes(opt.toLowerCase())
      );
      
      return match || valueStr;
    }
    
    // Preferred Funding Type options
    if (fieldName === 'Preferred Funding Type') {
      const validOptions = [
        'Grant',
        'Loan',
        'Equity',
        'Other'
      ];
      
      const match = validOptions.find(opt => 
        opt.toLowerCase() === valueStr.toLowerCase()
      );
      
      return match || valueStr;
    }
    
    return valueStr;
  }

  formatApplicationData(sessionData) {
    try {
      // Build data object with exact field names
      const data = {};
      
      // Personal Information - Use null for empty dates instead of empty string
      if (sessionData.personalInfo?.idNumber) {
        data[this.fieldMappings['South African ID']] = sessionData.personalInfo.idNumber;
      }
      
      if (sessionData.personalInfo?.fullName) {
        data[this.fieldMappings['Full Name']] = sessionData.personalInfo.fullName;
      }
      
      // Date of Birth - if exists, format it
      if (sessionData.personalInfo?.dob) {
        data[this.fieldMappings['Date of Birth']] = moment(sessionData.personalInfo.dob).format('YYYY-MM-DD');
      }
      
      if (sessionData.personalInfo?.phone) {
        data[this.fieldMappings['Phone Number']] = sessionData.personalInfo.phone;
      }
      
      if (sessionData.personalInfo?.email) {
        data[this.fieldMappings['Email Address']] = sessionData.personalInfo.email;
      }
      
      // Business Information
      if (sessionData.businessInfo?.businessName) {
        data[this.fieldMappings['Business Name']] = sessionData.businessInfo.businessName;
      }
      
      if (sessionData.businessInfo?.tradingName) {
        data[this.fieldMappings['Trading Name']] = sessionData.businessInfo.tradingName;
      } else if (sessionData.businessInfo?.businessName) {
        data[this.fieldMappings['Trading Name']] = sessionData.businessInfo.businessName;
      }
      
      if (sessionData.businessInfo?.businessType) {
        data[this.fieldMappings['Business Type']] = this.normalizeSingleSelectValue(
          'Business Type', 
          sessionData.businessInfo.businessType
        );
      }
      
      if (sessionData.businessInfo?.cipcNumber) {
        data[this.fieldMappings['CIPC Registration Number']] = sessionData.businessInfo.cipcNumber;
      } else {
        data[this.fieldMappings['CIPC Registration Number']] = 'Not Provided';
      }
      
      if (sessionData.businessInfo?.industry) {
        data[this.fieldMappings['Industry']] = this.normalizeSingleSelectValue(
          'Industry', 
          sessionData.businessInfo.industry
        );
      }
      
      if (sessionData.businessInfo?.subSector) {
        data[this.fieldMappings['Sub-Sector']] = sessionData.businessInfo.subSector;
      }
      
      if (sessionData.businessInfo?.description) {
        data[this.fieldMappings['Business Description']] = sessionData.businessInfo.description;
      }
      
      if (sessionData.employmentRevenue?.yearsInOperation !== undefined) {
        data[this.fieldMappings['Years in Operation']] = sessionData.employmentRevenue.yearsInOperation;
      }
      
      // Address Information
      if (sessionData.addressInfo?.streetAddress) {
        data[this.fieldMappings['Street Address']] = sessionData.addressInfo.streetAddress;
      }
      
      if (sessionData.addressInfo?.township) {
        data[this.fieldMappings['Township']] = sessionData.addressInfo.township;
      }
      
      if (sessionData.addressInfo?.city) {
        data[this.fieldMappings['City']] = sessionData.addressInfo.city;
      }
      
      if (sessionData.addressInfo?.district) {
        data[this.fieldMappings['District']] = sessionData.addressInfo.district;
      }
      
      if (sessionData.addressInfo?.zipCode) {
        data[this.fieldMappings['Zip Code']] = sessionData.addressInfo.zipCode;
      }
      
      if (sessionData.addressInfo?.province) {
        data[this.fieldMappings['Province']] = this.normalizeSingleSelectValue(
          'Province', 
          sessionData.addressInfo.province
        );
      }
      
      // Employee Information
      if (sessionData.employmentRevenue?.totalEmployees !== undefined) {
        data[this.fieldMappings['Total Employees']] = sessionData.employmentRevenue.totalEmployees;
      }
      
      if (sessionData.employmentRevenue?.fullTimeCount !== undefined) {
        data[this.fieldMappings['Full-Time Count']] = sessionData.employmentRevenue.fullTimeCount;
      }
      
      if (sessionData.employmentRevenue?.partTimeCount !== undefined) {
        data[this.fieldMappings['Part-Time Count']] = sessionData.employmentRevenue.partTimeCount;
      }
      
      // Financial Information
      if (sessionData.employmentRevenue?.monthlyRevenueRange) {
        data[this.fieldMappings['Monthly Revenue Range']] = this.normalizeSingleSelectValue(
          'Monthly Revenue Range', 
          sessionData.employmentRevenue.monthlyRevenueRange
        );
      }
      
      // Funding Details
      if (sessionData.fundingRequest?.fundingAmount !== undefined) {
        data[this.fieldMappings['Funding Amount ZAR']] = sessionData.fundingRequest.fundingAmount;
      }
      
      // Handle Funding Purpose (Multiple Select)
      if (sessionData.fundingRequest?.fundingPurpose) {
        if (Array.isArray(sessionData.fundingRequest.fundingPurpose)) {
          data[this.fieldMappings['Funding Purpose']] = sessionData.fundingRequest.fundingPurpose;
        } else if (typeof sessionData.fundingRequest.fundingPurpose === 'string') {
          data[this.fieldMappings['Funding Purpose']] = sessionData.fundingRequest.fundingPurpose
            .split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
      }
      
      if (sessionData.fundingRequest?.otherPurposeDetails) {
        data[this.fieldMappings['Other Purpose Details']] = sessionData.fundingRequest.otherPurposeDetails;
      }
      
      if (sessionData.fundingRequest?.preferredFundingType) {
        data[this.fieldMappings['Preferred Funding Type']] = this.normalizeSingleSelectValue(
          'Preferred Funding Type', 
          sessionData.fundingRequest.preferredFundingType
        );
      }
      
      if (sessionData.fundingRequest?.loanRepaymentAbility) {
        data[this.fieldMappings['Loan Repayment Ability']] = this.normalizeSingleSelectValue(
          'Loan Repayment Ability', 
          sessionData.fundingRequest.loanRepaymentAbility
        );
      }
      
      if (sessionData.fundingRequest?.justification) {
        data[this.fieldMappings['Funding Justification']] = sessionData.fundingRequest.justification;
      }
      
      // Readiness Assessment
      if (sessionData.readinessAssessment?.businessPlanStatus) {
        data[this.fieldMappings['Business Plan Status']] = this.normalizeSingleSelectValue(
          'Business Plan Status', 
          sessionData.readinessAssessment.businessPlanStatus
        );
      }
      
      if (sessionData.readinessAssessment?.financialRecords) {
        data[this.fieldMappings['Financial Records']] = this.normalizeSingleSelectValue(
          'Financial Records', 
          sessionData.readinessAssessment.financialRecords
        );
      }
      
      if (sessionData.readinessAssessment?.bankStatements) {
        data[this.fieldMappings['Bank Statements']] = this.normalizeSingleSelectValue(
          'Bank Statements', 
          sessionData.readinessAssessment.bankStatements
        );
      }
      
      if (sessionData.readinessAssessment?.businessTraining) {
        data[this.fieldMappings['Business Training']] = this.normalizeSingleSelectValue(
          'Business Training', 
          sessionData.readinessAssessment.businessTraining
        );
      }
      
      if (sessionData.readinessAssessment?.cooperativeInterest) {
        data[this.fieldMappings['Cooperative Interest']] = this.normalizeSingleSelectValue(
          'Cooperative Interest', 
          sessionData.readinessAssessment.cooperativeInterest
        );
      }
      
      if (sessionData.readinessAssessment?.selfAssessmentReadiness) {
        data[this.fieldMappings['Self-Assessment Readiness']] = this.normalizeSingleSelectValue(
          'Self-Assessment Readiness', 
          sessionData.readinessAssessment.selfAssessmentReadiness
        );
      }
      
      // Handle Support Needs (Multiple Select)
      if (sessionData.readinessAssessment?.supportNeeds) {
        if (Array.isArray(sessionData.readinessAssessment.supportNeeds)) {
          data[this.fieldMappings['Support Needs']] = sessionData.readinessAssessment.supportNeeds;
        } else if (typeof sessionData.readinessAssessment.supportNeeds === 'string') {
          data[this.fieldMappings['Support Needs']] = sessionData.readinessAssessment.supportNeeds
            .split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
      }
      
      // Metadata
      if (sessionData.sessionId) {
        data[this.fieldMappings['Session ID']] = sessionData.sessionId;
        data[this.fieldMappings['Applicant UUID']] = sessionData.sessionId;
      }
      
      // Status field - use normalizeSingleSelectValue to ensure valid option
      if (sessionData.status) {
        data[this.fieldMappings['Status']] = this.normalizeSingleSelectValue('Status', sessionData.status);
      } else {
        data[this.fieldMappings['Status']] = 'Draft'; // Default status
      }
      
      // Always set Submission Date
      data[this.fieldMappings['Submission Date']] = moment().format('YYYY-MM-DD');
      
      // Clean numeric fields (only include if they have values)
      const numericFields = [
        { field: this.fieldMappings['Years in Operation'], value: sessionData.employmentRevenue?.yearsInOperation },
        { field: this.fieldMappings['Total Employees'], value: sessionData.employmentRevenue?.totalEmployees },
        { field: this.fieldMappings['Full-Time Count'], value: sessionData.employmentRevenue?.fullTimeCount },
        { field: this.fieldMappings['Part-Time Count'], value: sessionData.employmentRevenue?.partTimeCount },
        { field: this.fieldMappings['Funding Amount ZAR'], value: sessionData.fundingRequest?.fundingAmount }
      ];
      
      numericFields.forEach(item => {
        if (item.field && item.value !== undefined && item.value !== null) {
          data[item.field] = Number(item.value) || 0;
        }
      });
      
      // Remove any undefined values
      Object.keys(data).forEach(key => {
        if (data[key] === undefined || data[key] === null) {
          delete data[key];
        }
      });
      
      logger.debug('Formatted application data', { 
        sessionId: sessionData.sessionId,
        fields: Object.keys(data).length,
        status: data[this.fieldMappings['Status']],
        hasDateOfBirth: !!data[this.fieldMappings['Date of Birth']],
        submissionDate: data[this.fieldMappings['Submission Date']]
      });
      
      return data;
    } catch (error) {
      logger.error('Error formatting application data:', error);
      throw error;
    }
  }

  async createApplication(data) {
    try {
      console.log('🔍 createApplication called with data:', {
        sessionId: data.sessionId,
        phoneNumber: data.phoneNumber,
        status: data.status,
        hasPersonalInfo: !!data.personalInfo,
        hasDob: !!(data.personalInfo?.dob)
      });
      
      if (!data.sessionId) {
        console.error('❌ No sessionId provided to createApplication!');
        throw new Error('Session ID is required');
      }
      
      logger.info('Creating new application', { 
        sessionId: data.sessionId,
        phoneNumber: data.personalInfo?.phone,
        status: data.status
      });
      
      const recordData = this.formatApplicationData(data);
      
      // Log the data being sent (for debugging)
      logger.debug('Sending to Airtable:', {
        sessionId: data.sessionId,
        fieldCount: Object.keys(recordData).length,
        status: recordData[this.fieldMappings['Status']],
        sessionIdField: recordData[this.fieldMappings['Session ID']],
        dateOfBirth: recordData[this.fieldMappings['Date of Birth']],
        fields: Object.keys(recordData)
      });
      
      // Check if Session ID already exists
      const existing = await this.findBySessionId(data.sessionId);
      if (existing) {
        logger.info('Session ID already exists, updating instead', { sessionId: data.sessionId });
        return this.updateApplication(data.sessionId, data);
      }
      
      const record = await this.base(this.tableName).create(recordData);
      logger.info('Application created successfully', { 
        recordId: record.getId(),
        sessionId: data.sessionId,
        status: recordData[this.fieldMappings['Status']]
      });
      
      console.log('✅ Record created with ID:', record.getId());
      return record.getId();
    } catch (error) {
      logger.error('Airtable create error:', {
        error: error.message,
        errorDetails: error,
        sessionId: data.sessionId
      });
      console.error('Airtable create error details:', error);
      throw error;
    }
  }

  async updateApplication(sessionId, data) {
    try {
      logger.info('Updating application', { sessionId });
      
      // Find existing record by Session ID
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `{Session ID} = '${sessionId}'`,
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        logger.warn('No application found for session, creating new', { sessionId });
        return this.createApplication(data);
      }
      
      const record = records[0];
      const updateData = this.formatApplicationData({
        ...data,
        sessionId: sessionId
      });
      
      if (data.completed) {
        updateData[this.fieldMappings['Status']] = 'Submitted';
      }
      
      await record.update(updateData);
      logger.info('Application updated successfully', { 
        sessionId,
        recordId: record.id,
        status: updateData[this.fieldMappings['Status']]
      });
      
      return true;
    } catch (error) {
      logger.error('Airtable update error:', {
        error: error.message,
        errorDetails: error,
        sessionId
      });
      throw error;
    }
  }

  async getApplication(sessionId) {
    try {
      logger.debug('Getting application', { sessionId });
      
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `{Session ID} = '${sessionId}'`,
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        return null;
      }
      
      const record = records[0];
      const fields = record.fields;
      
      const applicationData = {
        id: record.id,
        phoneNumber: fields[this.fieldMappings['Phone Number']],
        sessionId: fields[this.fieldMappings['Session ID']],
        status: fields[this.fieldMappings['Status']],
        submissionDate: fields[this.fieldMappings['Submission Date']],
        
        personalInfo: {
          idNumber: fields[this.fieldMappings['South African ID']],
          fullName: fields[this.fieldMappings['Full Name']],
          dob: fields[this.fieldMappings['Date of Birth']],
          phone: fields[this.fieldMappings['Phone Number']],
          email: fields[this.fieldMappings['Email Address']]
        },
        
        businessInfo: {
          businessName: fields[this.fieldMappings['Business Name']],
          tradingName: fields[this.fieldMappings['Trading Name']],
          businessType: fields[this.fieldMappings['Business Type']],
          cipcNumber: fields[this.fieldMappings['CIPC Registration Number']],
          industry: fields[this.fieldMappings['Industry']],
          subSector: fields[this.fieldMappings['Sub-Sector']],
          description: fields[this.fieldMappings['Business Description']]
        },
        
        addressInfo: {
          streetAddress: fields[this.fieldMappings['Street Address']],
          township: fields[this.fieldMappings['Township']],
          city: fields[this.fieldMappings['City']],
          district: fields[this.fieldMappings['District']],
          zipCode: fields[this.fieldMappings['Zip Code']],
          province: fields[this.fieldMappings['Province']]
        },
        
        employmentRevenue: {
          totalEmployees: fields[this.fieldMappings['Total Employees']],
          fullTimeCount: fields[this.fieldMappings['Full-Time Count']],
          partTimeCount: fields[this.fieldMappings['Part-Time Count']],
          yearsInOperation: fields[this.fieldMappings['Years in Operation']],
          monthlyRevenueRange: fields[this.fieldMappings['Monthly Revenue Range']]
        },
        
        fundingRequest: {
          fundingAmount: fields[this.fieldMappings['Funding Amount ZAR']],
          fundingPurpose: fields[this.fieldMappings['Funding Purpose']] || [],
          otherPurposeDetails: fields[this.fieldMappings['Other Purpose Details']],
          preferredFundingType: fields[this.fieldMappings['Preferred Funding Type']],
          loanRepaymentAbility: fields[this.fieldMappings['Loan Repayment Ability']],
          justification: fields[this.fieldMappings['Funding Justification']]
        },
        
        readinessAssessment: {
          businessPlanStatus: fields[this.fieldMappings['Business Plan Status']],
          financialRecords: fields[this.fieldMappings['Financial Records']],
          bankStatements: fields[this.fieldMappings['Bank Statements']],
          businessTraining: fields[this.fieldMappings['Business Training']],
          cooperativeInterest: fields[this.fieldMappings['Cooperative Interest']],
          selfAssessmentReadiness: fields[this.fieldMappings['Self-Assessment Readiness']],
          supportNeeds: fields[this.fieldMappings['Support Needs']] || []
        }
      };
      
      return applicationData;
    } catch (error) {
      logger.error('Airtable get error:', {
        error: error.message,
        sessionId
      });
      throw error;
    }
  }

  async findBySessionId(sessionId) {
    try {
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `{Session ID} = '${sessionId}'`,
          maxRecords: 1
        })
        .firstPage();
      
      return records.length > 0 ? {
        id: records[0].id,
        fields: records[0].fields
      } : null;
    } catch (error) {
      logger.error('Error finding by session ID:', {
        error: error.message,
        sessionId
      });
      return null;
    }
  }

  async findIncompleteApplication(phoneNumber) {
    try {
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `AND({Phone Number} = '${phoneNumber}', OR({Status} = 'Draft', {Status} = 'In Progress'))`,
          sort: [{ field: 'Submission Date', direction: 'desc' }],
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        return null;
      }
      
      const record = records[0];
      return {
        sessionId: record.fields[this.fieldMappings['Session ID']],
        lastUpdated: record.fields[this.fieldMappings['Submission Date']],
        status: record.fields[this.fieldMappings['Status']]
      };
    } catch (error) {
      logger.error('Error finding incomplete application:', error);
      return null;
    }
  }

  async testConnection() {
    try {
      const records = await this.base(this.tableName)
        .select({
          maxRecords: 1
        })
        .firstPage();
      
      return {
        connected: true,
        tableName: this.tableName,
        hasRecords: records.length > 0,
        fields: records.length > 0 ? Object.keys(records[0].fields) : []
      };
    } catch (error) {
      logger.error('Airtable connection test failed:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async getTableSchema() {
    try {
      const records = await this.base(this.tableName)
        .select({
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        return { fields: [] };
      }
      
      const fields = Object.keys(records[0].fields);
      return {
        fields: fields,
        count: fields.length
      };
    } catch (error) {
      logger.error('Error getting table schema:', error);
      return null;
    }
  }
}

module.exports = new AirtableService();