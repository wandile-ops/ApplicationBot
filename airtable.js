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
    logger.info('Airtable service initialized', { tableName: this.tableName });
  }

  formatApplicationData(sessionData) {
    const data = {
      // Primary Field (South African ID)
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
      
      // Metadata
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
        phoneNumber: data.phoneNumber
      });
      
      const recordData = this.formatApplicationData(data);
      
      // Check for duplicate ID
      if (recordData['South African ID']) {
        const existing = await this.findByID(recordData['South African ID']);
        if (existing) {
          logger.warn('Duplicate ID found', { 
            idNumber: recordData['South African ID']
          });
          return this.updateApplication(existing.fields['Session ID'], data);
        }
      }
      
      const record = await this.base(this.tableName).create(recordData);
      logger.info('Application created successfully', { 
        recordId: record.getId(),
        sessionId: data.sessionId
      });
      
      return record.getId();
    } catch (error) {
      logger.error('Airtable create error:', error);
      throw error;
    }
  }

  async updateApplication(sessionId, data) {
    try {
      logger.debug('Updating application', { sessionId });
      
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
        phoneNumber: data.phoneNumber || existingFields['WhatsApp Number'],
        sessionId: sessionId,
        personalInfo: {
          idNumber: data.personalInfo?.idNumber || existingFields['South African ID'],
          fullName: data.personalInfo?.fullName || existingFields['Full Name'],
          dob: data.personalInfo?.dob || existingFields['Date of Birth'],
          phone: data.personalInfo?.phone || existingFields['Phone Number'],
          email: data.personalInfo?.email || existingFields['Email Address']
        },
        businessInfo: {
          businessName: data.businessInfo?.businessName || existingFields['Business Name'],
          tradingName: data.businessInfo?.tradingName || existingFields['Trading Name'],
          businessType: data.businessInfo?.businessType || existingFields['Business Type'],
          cipcNumber: data.businessInfo?.cipcNumber || existingFields['CIPC Registration Number'],
          industry: data.businessInfo?.industry || existingFields['Industry'],
          subSector: data.businessInfo?.subSector || existingFields['Sub-Sector'],
          description: data.businessInfo?.description || existingFields['Business Description']
        },
        addressInfo: {
          streetAddress: data.addressInfo?.streetAddress || existingFields['Street Address'],
          township: data.addressInfo?.township || existingFields['Township'],
          city: data.addressInfo?.city || existingFields['City'],
          district: data.addressInfo?.district || existingFields['District'],
          zipCode: data.addressInfo?.zipCode || existingFields['Zip Code'],
          province: data.addressInfo?.province || existingFields['Province']
        },
        employmentRevenue: {
          totalEmployees: data.employmentRevenue?.totalEmployees || existingFields['Total Employees'],
          fullTimeCount: data.employmentRevenue?.fullTimeCount || existingFields['Full-Time Count'],
          partTimeCount: data.employmentRevenue?.partTimeCount || existingFields['Part-Time Count'],
          yearsInOperation: data.employmentRevenue?.yearsInOperation || existingFields['Years in Operation'],
          monthlyRevenueRange: data.employmentRevenue?.monthlyRevenueRange || existingFields['Monthly Revenue Range']
        },
        fundingRequest: {
          fundingAmount: data.fundingRequest?.fundingAmount || existingFields['Funding Amount ZAR'],
          fundingPurpose: data.fundingRequest?.fundingPurpose || (existingFields['Funding Purpose']?.split(', ') || []),
          otherPurposeDetails: data.fundingRequest?.otherPurposeDetails || existingFields['Other Purpose Details'],
          preferredFundingType: data.fundingRequest?.preferredFundingType || existingFields['Preferred Funding Type'],
          loanRepaymentAbility: data.fundingRequest?.loanRepaymentAbility || existingFields['Loan Repayment Ability'],
          justification: data.fundingRequest?.justification || existingFields['Funding Justification']
        },
        readinessAssessment: {
          businessPlanStatus: data.readinessAssessment?.businessPlanStatus || existingFields['Business Plan Status'],
          financialRecords: data.readinessAssessment?.financialRecords || existingFields['Financial Records'],
          bankStatements: data.readinessAssessment?.bankStatements || existingFields['Bank Statements'],
          businessTraining: data.readinessAssessment?.businessTraining || existingFields['Business Training'],
          cooperativeInterest: data.readinessAssessment?.cooperativeInterest || existingFields['Cooperative Interest'],
          selfAssessmentReadiness: data.readinessAssessment?.selfAssessmentReadiness || existingFields['Self-Assessment Readiness'],
          supportNeeds: data.readinessAssessment?.supportNeeds || (existingFields['Support Needs']?.split(', ') || [])
        },
        consentGiven: data.consentGiven !== undefined ? data.consentGiven : existingFields['Consent Given'],
        consentTimestamp: data.consentTimestamp || existingFields['Consent Timestamp'],
        completed: data.completed !== undefined ? data.completed : existingFields['Completed'],
        status: data.status || existingFields['Application Status'] || 'Draft'
      };
      
      const updateData = this.formatApplicationData(mergedData);
      updateData['Last Updated'] = new Date().toISOString();
      
      if (data.completed) {
        updateData['Completed'] = true;
        updateData['Completed At'] = new Date().toISOString();
        updateData['Application Status'] = 'Submitted';
      }
      
      await record.update(updateData);
      logger.info('Application updated successfully', { sessionId });
      
      return true;
    } catch (error) {
      logger.error('Airtable update error:', error);
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
      logger.error('Airtable get error:', error);
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
      logger.error('Error finding by ID:', error);
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
        hasRecords: records.length > 0
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