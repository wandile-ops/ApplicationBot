const axios = require('axios');
const sessionManager = require('./session-manager');
const airtableService = require('./airtable');
const questionFlows = require('./question-flows');
const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'whatsapp.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class WhatsAppHandler {
  constructor() {
    this.whatsappToken = process.env.WHATSAPP_TOKEN;
    this.phoneId = process.env.WHATSAPP_PHONE_ID;
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`;
    
    if (!this.whatsappToken || !this.phoneId) {
      logger.warn('WhatsApp credentials not configured');
    }
  }

  async handleMessage(from, message) {
    try {
      logger.info('Handling message', { from, message: message?.substring(0, 100) || 'empty' });
      
      const sessionId = await sessionManager.getOrCreateSession(from);
      const session = sessionManager.getSession(sessionId);
      
      if (!session) {
        await this.sendMessage(from, "Session expired. Please type START to begin.");
        return;
      }

      // Handle global commands
      const response = await this.processMessage(session, message);
      
      // Update session
      if (response.nextStep) {
        sessionManager.updateSession(sessionId, { step: response.nextStep });
      }
      
      // Update session data if provided
      if (response.updateData) {
        sessionManager.updateSessionData(sessionId, response.updateData);
      }
      
      // Save to Airtable if needed
      if (response.shouldSave) {
        try {
          const airtableData = {
            phoneNumber: from,
            sessionId: sessionId,
            ...session.data,
            status: response.isComplete ? 'Submitted' : 'In Progress'
          };
          
          const existingApp = await airtableService.getApplication(sessionId);
          
          if (existingApp) {
            await airtableService.updateApplication(sessionId, {
              ...session.data,
              status: response.isComplete ? 'Submitted' : 'In Progress',
              completed: response.isComplete || false
            });
          } else {
            await airtableService.createApplication(airtableData);
          }
          
          logger.info('Saved to Airtable', { 
            sessionId, 
            from,
            status: response.isComplete ? 'Submitted' : 'In Progress',
            isComplete: response.isComplete
          });
        } catch (error) {
          logger.error('Airtable save error:', {
            error: error.message,
            sessionId,
            from
          });
        }
      }
      
      // Send response
      await this.sendMessage(from, response.response);
      
    } catch (error) {
      logger.error('Error handling message:', error);
      await this.sendMessage(from, "Sorry, an error occurred. Please try again or type HELP.");
    }
  }

  async processMessage(session, message) {
    const step = session.step;
    const normalizedMessage = (message || '').toLowerCase().trim();
    
    // Handle global commands
    if (this.isGlobalCommand(normalizedMessage)) {
      return this.handleGlobalCommand(normalizedMessage, session);
    }
    
    // Process based on current step
    return questionFlows.handleAnswer(step, message, session);
  }

  isGlobalCommand(message) {
    const globalCommands = [
      'menu', 'help', 'save', 'exit', 'restart', 
      'start', 'continue', 'progress', 'edit',
      'back', 'cancel', 'hello', 'hi'
    ];
    
    return globalCommands.includes(message);
  }

  handleGlobalCommand(command, session) {
    switch(command) {
      case 'menu':
        return {
          response: questionFlows.getQuestion('welcome', session),
          nextStep: 'welcome'
        };
      case 'help':
        return {
          response: questionFlows.getHelpMessage(),
          nextStep: session.step
        };
      case 'save':
        return {
          response: "Would you like to save your progress?",
          nextStep: 'save_confirm',
          shouldSave: true
        };
      case 'exit':
      case 'cancel':
        return {
          response: "Application cancelled. Type START to begin again.",
          nextStep: null
        };
      case 'restart':
        session.data = {
          personalInfo: {},
          businessInfo: {},
          addressInfo: {},
          employmentRevenue: {},
          fundingRequest: {},
          readinessAssessment: {},
          consentGiven: false
        };
        return {
          response: "Application restarted. Let's begin.",
          nextStep: 'consent'
        };
      case 'start':
      case 'hello':
      case 'hi':
        if (session.data.personalInfo?.idNumber) {
          return {
            response: questionFlows.getQuestion('welcome', session),
            nextStep: 'welcome'
          };
        } else {
          return {
            response: "Starting new application...",
            nextStep: 'consent'
          };
        }
      case 'continue':
        const progress = questionFlows.calculateProgress(session.data);
        if (progress === 0) {
          return {
            response: "No application in progress. Type START to begin.",
            nextStep: 'consent'
          };
        } else {
          return {
            response: `Resuming application (${progress}% complete).`,
            nextStep: session.step
          };
        }
      case 'progress':
        const progressPercent = questionFlows.calculateProgress(session.data);
        return {
          response: `📊 Progress: ${progressPercent}% complete\n\nType CONTINUE to resume.`,
          nextStep: session.step
        };
      case 'edit':
        return {
          response: "Which section would you like to edit?",
          nextStep: 'edit_menu'
        };
      case 'back':
        return this.handleBackNavigation(session);
      default:
        return {
          response: "Command not recognized. Type HELP for commands.",
          nextStep: session.step
        };
    }
  }

  handleBackNavigation(session) {
    const stepHierarchy = {
      'personal_name': 'personal_id',
      'personal_dob': 'personal_name',
      'personal_dob_confirm': 'personal_name',
      'personal_phone': 'personal_dob',
      'personal_email': 'personal_phone',
      'business_trading': 'business_name',
      'business_trading_name': 'business_trading',
      'business_type': 'business_trading_name',
      'business_cipc': 'business_type',
      'business_industry': 'business_cipc',
      'business_sub_sector': 'business_industry',
      'business_description': 'business_sub_sector',
      'address_township': 'address_street',
      'address_city': 'address_township',
      'address_district': 'address_city',
      'address_province': 'address_district',
      'address_zip': 'address_province',
      'employment_fulltime': 'employment_total',
      'employment_parttime': 'employment_fulltime',
      'employment_years': 'employment_parttime',
      'employment_revenue': 'employment_years',
      'funding_purpose': 'funding_amount',
      'funding_other_purpose': 'funding_purpose',
      'funding_type': 'funding_other_purpose',
      'funding_repayment': 'funding_type',
      'funding_justification': 'funding_repayment',
      'readiness_financial_records': 'readiness_business_plan',
      'readiness_bank_statements': 'readiness_financial_records',
      'readiness_training': 'readiness_bank_statements',
      'readiness_cooperative': 'readiness_training',
      'readiness_self_assessment': 'readiness_cooperative',
      'readiness_support_needs': 'readiness_self_assessment',
      'review_summary': 'readiness_support_needs',
      'confirm_submission': 'review_summary'
    };
    
    const previousStep = stepHierarchy[session.step];
    
    if (previousStep) {
      return {
        response: `Going back...`,
        nextStep: previousStep
      };
    } else {
      return {
        response: "Cannot go back from here. Type MENU for options.",
        nextStep: session.step
      };
    }
  }

  async sendMessage(to, message) {
    try {
      if (!this.whatsappToken || !this.phoneId) {
        logger.warn('WhatsApp not configured, skipping send');
        return;
      }
      
      const messages = this.splitMessage(message);
      
      for (const msg of messages) {
        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: {
            body: msg
          }
        };
  
        const headers = {
          'Authorization': `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json'
        };
  
        await axios.post(this.baseUrl, payload, { headers });
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      logger.error('Error sending WhatsApp message:', {
        error: error.message,
        status: error.response?.status
      });
    }
  }

  splitMessage(message, maxLength = 4000) {
    if (message.length <= maxLength) {
      return [message];
    }
    
    const messages = [];
    const lines = message.split('\n');
    let currentMessage = '';
    
    for (const line of lines) {
      if ((currentMessage + '\n' + line).length > maxLength) {
        if (currentMessage) {
          messages.push(currentMessage);
          currentMessage = line;
        } else {
          const words = line.split(' ');
          currentMessage = '';
          
          for (const word of words) {
            if ((currentMessage + ' ' + word).length > maxLength) {
              messages.push(currentMessage);
              currentMessage = word;
            } else {
              currentMessage += (currentMessage ? ' ' : '') + word;
            }
          }
        }
      } else {
        currentMessage += (currentMessage ? '\n' : '') + line;
      }
    }
    
    if (currentMessage) {
      messages.push(currentMessage);
    }
    
    return messages;
  }
}

module.exports = new WhatsAppHandler();