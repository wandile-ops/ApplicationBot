const axios = require('axios');
const sessionManager = require('./session-manager');
const airtableService = require('./airtable');
const questionFlows = require('./question-flows');
const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
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
  }

  async handleMessage(from, message) {
    try {
      logger.info('Handling message', { from, message });
      
      // Handle empty or greeting messages
      if (!message || message.trim().length === 0) {
        await this.sendWelcomeMessage(from);
        return;
      }
      
      const normalizedMessage = message.toLowerCase().trim();
      
      // Handle initial greetings
      if (this.isGreeting(normalizedMessage)) {
        await this.sendWelcomeMessage(from);
        return;
      }
      
      // Get or create session
      const sessionId = await sessionManager.getOrCreateSession(from);
      const session = sessionManager.getSession(sessionId);
      
      if (!session) {
        await this.sendMessage(from, "Your session has expired. Please type *START* to begin a new application.");
        return;
      }

      // Process the message
      const response = await this.processMessage(session, message);
      
      // Update session
      if (response.nextStep) {
        sessionManager.updateSession(sessionId, { step: response.nextStep });
      }
      
      // Save to Airtable if needed
      if (response.shouldSave || response.nextStep === null) {
        await this.saveToAirtable(sessionId, from, session.data, response);
      }
      
      // Send response
      await this.sendMessage(from, response.response);
      
    } catch (error) {
      logger.error('Error handling message:', error);
      await this.sendMessage(from, 
        "Sorry, something went wrong. Please try again or type HELP for assistance."
      );
    }
  }

  isGreeting(message) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.includes(message);
  }

  async sendWelcomeMessage(to) {
    const message = 
      "👋 *Hello! Welcome to the Funding Application Bot*\n\n" +
      "I'm here to help you apply for business funding.\n\n" +
      "To get started, type: *START*\n" +
      "For help, type: *HELP*\n\n" +
      "You can save your progress at any time and return later.";
    
    await this.sendMessage(to, message);
  }

  async processMessage(session, message) {
    const step = session.step;
    const normalizedMessage = message.toLowerCase().trim();
    
    // Handle global commands
    if (this.isGlobalCommand(normalizedMessage)) {
      return this.handleGlobalCommand(normalizedMessage, session);
    }
    
    // Handle consent step
    if (step === 'consent') {
      return this.handleConsentStep(normalizedMessage, session);
    }
    
    // Process based on current step
    return questionFlows.handleAnswer(step, message, session);
  }

  isGlobalCommand(message) {
    const globalCommands = [
      'menu', 'help', 'save', 'exit', 'restart', 
      'start', 'continue', 'progress', 'edit',
      'back', 'cancel'
    ];
    
    return globalCommands.includes(message);
  }

  handleConsentStep(message, session) {
    if (message === 'agree') {
      session.data.consentGiven = true;
      session.data.consentTimestamp = new Date().toISOString();
      
      return {
        response: "✅ Thank you for your consent. Let's begin your funding application!\n\n" +
                 "You can type *SAVE* at any time to save your progress and continue later.\n" +
                 "Type *MENU* to see available options at any time.",
        nextStep: 'personal_id'
      };
    } else if (message === 'exit') {
      return {
        response: "Application cancelled. Your data has not been saved. If you change your mind, simply send us a message to start again.",
        nextStep: null
      };
    } else {
      return {
        response: questionFlows.getConsentMessage(),
        nextStep: 'consent'
      };
    }
  }

  handleGlobalCommand(command, session) {
    switch(command) {
      case 'menu':
        return {
          response: questionFlows.getWelcomeMenu(session),
          nextStep: 'welcome'
        };
      case 'help':
        return {
          response: questionFlows.getHelpMessage(),
          nextStep: session.step
        };
      case 'save':
        return {
          response: "Would you like to save your progress and continue later? Type YES to save or NO to continue.",
          nextStep: 'save_confirm'
        };
      case 'exit':
      case 'cancel':
        return {
          response: "Application cancelled. Your data has not been saved. Type START to begin again.",
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
        sessionManager.updateSessionData(session.id, session.data);
        return {
          response: "Application restarted. Let's begin from the beginning.",
          nextStep: 'consent'
        };
      case 'start':
        if (session.data.consentGiven) {
          return {
            response: "Let's continue your application.",
            nextStep: 'welcome'
          };
        } else {
          return {
            response: questionFlows.getConsentMessage(),
            nextStep: 'consent'
          };
        }
      case 'continue':
        const progress = questionFlows.calculateProgress(session.data);
        if (progress === 0) {
          if (!session.data.consentGiven) {
            return {
              response: questionFlows.getConsentMessage(),
              nextStep: 'consent'
            };
          } else {
            return {
              response: "Let's start with your personal information.",
              nextStep: 'personal_id'
            };
          }
        } else {
          return {
            response: `Resuming your application (${progress}% complete).`,
            nextStep: session.step
          };
        }
      case 'progress':
        const progressPercent = questionFlows.calculateProgress(session.data);
        const sections = questionFlows.getCompletedSections(session.data);
        
        let response = `📊 *APPLICATION PROGRESS*\n\n`;
        response += `Overall Completion: ${progressPercent}%\n\n`;
        response += `*Completed Sections:*\n`;
        response += sections.completed.join('\n') + '\n\n';
        
        if (sections.incomplete.length > 0) {
          response += `*Remaining Sections:*\n`;
          response += sections.incomplete.join('\n') + '\n\n';
        }
        
        response += `Type CONTINUE to resume where you left off.`;
        
        return {
          response: response,
          nextStep: session.step
        };
      default:
        return {
          response: "Command not recognized. Type HELP for available commands.",
          nextStep: session.step
        };
    }
  }

  async saveToAirtable(sessionId, from, sessionData, response) {
    try {
      const airtableData = {
        phoneNumber: from,
        sessionId: sessionId,
        ...sessionData
      };
      
      const existingApp = await airtableService.getApplication(sessionId);
      
      if (existingApp) {
        await airtableService.updateApplication(sessionId, {
          ...sessionData,
          status: response.isComplete ? 'Submitted' : 'In Progress'
        });
      } else {
        await airtableService.createApplication({
          ...airtableData,
          status: response.isComplete ? 'Submitted' : 'In Progress'
        });
      }
      
      logger.info('Application saved to Airtable', { 
        sessionId, 
        status: response.isComplete ? 'Submitted' : 'In Progress'
      });
    } catch (error) {
      logger.error('Error saving to Airtable:', error);
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
        logger.debug('Message sent successfully', { to, length: msg.length });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
    }
  }

  splitMessage(message, maxLength = 4000) {
    if (!message || message.length <= maxLength) {
      return [message || ''];
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