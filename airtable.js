const Airtable = require('airtable');
const winston = require('winston');
const moment = require('moment');
require('dotenv').config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'airtable.log' })
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
    logger.info('Airtable service initialized', { 
      tableName: this.tableName,
      baseId: process.env.AIRTABLE_BASE_ID?.substring(0, 10) + '...' 
    });
  }

  formatApplicationData(sessionData) {
    const data = {
      // Primary Field (must be first)
      'South African ID': sessionData.personalInfo?.idNumber || '',
      
      // Personal Information
      'Full Name': sessionData.personalInfo?.fullName || '',
      'Date of Birth': sessionData.personalInfo?.dob ? 
        moment(sessionData.personalInfo.dob).format('YYYY-MM-DD') : '',
      'Phone Number': sessionData.personalInfo?.phone || '',
      'Email Address': sessionData.personalInfo?.email || '',
      'Name': sessionData.personalInfo?.fullName || '',
      'Email': sessionData.personalInfo?.email || '',
      
      // Business Information
      'Business Name': sessionData.businessInfo?.businessName || '',
      'Trading Name': sessionData.businessInfo?.tradingName || 
        sessionData.businessInfo?.businessName || '',
      'Business Type': sessionData.businessInfo?.businessType || '',
      'CIPC Registration Number': sessionData.businessInfo?.cipcNumber || 'Not Provided',
      'Industry': sessionData.businessInfo?.industry || '',
      'Sub-Sector': sessionData.businessInfo?.subSector || '',
      'Business Description': sessionData.businessInfo?.description || '',
      'Years in Operation': sessionData.employmentRevenue?.yearsInOperation || 0,
      
      // Address Information
      'Street Address': sessionData.addressInfo?.streetAddress || '',
      'Township': sessionData.addressInfo?.township || '',
      'City': sessionData.addressInfo?.city || '',
      'District': sessionData.addressInfo?.district || '',
      'Zip Code': sessionData.addressInfo?.zipCode || '',
      'Province': sessionData.addressInfo?.province || '',
      
      // Employee Information
      'Total Employees': sessionData.employmentRevenue?.totalEmployees || 0,
      'Full-Time Count': sessionData.employmentRevenue?.fullTimeCount || 0,
      'Part-Time Count': sessionData.employmentRevenue?.partTimeCount || 0,
      
      // Financial Information
      'Monthly Revenue Range': sessionData.employmentRevenue?.monthlyRevenueRange || '',
      
      // Funding Details
      'Funding Amount ZAR': sessionData.fundingRequest?.fundingAmount || 0,
      'Funding Purpose': Array.isArray(sessionData.fundingRequest?.fundingPurpose) 
        ? sessionData.fundingRequest.fundingPurpose.join(', ') 
        : sessionData.fundingRequest?.fundingPurpose || '',
      'Other Purpose Details': sessionData.fundingRequest?.otherPurposeDetails || '',
      'Preferred Funding Type': sessionData.fundingRequest?.preferredFundingType || '',
      'Loan Repayment Ability': sessionData.fundingRequest?.loanRepaymentAbility || 'N/A',
      'Funding Justification': sessionData.fundingRequest?.justification || '',
      'Funding Justification Summary (AI)': '',
      'Funding Purpose Category (AI)': '',
      
      // Readiness Assessment Questions
      'Business Plan Status': sessionData.readinessAssessment?.businessPlanStatus || '',
      'Financial Records': sessionData.readinessAssessment?.financialRecords || '',
      'Bank Statements': sessionData.readinessAssessment?.bankStatements || '',
      'Business Training': sessionData.readinessAssessment?.businessTraining || '',
      'Cooperative Interest': sessionData.readinessAssessment?.cooperativeInterest || '',
      'Self-Assessment Readiness': sessionData.readinessAssessment?.selfAssessmentReadiness || '',
      'Support Needs': Array.isArray(sessionData.readinessAssessment?.supportNeeds)
        ? sessionData.readinessAssessment.supportNeeds.join(', ')
        : sessionData.readinessAssessment?.supportNeeds || '',
      
      // Metadata fields
      'WhatsApp Number': sessionData.phoneNumber || '',
      'Session ID': sessionData.sessionId || '',
      'Application Status': sessionData.status || 'Draft',
      'Consent Given': sessionData.consentGiven || false,
      'Consent Timestamp': sessionData.consentTimestamp || '',
      'Application Date': new Date().toISOString(),
      'Last Updated': new Date().toISOString(),
      'Completed': sessionData.completed || false,
      'Completed At': sessionData.completed ? new Date().toISOString() : null
    };
    
    // Clean numeric fields
    const numericFields = [
      'Years in Operation', 'Total Employees', 'Full-Time Count', 
      'Part-Time Count', 'Funding Amount ZAR'
    ];
    
    numericFields.forEach(field => {
      if (data[field] === '' || data[field] === null || data[field] === undefined) {
        data[field] = 0;
      }
      data[field] = Number(data[field]) || 0;
    });
    
    return data;
  }

  async createApplication(data) {
    try {
      logger.info('Creating new application', { 
        sessionId: data.sessionId,
        phoneNumber: data.phoneNumber,
        idNumber: data.personalInfo?.idNumber 
      });
      
      const recordData = this.formatApplicationData(data);
      
      // Check for duplicate ID
      if (recordData['South African ID']) {
        const existing = await this.findByID(recordData['South African ID']);
        if (existing) {
          logger.warn('Duplicate ID found', { 
            idNumber: recordData['South African ID'],
            existingRecordId: existing.id
          });
          return this.updateApplication(existing.fields['Session ID'], data);
        }
      }
      
      const record = await this.base(this.tableName).create(recordData);
      logger.info('Application created successfully', { 
        recordId: record.getId(),
        sessionId: data.sessionId,
        idNumber: recordData['South African ID']
      });
      
      return record.getId();
    } catch (error) {
      logger.error('Airtable create error:', {
        error: error.message,
        sessionId: data.sessionId,
        idNumber: data.personalInfo?.idNumber
      });
      throw error;
    }
  }

  async updateApplication(sessionId, data) {
    try {
      logger.debug('Updating application', { 
        sessionId, 
        status: data.status || 'Draft'
      });
      
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `{Session ID} = '${sessionId}'`,
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        logger.warn('No application found for session', { sessionId });
        return this.createApplication(data);
      }
      
      const record = records[0];
      const existingFields = record.fields;
      
      // Merge data
      const mergedData = {
        personalInfo: {
          idNumber: existingFields['South African ID'] || data.personalInfo?.idNumber,
          fullName: existingFields['Full Name'] || data.personalInfo?.fullName,
          dob: existingFields['Date of Birth'] || data.personalInfo?.dob,
          phone: existingFields['Phone Number'] || data.personalInfo?.phone,
          email: existingFields['Email Address'] || data.personalInfo?.email,
          ...data.personalInfo
        },
        businessInfo: {
          businessName: existingFields['Business Name'] || data.businessInfo?.businessName,
          tradingName: existingFields['Trading Name'] || data.businessInfo?.tradingName,
          businessType: existingFields['Business Type'] || data.businessInfo?.businessType,
          cipcNumber: existingFields['CIPC Registration Number'] || data.businessInfo?.cipcNumber,
          industry: existingFields['Industry'] || data.businessInfo?.industry,
          subSector: existingFields['Sub-Sector'] || data.businessInfo?.subSector,
          description: existingFields['Business Description'] || data.businessInfo?.description,
          ...data.businessInfo
        },
        addressInfo: {
          streetAddress: existingFields['Street Address'] || data.addressInfo?.streetAddress,
          township: existingFields['Township'] || data.addressInfo?.township,
          city: existingFields['City'] || data.addressInfo?.city,
          district: existingFields['District'] || data.addressInfo?.district,
          zipCode: existingFields['Zip Code'] || data.addressInfo?.zipCode,
          province: existingFields['Province'] || data.addressInfo?.province,
          ...data.addressInfo
        },
        employmentRevenue: {
          totalEmployees: existingFields['Total Employees'] || data.employmentRevenue?.totalEmployees,
          fullTimeCount: existingFields['Full-Time Count'] || data.employmentRevenue?.fullTimeCount,
          partTimeCount: existingFields['Part-Time Count'] || data.employmentRevenue?.partTimeCount,
          yearsInOperation: existingFields['Years in Operation'] || data.employmentRevenue?.yearsInOperation,
          monthlyRevenueRange: existingFields['Monthly Revenue Range'] || data.employmentRevenue?.monthlyRevenueRange,
          ...data.employmentRevenue
        },
        fundingRequest: {
          fundingAmount: existingFields['Funding Amount ZAR'] || data.fundingRequest?.fundingAmount,
          fundingPurpose: existingFields['Funding Purpose'] ? 
            existingFields['Funding Purpose'].split(', ') : data.fundingRequest?.fundingPurpose,
          otherPurposeDetails: existingFields['Other Purpose Details'] || data.fundingRequest?.otherPurposeDetails,
          preferredFundingType: existingFields['Preferred Funding Type'] || data.fundingRequest?.preferredFundingType,
          loanRepaymentAbility: existingFields['Loan Repayment Ability'] || data.fundingRequest?.loanRepaymentAbility,
          justification: existingFields['Funding Justification'] || data.fundingRequest?.justification,
          ...data.fundingRequest
        },
        readinessAssessment: {
          businessPlanStatus: existingFields['Business Plan Status'] || data.readinessAssessment?.businessPlanStatus,
          financialRecords: existingFields['Financial Records'] || data.readinessAssessment?.financialRecords,
          bankStatements: existingFields['Bank Statements'] || data.readinessAssessment?.bankStatements,
          businessTraining: existingFields['Business Training'] || data.readinessAssessment?.businessTraining,
          cooperativeInterest: existingFields['Cooperative Interest'] || data.readinessAssessment?.cooperativeInterest,
          selfAssessmentReadiness: existingFields['Self-Assessment Readiness'] || data.readinessAssessment?.selfAssessmentReadiness,
          supportNeeds: existingFields['Support Needs'] ? 
            existingFields['Support Needs'].split(', ') : data.readinessAssessment?.supportNeeds,
          ...data.readinessAssessment
        },
        phoneNumber: existingFields['WhatsApp Number'] || data.phoneNumber,
        sessionId: existingFields['Session ID'] || sessionId,
        status: data.status || existingFields['Application Status'] || 'Draft',
        consentGiven: data.consentGiven !== undefined ? data.consentGiven : existingFields['Consent Given'],
        consentTimestamp: data.consentTimestamp || existingFields['Consent Timestamp'],
        completed: data.completed !== undefined ? data.completed : existingFields['Completed']
      };
      
      const updateData = this.formatApplicationData(mergedData);
      updateData['Last Updated'] = new Date().toISOString();
      
      if (data.status) {
        updateData['Application Status'] = data.status;
      }
      
      if (data.completed) {
        updateData['Completed'] = true;
        updateData['Completed At'] = new Date().toISOString();
        updateData['Application Status'] = 'Submitted';
      }
      
      await record.update(updateData);
      logger.info('Application updated successfully', { 
        sessionId,
        recordId: record.id,
        status: updateData['Application Status']
      });
      
      return true;
    } catch (error) {
      logger.error('Airtable update error:', {
        error: error.message,
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
        phoneNumber: fields['WhatsApp Number'],
        sessionId: fields['Session ID'],
        status: fields['Application Status'],
        consentGiven: fields['Consent Given'],
        consentTimestamp: fields['Consent Timestamp'],
        lastUpdated: fields['Last Updated'],
        completed: fields['Completed'],
        completedAt: fields['Completed At'],
        
        personalInfo: {
          idNumber: fields['South African ID'],
          fullName: fields['Full Name'],
          dob: fields['Date of Birth'],
          phone: fields['Phone Number'],
          email: fields['Email Address']
        },
        
        businessInfo: {
          businessName: fields['Business Name'],
          tradingName: fields['Trading Name'],
          businessType: fields['Business Type'],
          cipcNumber: fields['CIPC Registration Number'],
          industry: fields['Industry'],
          subSector: fields['Sub-Sector'],
          description: fields['Business Description']
        },
        
        addressInfo: {
          streetAddress: fields['Street Address'],
          township: fields['Township'],
          city: fields['City'],
          district: fields['District'],
          zipCode: fields['Zip Code'],
          province: fields['Province']
        },
        
        employmentRevenue: {
          totalEmployees: fields['Total Employees'],
          fullTimeCount: fields['Full-Time Count'],
          partTimeCount: fields['Part-Time Count'],
          yearsInOperation: fields['Years in Operation'],
          monthlyRevenueRange: fields['Monthly Revenue Range']
        },
        
        fundingRequest: {
          fundingAmount: fields['Funding Amount ZAR'],
          fundingPurpose: fields['Funding Purpose']?.split(', ').filter(Boolean) || [],
          otherPurposeDetails: fields['Other Purpose Details'],
          preferredFundingType: fields['Preferred Funding Type'],
          loanRepaymentAbility: fields['Loan Repayment Ability'],
          justification: fields['Funding Justification']
        },
        
        readinessAssessment: {
          businessPlanStatus: fields['Business Plan Status'],
          financialRecords: fields['Financial Records'],
          bankStatements: fields['Bank Statements'],
          businessTraining: fields['Business Training'],
          cooperativeInterest: fields['Cooperative Interest'],
          selfAssessmentReadiness: fields['Self-Assessment Readiness'],
          supportNeeds: fields['Support Needs']?.split(', ').filter(Boolean) || []
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

  async findByID(idNumber) {
    try {
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `{South African ID} = '${idNumber}'`,
          maxRecords: 1
        })
        .firstPage();
      
      return records.length > 0 ? {
        id: records[0].id,
        fields: records[0].fields
      } : null;
    } catch (error) {
      logger.error('Error finding by ID:', { idNumber, error: error.message });
      return null;
    }
  }

  async findIncompleteApplication(phoneNumber) {
    try {
      const records = await this.base(this.tableName)
        .select({
          filterByFormula: `AND({WhatsApp Number} = '${phoneNumber}', OR({Application Status} = 'Draft', {Application Status} = 'In Progress'))`,
          sort: [{ field: 'Last Updated', direction: 'desc' }],
          maxRecords: 1
        })
        .firstPage();
      
      if (records.length === 0) {
        return null;
      }
      
      const record = records[0];
      return {
        sessionId: record.fields['Session ID'],
        lastUpdated: record.fields['Last Updated'],
        status: record.fields['Application Status']
      };
    } catch (error) {
      logger.error('Error finding incomplete application:', {
        error: error.message,
        phoneNumber
      });
      return null;
    }
  }

  async markAsCompleted(sessionId) {
    try {
      await this.updateApplication(sessionId, {
        completed: true,
        status: 'Submitted'
      });
      
      return true;
    } catch (error) {
      logger.error('Error marking as completed:', {
        error: error.message,
        sessionId
      });
      throw error;
    }
  }

  async getApplicationStats() {
    try {
      const records = await this.base(this.tableName)
        .select({
          fields: ['Application Status', 'Application Date', 'Industry', 'Province']
        })
        .all();
      
      const stats = {
        total: records.length,
        draft: 0,
        inProgress: 0,
        submitted: 0,
        byIndustry: {},
        byProvince: {},
        byDate: {}
      };
      
      records.forEach(record => {
        const status = record.get('Application Status') || 'Draft';
        const date = record.get('Application Date');
        const industry = record.get('Industry');
        const province = record.get('Province');
        
        if (status === 'Draft') stats.draft++;
        else if (status === 'In Progress') stats.inProgress++;
        else if (status === 'Submitted') stats.submitted++;
        
        if (date) {
          const dateStr = moment(date).format('YYYY-MM-DD');
          stats.byDate[dateStr] = (stats.byDate[dateStr] || 0) + 1;
        }
        
        if (industry) {
          stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1;
        }
        
        if (province) {
          stats.byProvince[province] = (stats.byProvince[province] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      logger.error('Error getting application stats:', error);
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
      
      const fieldNames = records.length > 0 ? Object.keys(records[0].fields) : [];
      
      return {
        connected: true,
        tableName: this.tableName,
        hasRecords: records.length > 0,
        sampleFields: fieldNames.slice(0, 10),
        fieldCount: fieldNames.length
      };
    } catch (error) {
      logger.error('Airtable connection test failed:', error);
      return {
        connected: false,
        error: error.message,
        tableName: this.tableName
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
      
      const fields = Object.keys(records[0].fields).map(fieldName => ({
        name: fieldName,
        sampleValue: records[0].fields[fieldName],
        type: typeof records[0].fields[fieldName]
      }));
      
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