const { v4: uuidv4 } = require('uuid');
const airtableService = require('./airtable');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'sessions.log' })
  ]
});

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.timeout = parseInt(process.env.SESSION_TIMEOUT) || 86400000;
    this.maxInactivity = parseInt(process.env.MAX_INACTIVITY) || 3600000;
  }

  async getOrCreateSession(phoneNumber) {
    logger.debug('Getting or creating session', { phoneNumber });
    
    // Check for active session in memory
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.phoneNumber === phoneNumber) {
        const inactiveTime = Date.now() - session.lastActivity;
        if (inactiveTime < this.maxInactivity) {
          logger.info('Reusing active session', { sessionId, phoneNumber });
          session.lastActivity = Date.now();
          return sessionId;
        } else {
          this.sessions.delete(sessionId);
        }
      }
    }
    
    // Check Airtable for incomplete application
    const existingApp = await airtableService.findIncompleteApplication(phoneNumber);
    if (existingApp) {
      const lastUpdated = new Date(existingApp.lastUpdated).getTime();
      if (Date.now() - lastUpdated < this.timeout) {
        const sessionId = existingApp.sessionId;
        const appData = await airtableService.getApplication(sessionId);
        if (appData) {
          this.sessions.set(sessionId, {
            phoneNumber,
            lastActivity: Date.now(),
            step: this.determineNextStep(appData),
            data: {
              personalInfo: appData.personalInfo,
              businessInfo: appData.businessInfo,
              addressInfo: appData.addressInfo,
              employmentRevenue: appData.employmentRevenue,
              fundingRequest: appData.fundingRequest,
              readinessAssessment: appData.readinessAssessment,
              consentGiven: appData.consentGiven,
              consentTimestamp: appData.consentTimestamp
            }
          });
          
          logger.info('Resumed existing application', { sessionId, phoneNumber });
          return sessionId;
        }
      }
    }
    
    // Create new session
    const sessionId = uuidv4();
    this.sessions.set(sessionId, {
      phoneNumber,
      lastActivity: Date.now(),
      step: 'consent',
      data: {
        personalInfo: {},
        businessInfo: {},
        addressInfo: {},
        employmentRevenue: {},
        fundingRequest: {},
        readinessAssessment: {},
        consentGiven: false,
        consentTimestamp: null
      }
    });
    
    logger.info('Created new session', { sessionId, phoneNumber });
    return sessionId;
  }

  determineNextStep(appData) {
    if (!appData.personalInfo || !appData.personalInfo.idNumber) return 'personal_id';
    if (!appData.personalInfo.fullName) return 'personal_name';
    if (!appData.personalInfo.dob) return 'personal_dob';
    if (!appData.personalInfo.phone) return 'personal_phone';
    if (!appData.personalInfo.email) return 'personal_email';
    if (!appData.businessInfo || !appData.businessInfo.businessName) return 'business_name';
    if (!appData.businessInfo.businessType) return 'business_type';
    if (!appData.businessInfo.industry) return 'business_industry';
    if (!appData.addressInfo || !appData.addressInfo.streetAddress) return 'address_street';
    if (!appData.addressInfo.province) return 'address_province';
    if (!appData.addressInfo.zipCode) return 'address_zip';
    if (!appData.employmentRevenue || appData.employmentRevenue.monthlyRevenueRange === undefined) return 'employment_total';
    if (!appData.fundingRequest || !appData.fundingRequest.fundingAmount) return 'funding_amount';
    if (!appData.readinessAssessment || !appData.readinessAssessment.businessPlanStatus) return 'readiness_business_plan';
    return 'review_summary';
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      const inactiveTime = Date.now() - session.lastActivity;
      if (inactiveTime < this.maxInactivity) {
        session.lastActivity = Date.now();
        return session;
      } else {
        this.sessions.delete(sessionId);
      }
    }
    return null;
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  updateSessionData(sessionId, dataUpdates) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session.data, dataUpdates);
      session.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  getSessionData(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.data : null;
  }

  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.maxInactivity) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        phoneNumber: session.phoneNumber,
        step: session.step,
        lastActivity: new Date(session.lastActivity).toISOString()
      }))
    };
  }
}

module.exports = new SessionManager();