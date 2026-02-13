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
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
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
    
    // Handle welcome menu
    if (step === 'welcome') {
      return this.handleWelcomeMenu(normalizedMessage, session);
    }
    
    // Process based on current step
    try {
      return questionFlows.handleAnswer(step, message, session);
    } catch (error) {
      logger.error('Error in questionFlows.handleAnswer:', error);
      return {
        response: "Sorry, something went wrong processing your answer. Please try again.",
        nextStep: step
      };
    }
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
                 "📝 *Please enter your 13-digit South African ID number:*\n\nExample: 9001010001088",
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

  handleWelcomeMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    try {
      console.log('Handling welcome menu input:', normalizedInput); // Debug log
      
      if (normalizedInput === '1' || normalizedInput === 'continue' || normalizedInput === 'start') {
        // Check consent first
        if (!session.data.consentGiven) {
          return {
            response: questionFlows.getConsentMessage(),
            nextStep: 'consent'
          };
        }
        
        // Determine where to continue
        if (!session.data.personalInfo || !session.data.personalInfo.idNumber) {
          return {
            response: "📝 *Please enter your 13-digit South African ID number:*\n\nExample: 9001010001088",
            nextStep: 'personal_id'
          };
        } else if (!session.data.personalInfo.fullName) {
          return {
            response: "📝 *Please enter your full name:*\n\nExample: John Doe",
            nextStep: 'personal_name'
          };
        } else if (!session.data.personalInfo.dob) {
          return {
            response: "📝 *Please enter your date of birth (DD/MM/YYYY):*\n\nExample: 15/01/1990",
            nextStep: 'personal_dob'
          };
        } else if (!session.data.personalInfo.phone) {
          return {
            response: "📝 *Please enter your phone number:*\n\nExample: 0712345678",
            nextStep: 'personal_phone'
          };
        } else if (!session.data.personalInfo.email) {
          return {
            response: "📝 *Please enter your email address:*\n\nExample: name@email.com",
            nextStep: 'personal_email'
          };
        } else if (!session.data.businessInfo || !session.data.businessInfo.businessName) {
          return {
            response: "🏢 *Please enter your Business Name:*",
            nextStep: 'business_name'
          };
        } else {
          // Show progress and ask where to continue
          const progress = questionFlows.calculateProgress(session.data);
          return {
            response: `Your application is ${progress}% complete. Type CONTINUE to resume where you left off.`,
            nextStep: session.step
          };
        }
      } else if (normalizedInput === '2' || normalizedInput === 'progress') {
        const progressPercent = questionFlows.calculateProgress(session.data);
        const sections = questionFlows.getCompletedSections(session.data);
        
        let response = `📊 *APPLICATION PROGRESS*\n\n`;
        response += `Overall Completion: ${progressPercent}%\n\n`;
        response += `*Completed Sections:*\n`;
        response += (sections.completed.length > 0 ? sections.completed.join('\n') : 'None yet') + '\n\n';
        
        if (sections.incomplete.length > 0) {
          response += `*Remaining Sections:*\n`;
          response += sections.incomplete.join('\n') + '\n\n';
        }
        
        response += `Type 1 to continue your application.`;
        
        return {
          response: response,
          nextStep: 'welcome'
        };
      } else if (normalizedInput === '3' || normalizedInput === 'edit') {
        return {
          response: questionFlows.getEditMenu(session.data),
          nextStep: 'edit_menu'
        };
      } else if (normalizedInput === '4' || normalizedInput === 'save') {
        return {
          response: "Would you like to save your progress and continue later? Type YES to save or NO to continue.",
          nextStep: 'save_confirm',
          shouldSave: true
        };
      } else if (normalizedInput === '5' || normalizedInput === 'help') {
        return {
          response: questionFlows.getHelpMessage(),
          nextStep: 'welcome'
        };
      } else {
        return {
          response: "Please choose a valid option (1-5):\n\n1️⃣ Continue Application\n2️⃣ View Progress\n3️⃣ Edit Information\n4️⃣ Save & Exit\n5️⃣ Help",
          nextStep: 'welcome'
        };
      }
    } catch (error) {
      console.error('Error in handleWelcomeMenu:', error);
      return {
        response: "Sorry, something went wrong. Please try again or type START to restart.",
        nextStep: 'welcome'
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
          nextStep: 'save_confirm',
          shouldSave: true
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
          consentGiven: false,
          consentTimestamp: null
        };
        sessionManager.updateSessionData(session.id, session.data);
        return {
          response: "Application restarted. Let's begin from the beginning.",
          nextStep: 'consent'
        };
      case 'start':
        if (session.data.consentGiven) {
          return {
            response: questionFlows.getWelcomeMenu(session),
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
      case 'back':
        return this.handleBackNavigation(session);
      default:
        return {
          response: "Command not recognized. Type HELP for available commands.",
          nextStep: session.step
        };
    }
  }

  handleBackNavigation(session) {
    const stepHierarchy = {
      'personal_name': 'personal_id',
      'personal_dob': 'personal_name',
      'personal_phone': 'personal_dob',
      'personal_email': 'personal_phone',
      'business_name': 'personal_email',
      'business_trading': 'business_name',
      'business_trading_name': 'business_trading',
      'business_cipc': 'business_trading_name',
      'business_sub_sector': 'business_cipc',
      'business_description': 'business_sub_sector',
      'business_type': 'business_description',
      'business_industry': 'business_type',
      'address_street': 'business_industry',
      'address_township': 'address_street',
      'address_city': 'address_township',
      'address_district': 'address_city',
      'address_province': 'address_district',
      'address_zip': 'address_province',
      'employment_total': 'address_zip',
      'employment_fulltime': 'employment_total',
      'employment_parttime': 'employment_fulltime',
      'employment_years': 'employment_parttime',
      'employment_revenue': 'employment_years',
      'funding_amount': 'employment_revenue',
      'funding_purpose': 'funding_amount',
      'funding_other_purpose': 'funding_purpose',
      'funding_type': 'funding_other_purpose',
      'funding_repayment': 'funding_type',
      'funding_justification': 'funding_repayment',
      'readiness_business_plan': 'funding_justification',
      'readiness_financial_records': 'readiness_business_plan',
      'readiness_bank_statements': 'readiness_financial_records',
      'readiness_training': 'readiness_bank_statements',
      'readiness_cooperative': 'readiness_training',
      'readiness_self_assessment': 'readiness_cooperative',
      'readiness_support_needs': 'readiness_self_assessment',
      'review_summary': 'readiness_support_needs',
      'confirm_submission': 'review_summary'
    };
    
    const currentStep = session.step;
    const previousStep = stepHierarchy[currentStep];
    
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
        console.log(`[Would send to ${to}]: ${message.substring(0, 100)}...`);
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