const ValidationService = require('./validation');
const moment = require('moment');

class QuestionFlows {
  constructor() {
    this.flows = {
      // Consent flow
      consent: {
        question: () => this.getConsentMessage(),
        handler: (input, session) => this.handleConsent(input, session)
      },
      
      // Welcome menu
      welcome: {
        question: (session) => this.getWelcomeMenu(session),
        handler: (input, session) => this.handleWelcomeMenu(input, session)
      },
      
      // Personal Information Flow
      personal_id: {
        question: () => "📝 *Please enter your 13-digit South African ID number:*\n\nExample: 9001010001088",
        handler: (input, session) => this.handlePersonalID(input, session)
      },
      
      personal_name: {
        question: (session) => "📝 *Please enter your full name:*\n\nExample: John Doe",
        handler: (input, session) => this.handlePersonalName(input, session)
      },
      
      personal_dob: {
        question: (session) => "📝 *Please enter your date of birth (DD/MM/YYYY):*\n\nExample: 15/01/1990",
        handler: (input, session) => this.handlePersonalDOB(input, session)
      },
      
      personal_dob_confirm: {
        question: (session) => {
          const dob = moment(session.data.personalInfo.dob).format('DD/MM/YYYY');
          return `Your date of birth from ID: ${dob}\n\nIs this correct? Type YES to confirm or enter correct date (DD/MM/YYYY):`;
        },
        handler: (input, session) => this.handlePersonalDOBConfirm(input, session)
      },
      
      personal_phone: {
        question: (session) => "📝 *Please enter your phone number:*\n\nExample: 0712345678 or 27712345678",
        handler: (input, session) => this.handlePersonalPhone(input, session)
      },
      
      personal_email: {
        question: (session) => "📝 *Please enter your email address:*\n\nExample: name@email.com",
        handler: (input, session) => this.handlePersonalEmail(input, session)
      },
      
      // Business Information Flow
      business_name: {
        question: () => "🏢 *Please enter your Business Name:*",
        handler: (input, session) => this.handleBusinessName(input, session)
      },
      
      business_trading: {
        question: (session) => "🏢 *Is your Trading Name different from your Business Name?*\n\nType YES or NO",
        handler: (input, session) => this.handleBusinessTrading(input, session)
      },
      
      business_trading_name: {
        question: () => "🏢 *Please enter your Trading Name:*",
        handler: (input, session) => this.handleBusinessTradingName(input, session)
      },
      
      business_cipc: {
        question: () => "🏢 *Please enter your CIPC Registration Number (if registered):*\n\nFormat: CK2012/123456/07\n\nIf not registered, type SKIP",
        handler: (input, session) => this.handleBusinessCIPC(input, session)
      },
      
      business_sub_sector: {
        question: () => "🏢 *Please describe your business sub-sector:*\n\nExample: Organic vegetable farming, Mobile app development, Bakery, etc.",
        handler: (input, session) => this.handleBusinessSubSector(input, session)
      },
      
      business_description: {
        question: (session) => "🏢 *Please provide a brief description of your business:*\n\nWhat do you do? What products/services do you offer?",
        handler: (input, session) => this.handleBusinessDescription(input, session)
      },
      
      business_type: {
        question: () => this.getBusinessTypeOptions(),
        handler: (input, session) => this.handleBusinessType(input, session)
      },
      
      business_industry: {
        question: () => this.getIndustryOptions(),
        handler: (input, session) => this.handleBusinessIndustry(input, session)
      },
      
      // Address Information Flow
      address_street: {
        question: () => "📍 *Please enter your Street Address:*\n\nExample: 123 Main Street",
        handler: (input, session) => this.handleAddressStreet(input, session)
      },
      
      address_township: {
        question: (session) => "📍 *Please enter your Township/Area:*",
        handler: (input, session) => this.handleAddressTownship(input, session)
      },
      
      address_city: {
        question: (session) => "📍 *Please enter your City:*",
        handler: (input, session) => this.handleAddressCity(input, session)
      },
      
      address_district: {
        question: (session) => "📍 *Please enter your District/Municipality:*",
        handler: (input, session) => this.handleAddressDistrict(input, session)
      },
      
      address_province: {
        question: () => this.getProvinceOptions(),
        handler: (input, session) => this.handleAddressProvince(input, session)
      },
      
      address_zip: {
        question: (session) => "📍 *Please enter your ZIP/Postal Code (4 digits):*\n\nExample: 2000",
        handler: (input, session) => this.handleAddressZip(input, session)
      },
      
      // Employment & Revenue Flow
      employment_total: {
        question: () => "👥 *How many total employees do you have?*\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentTotal(input, session)
      },
      
      employment_fulltime: {
        question: (session) => "👥 *How many of these are Full-Time employees?*\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentFullTime(input, session)
      },
      
      employment_parttime: {
        question: (session) => "👥 *How many are Part-Time employees?*\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentPartTime(input, session)
      },
      
      employment_years: {
        question: (session) => "📅 *How many years has your business been in operation?*\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentYears(input, session)
      },
      
      employment_revenue: {
        question: () => this.getRevenueOptions(),
        handler: (input, session) => this.handleEmploymentRevenue(input, session)
      },
      
      // Funding Request Flow
      funding_amount: {
        question: () => "💰 *How much funding are you requesting (in ZAR)?*\n\nEnter amount:",
        handler: (input, session) => this.handleFundingAmount(input, session)
      },
      
      funding_purpose: {
        question: () => this.getFundingPurposeOptions(),
        handler: (input, session) => this.handleFundingPurpose(input, session)
      },
      
      funding_other_purpose: {
        question: () => "📝 *Please specify the 'Other' funding purpose:*",
        handler: (input, session) => this.handleFundingOtherPurpose(input, session)
      },
      
      funding_type: {
        question: () => this.getFundingTypeOptions(),
        handler: (input, session) => this.handleFundingType(input, session)
      },
      
      funding_repayment: {
        question: () => "💳 *Can you demonstrate loan repayment ability?*\n\nOptions: YES, NO, UNSURE",
        handler: (input, session) => this.handleFundingRepayment(input, session)
      },
      
      funding_justification: {
        question: (session) => "📄 *Please provide a detailed justification for your funding request:*\n\nExplain how you will use the funds and the expected impact on your business.",
        handler: (input, session) => this.handleFundingJustification(input, session)
      },
      
      // Readiness Assessment Flow
      readiness_business_plan: {
        question: () => this.getBusinessPlanOptions(),
        handler: (input, session) => this.handleReadinessBusinessPlan(input, session)
      },
      
      readiness_financial_records: {
        question: () => this.getFinancialRecordsOptions(),
        handler: (input, session) => this.handleReadinessFinancialRecords(input, session)
      },
      
      readiness_bank_statements: {
        question: () => this.getBankStatementsOptions(),
        handler: (input, session) => this.handleReadinessBankStatements(input, session)
      },
      
      readiness_training: {
        question: () => this.getTrainingOptions(),
        handler: (input, session) => this.handleReadinessTraining(input, session)
      },
      
      readiness_cooperative: {
        question: () => this.getCooperativeOptions(),
        handler: (input, session) => this.handleReadinessCooperative(input, session)
      },
      
      readiness_self_assessment: {
        question: () => this.getSelfAssessmentOptions(),
        handler: (input, session) => this.handleReadinessSelfAssessment(input, session)
      },
      
      readiness_support_needs: {
        question: () => this.getSupportNeedsOptions(),
        handler: (input, session) => this.handleReadinessSupportNeeds(input, session)
      },
      
      // Review and Submit
      review_summary: {
        question: (session) => this.getApplicationSummary(session.data),
        handler: (input, session) => this.handleReviewSummary(input, session)
      },
      
      confirm_submission: {
        question: () => "📬 *Are you ready to submit your application?*\n\nType CONFIRM to submit or BACK to review",
        handler: (input, session) => this.handleConfirmSubmission(input, session)
      },
      
      save_confirm: {
        question: () => "💾 *Would you like to save your progress and continue later?*\n\nType YES to save or NO to continue",
        handler: (input, session) => this.handleSaveConfirm(input, session)
      },
      
      edit_menu: {
        question: (session) => this.getEditMenu(session.data),
        handler: (input, session) => this.handleEditMenu(input, session)
      },
      
      continue_menu: {
        question: (session) => {
          const progress = this.calculateProgress(session.data);
          return `Your application is ${progress}% complete. Where would you like to continue?\n\n` +
                 "Type:\n" +
                 "*PERSONAL* - Personal Information\n" +
                 "*BUSINESS* - Business Information\n" +
                 "*ADDRESS* - Address Information\n" +
                 "*EMPLOYMENT* - Employment & Revenue\n" +
                 "*FUNDING* - Funding Request\n" +
                 "*READINESS* - Readiness Assessment\n" +
                 "*REVIEW* - Review & Submit";
        },
        handler: (input, session) => this.handleContinueMenu(input, session)
      }
    };
  }

  getQuestion(step, session) {
    try {
      const flow = this.flows[step];
      if (!flow) {
        console.error('Invalid step:', step);
        return "Invalid step. Please type RESTART to start over.";
      }
      return flow.question(session);
    } catch (error) {
      console.error('Error in getQuestion:', error);
      return "Something went wrong. Please type MENU to continue.";
    }
  }

  handleAnswer(step, input, session) {
    try {
      const flow = this.flows[step];
      if (!flow) {
        console.error('Invalid step in handleAnswer:', step);
        return { 
          response: "Invalid step. Please type RESTART to start over.", 
          nextStep: 'welcome' 
        };
      }
      return flow.handler(input, session);
    } catch (error) {
      console.error('Error in handleAnswer:', error);
      return {
        response: "Sorry, something went wrong processing your answer. Please try again.",
        nextStep: step
      };
    }
  }

  // ============ CONSENT SECTION ============
  
  getConsentMessage() {
    return `🔐 *DATA PRIVACY & CONSENT AGREEMENT* 🔐

Before we begin, please read and agree to how we handle your data:

✅ *HOW WE PROTECT YOUR DATA:*
• End-to-end encryption for all communications
• Secure servers with firewall protection
• Regular security audits and updates
• Access limited to authorized personnel only

✅ *HOW WE USE YOUR DATA:*
• Process your funding application
• Contact you regarding your application status
• Improve our services (using anonymized data)
• Comply with legal and regulatory requirements

✅ *YOUR RIGHTS:*
• Access your personal data anytime
• Request corrections to inaccurate data
• Withdraw consent at any time
• Request deletion of your data

📞 *Privacy questions:* privacy@fundingsa.org.za

*Type AGREE to consent and continue, or EXIT to cancel.*`;
  }

  handleConsent(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'agree') {
      session.data.consentGiven = true;
      session.data.consentTimestamp = new Date().toISOString();
      
      return {
        response: "✅ Thank you for your consent. Let's begin your funding application!\n\n" +
                 "📝 *Please enter your 13-digit South African ID number:*\n\nExample: 9001010001088",
        nextStep: 'personal_id'
      };
    } else if (normalizedInput === 'exit') {
      return {
        response: "Application cancelled. Your data has not been saved. If you change your mind, simply send us a message to start again.",
        nextStep: null
      };
    } else {
      return {
        response: this.getConsentMessage(),
        nextStep: 'consent'
      };
    }
  }

  // ============ WELCOME MENU ============
  
  getWelcomeMenu(session) {
    try {
      // Ensure session and session.data exist
      if (!session) session = { data: {} };
      if (!session.data) session.data = {};
      
      let menu = "🌟 *FUNDING APPLICATION BOT* 🌟\n\n";
      
      if (session.data.personalInfo && session.data.personalInfo.fullName) {
        menu += `Welcome back, ${session.data.personalInfo.fullName}!\n\n`;
      } else {
        menu += "Welcome to the Funding Application System!\n\n";
      }
      
      const progress = this.calculateProgress(session.data || {});
      menu += `📊 Your progress: ${progress}%\n\n`;
      
      menu += "What would you like to do?\n\n";
      menu += "1️⃣ Continue Application\n";
      menu += "2️⃣ View Progress\n";
      menu += "3️⃣ Edit Information\n";
      menu += "4️⃣ Save & Exit\n";
      menu += "5️⃣ Help\n\n";
      menu += "Type the number of your choice:";
      
      return menu;
    } catch (error) {
      console.error('Error in getWelcomeMenu:', error);
      return "🌟 Welcome to the Funding Application Bot! Type START to begin your application.";
    }
  }

  handleWelcomeMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    try {
      if (normalizedInput === '1' || normalizedInput === 'continue' || normalizedInput === 'start') {
        // Check consent first
        if (!session.data.consentGiven) {
          return {
            response: this.getConsentMessage(),
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
          const progress = this.calculateProgress(session.data);
          return {
            response: `Your application is ${progress}% complete. Type CONTINUE to resume where you left off.`,
            nextStep: session.step
          };
        }
      } else if (normalizedInput === '2' || normalizedInput === 'progress') {
        const progressPercent = this.calculateProgress(session.data);
        const sections = this.getCompletedSections(session.data);
        
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
          response: this.getEditMenu(session.data),
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
          response: this.getHelpMessage(),
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

  getHelpMessage() {
    return `🆘 *HELP & COMMANDS* 🆘

*Available Commands:*
• MENU - Show main menu
• SAVE - Save progress and exit
• CONTINUE - Continue application
• PROGRESS - View application progress
• EDIT - Edit a section
• RESTART - Start over
• HELP - Show this help message
• EXIT - Cancel application

*Need assistance?*
📧 support@fundingsa.org.za
📞 0800 123 4567

Type MENU to return to the main menu.`;
  }

  // ============ PERSONAL INFORMATION ============
  
  handlePersonalID(input, session) {
    try {
      console.log('Handling personal ID:', input);
      
      const validation = ValidationService.validateSAID(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your 13-digit ID number:`,
          nextStep: 'personal_id'
        };
      }
      
      // Ensure personalInfo object exists
      if (!session.data.personalInfo) {
        session.data.personalInfo = {};
      }
      
      session.data.personalInfo.idNumber = validation.data.idNumber;
      session.data.personalInfo.dob = validation.data.dateOfBirth;
      session.data.personalInfo.age = validation.data.age;
      
      console.log('Personal info updated:', session.data.personalInfo);
      
      return {
        response: `✅ ID number verified. Age: ${validation.data.age} years.\n\nNow, please enter your full name:`,
        nextStep: 'personal_name'
      };
    } catch (error) {
      console.error('Error in handlePersonalID:', error);
      return {
        response: "❌ There was an error processing your ID. Please try again.",
        nextStep: 'personal_id'
      };
    }
  }

  handlePersonalName(input, session) {
    try {
      const validation = ValidationService.validateName(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your full name:`,
          nextStep: 'personal_name'
        };
      }
      
      session.data.personalInfo.fullName = input.trim();
      
      // If DOB was extracted from ID, confirm it
      if (session.data.personalInfo.dob) {
        const dobDate = moment(session.data.personalInfo.dob);
        return {
          response: `✅ Name recorded.\n\nYour date of birth from ID: ${dobDate.format('DD/MM/YYYY')}\n\nIs this correct? Type YES to confirm or enter correct date (DD/MM/YYYY):`,
          nextStep: 'personal_dob_confirm'
        };
      }
      
      return {
        response: `✅ Name recorded.\n\nPlease enter your date of birth (DD/MM/YYYY):`,
        nextStep: 'personal_dob'
      };
    } catch (error) {
      console.error('Error in handlePersonalName:', error);
      return {
        response: "❌ There was an error processing your name. Please try again.",
        nextStep: 'personal_name'
      };
    }
  }

  handlePersonalDOBConfirm(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'yes' || normalizedInput === 'y') {
      // Keep the DOB from ID
      return {
        response: `✅ Date of birth confirmed.\n\nPlease enter your phone number:`,
        nextStep: 'personal_phone'
      };
    } else {
      // User wants to enter different DOB
      return {
        response: "Please enter your correct date of birth (DD/MM/YYYY):",
        nextStep: 'personal_dob'
      };
    }
  }

  handlePersonalDOB(input, session) {
    try {
      const validation = ValidationService.validateDOB(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter date in DD/MM/YYYY format:`,
          nextStep: 'personal_dob'
        };
      }
      
      session.data.personalInfo.dob = validation.data.dob;
      session.data.personalInfo.age = validation.data.age;
      
      return {
        response: `✅ Date of birth recorded.\n\nPlease enter your phone number:`,
        nextStep: 'personal_phone'
      };
    } catch (error) {
      console.error('Error in handlePersonalDOB:', error);
      return {
        response: "❌ There was an error processing your date of birth. Please try again.",
        nextStep: 'personal_dob'
      };
    }
  }

  handlePersonalPhone(input, session) {
    try {
      const validation = ValidationService.validatePhone(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your phone number:`,
          nextStep: 'personal_phone'
        };
      }
      
      session.data.personalInfo.phone = validation.data.formatted;
      session.data.personalInfo.whatsappNumber = validation.data.formatted;
      
      return {
        response: `✅ Phone number recorded.\n\nPlease enter your email address:`,
        nextStep: 'personal_email'
      };
    } catch (error) {
      console.error('Error in handlePersonalPhone:', error);
      return {
        response: "❌ There was an error processing your phone number. Please try again.",
        nextStep: 'personal_phone'
      };
    }
  }

  handlePersonalEmail(input, session) {
    try {
      const validation = ValidationService.validateEmail(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your email address:`,
          nextStep: 'personal_email'
        };
      }
      
      session.data.personalInfo.email = input.trim().toLowerCase();
      
      return {
        response: `✅ Personal information completed!\n\nLet's move to business information.\n\n*Please enter your Business Name:*`,
        nextStep: 'business_name'
      };
    } catch (error) {
      console.error('Error in handlePersonalEmail:', error);
      return {
        response: "❌ There was an error processing your email. Please try again.",
        nextStep: 'personal_email'
      };
    }
  }

  // ============ BUSINESS INFORMATION ============
  
  handleBusinessName(input, session) {
    try {
      const validation = ValidationService.validateBusinessName(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your Business Name:`,
          nextStep: 'business_name'
        };
      }
      
      if (!session.data.businessInfo) {
        session.data.businessInfo = {};
      }
      
      session.data.businessInfo.businessName = input.trim();
      
      return {
        response: `✅ Business name recorded.\n\nIs your Trading Name different from your Business Name?\n\nType YES or NO:`,
        nextStep: 'business_trading'
      };
    } catch (error) {
      console.error('Error in handleBusinessName:', error);
      return {
        response: "❌ There was an error processing your business name. Please try again.",
        nextStep: 'business_name'
      };
    }
  }

  handleBusinessTrading(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'yes') {
      return {
        response: "Please enter your Trading Name:",
        nextStep: 'business_trading_name'
      };
    } else if (normalizedInput === 'no') {
      session.data.businessInfo.tradingName = session.data.businessInfo.businessName;
      return {
        response: "✅ Using Business Name as Trading Name.\n\nPlease enter your CIPC Registration Number (if registered):\n\nFormat: CK2012/123456/07\n\nIf not registered, type SKIP:",
        nextStep: 'business_cipc'
      };
    } else {
      return {
        response: "Please type YES or NO:\n\nIs your Trading Name different from your Business Name?",
        nextStep: 'business_trading'
      };
    }
  }

  handleBusinessTradingName(input, session) {
    try {
      const validation = ValidationService.validateBusinessName(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your Trading Name:`,
          nextStep: 'business_trading_name'
        };
      }
      
      session.data.businessInfo.tradingName = input.trim();
      
      return {
        response: "✅ Trading Name recorded.\n\nPlease enter your CIPC Registration Number (if registered):\n\nFormat: CK2012/123456/07\n\nIf not registered, type SKIP:",
        nextStep: 'business_cipc'
      };
    } catch (error) {
      console.error('Error in handleBusinessTradingName:', error);
      return {
        response: "❌ There was an error processing your trading name. Please try again.",
        nextStep: 'business_trading_name'
      };
    }
  }

  handleBusinessCIPC(input, session) {
    if (input.toLowerCase().trim() === 'skip') {
      session.data.businessInfo.cipcNumber = 'Not Provided';
      return {
        response: "✅ No CIPC number provided.\n\nPlease describe your business sub-sector:\n\nExample: Organic vegetable farming, Mobile app development, Bakery, etc.",
        nextStep: 'business_sub_sector'
      };
    }
    
    try {
      const validation = ValidationService.validateCIPC(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter CIPC in format: CK2012/123456/07 or type SKIP:`,
          nextStep: 'business_cipc'
        };
      }
      
      session.data.businessInfo.cipcNumber = input.trim().toUpperCase();
      
      return {
        response: "✅ CIPC number recorded.\n\nPlease describe your business sub-sector:\n\nExample: Organic vegetable farming, Mobile app development, Bakery, etc.",
        nextStep: 'business_sub_sector'
      };
    } catch (error) {
      console.error('Error in handleBusinessCIPC:', error);
      return {
        response: "❌ There was an error processing your CIPC number. Please try again or type SKIP.",
        nextStep: 'business_cipc'
      };
    }
  }

  handleBusinessSubSector(input, session) {
    if (!input || input.trim().length < 3) {
      return {
        response: "❌ Please provide a valid sub-sector description (at least 3 characters).",
        nextStep: 'business_sub_sector'
      };
    }
    
    session.data.businessInfo.subSector = input.trim();
    
    return {
      response: "✅ Sub-sector recorded.\n\nPlease provide a brief description of your business:",
      nextStep: 'business_description'
    };
  }

  handleBusinessDescription(input, session) {
    try {
      const validation = ValidationService.validateTextField(input, 'Business description', 20, 500);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease provide a business description:`,
          nextStep: 'business_description'
        };
      }
      
      session.data.businessInfo.description = input.trim();
      
      return {
        response: this.getBusinessTypeOptions(),
        nextStep: 'business_type'
      };
    } catch (error) {
      console.error('Error in handleBusinessDescription:', error);
      return {
        response: "❌ There was an error processing your business description. Please try again.",
        nextStep: 'business_description'
      };
    }
  }

  getBusinessTypeOptions() {
    const options = [
      "Sole Proprietor",
      "Partnership", 
      "Private Company",
      "Public Company",
      "Cooperative",
      "Non-Profit",
      "Other"
    ];
    
    let message = "🏢 *BUSINESS TYPE*\n\n";
    message += "Please select your business type:\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number or name:";
    
    return message;
  }

  handleBusinessType(input, session) {
    try {
      const options = [
        "Sole Proprietor",
        "Partnership", 
        "Private Company",
        "Public Company",
        "Cooperative",
        "Non-Profit",
        "Other"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select your business type:`,
          nextStep: 'business_type'
        };
      }
      
      session.data.businessInfo.businessType = validation.data || input;
      
      return {
        response: this.getIndustryOptions(),
        nextStep: 'business_industry'
      };
    } catch (error) {
      console.error('Error in handleBusinessType:', error);
      return {
        response: "❌ There was an error processing your business type. Please try again.",
        nextStep: 'business_type'
      };
    }
  }

  getIndustryOptions() {
    const options = [
      "Agriculture",
      "Manufacturing",
      "Retail",
      "Services",
      "Technology",
      "Construction",
      "Other"
    ];
    
    let message = "🏭 *INDUSTRY*\n\n";
    message += "Please select your industry:\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number or name:";
    
    return message;
  }

  handleBusinessIndustry(input, session) {
    try {
      const options = [
        "Agriculture",
        "Manufacturing",
        "Retail",
        "Services",
        "Technology",
        "Construction",
        "Other"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select your industry:`,
          nextStep: 'business_industry'
        };
      }
      
      session.data.businessInfo.industry = validation.data || input;
      
      return {
        response: "✅ Business information completed!\n\nLet's move to address information.\n\n*Please enter your Street Address:*",
        nextStep: 'address_street'
      };
    } catch (error) {
      console.error('Error in handleBusinessIndustry:', error);
      return {
        response: "❌ There was an error processing your industry. Please try again.",
        nextStep: 'business_industry'
      };
    }
  }

  // ============ ADDRESS INFORMATION ============
  
  handleAddressStreet(input, session) {
    try {
      const validation = ValidationService.validateAddressField(input, 'Street address');
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your Street Address:`,
          nextStep: 'address_street'
        };
      }
      
      if (!session.data.addressInfo) {
        session.data.addressInfo = {};
      }
      
      session.data.addressInfo.streetAddress = input.trim();
      
      return {
        response: "✅ Street address recorded.\n\nPlease enter your Township/Area:",
        nextStep: 'address_township'
      };
    } catch (error) {
      console.error('Error in handleAddressStreet:', error);
      return {
        response: "❌ There was an error processing your address. Please try again.",
        nextStep: 'address_street'
      };
    }
  }

  handleAddressTownship(input, session) {
    try {
      const validation = ValidationService.validateAddressField(input, 'Township');
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your Township/Area:`,
          nextStep: 'address_township'
        };
      }
      
      session.data.addressInfo.township = input.trim();
      
      return {
        response: "✅ Township recorded.\n\nPlease enter your City:",
        nextStep: 'address_city'
      };
    } catch (error) {
      console.error('Error in handleAddressTownship:', error);
      return {
        response: "❌ There was an error processing your township. Please try again.",
        nextStep: 'address_township'
      };
    }
  }

  handleAddressCity(input, session) {
    try {
      const validation = ValidationService.validateAddressField(input, 'City');
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your City:`,
          nextStep: 'address_city'
        };
      }
      
      session.data.addressInfo.city = input.trim();
      
      return {
        response: "✅ City recorded.\n\nPlease enter your District/Municipality:",
        nextStep: 'address_district'
      };
    } catch (error) {
      console.error('Error in handleAddressCity:', error);
      return {
        response: "❌ There was an error processing your city. Please try again.",
        nextStep: 'address_city'
      };
    }
  }

  handleAddressDistrict(input, session) {
    try {
      const validation = ValidationService.validateAddressField(input, 'District');
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your District/Municipality:`,
          nextStep: 'address_district'
        };
      }
      
      session.data.addressInfo.district = input.trim();
      
      return {
        response: this.getProvinceOptions(),
        nextStep: 'address_province'
      };
    } catch (error) {
      console.error('Error in handleAddressDistrict:', error);
      return {
        response: "❌ There was an error processing your district. Please try again.",
        nextStep: 'address_district'
      };
    }
  }

  getProvinceOptions() {
    const provinces = [
      "Eastern Cape",
      "Free State",
      "Gauteng",
      "KwaZulu-Natal",
      "Limpopo",
      "Mpumalanga",
      "North West",
      "Northern Cape",
      "Western Cape"
    ];
    
    let message = "🗺️ *PROVINCE*\n\n";
    message += "Please select your province:\n\n";
    
    provinces.forEach((province, index) => {
      message += `${index + 1}. ${province}\n`;
    });
    
    message += "\nType the number or name:";
    
    return message;
  }

  handleAddressProvince(input, session) {
    try {
      const provinces = [
        "Eastern Cape",
        "Free State",
        "Gauteng",
        "KwaZulu-Natal",
        "Limpopo",
        "Mpumalanga",
        "North West",
        "Northern Cape",
        "Western Cape"
      ];
      
      const validation = ValidationService.validateSelection(input, provinces);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select your province:`,
          nextStep: 'address_province'
        };
      }
      
      session.data.addressInfo.province = validation.data || input;
      
      return {
        response: "✅ Province recorded.\n\nPlease enter your ZIP/Postal Code (4 digits):\n\nExample: 2000",
        nextStep: 'address_zip'
      };
    } catch (error) {
      console.error('Error in handleAddressProvince:', error);
      return {
        response: "❌ There was an error processing your province. Please try again.",
        nextStep: 'address_province'
      };
    }
  }

  handleAddressZip(input, session) {
    try {
      const validation = ValidationService.validateZipCode(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter your ZIP code (4 digits):`,
          nextStep: 'address_zip'
        };
      }
      
      session.data.addressInfo.zipCode = validation.data;
      
      return {
        response: "✅ Address information completed!\n\nLet's move to employment and revenue details.\n\n*How many total employees do you have?*",
        nextStep: 'employment_total'
      };
    } catch (error) {
      console.error('Error in handleAddressZip:', error);
      return {
        response: "❌ There was an error processing your ZIP code. Please try again.",
        nextStep: 'address_zip'
      };
    }
  }

  // ============ EMPLOYMENT & REVENUE ============
  
  handleEmploymentTotal(input, session) {
    try {
      const validation = ValidationService.validateEmployeeCount(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter number of total employees:`,
          nextStep: 'employment_total'
        };
      }
      
      if (!session.data.employmentRevenue) {
        session.data.employmentRevenue = {};
      }
      
      session.data.employmentRevenue.totalEmployees = validation.data;
      
      return {
        response: "✅ Total employees recorded.\n\nHow many of these are Full-Time employees?",
        nextStep: 'employment_fulltime'
      };
    } catch (error) {
      console.error('Error in handleEmploymentTotal:', error);
      return {
        response: "❌ There was an error processing employee count. Please try again.",
        nextStep: 'employment_total'
      };
    }
  }

  handleEmploymentFullTime(input, session) {
    try {
      const validation = ValidationService.validateEmployeeCount(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter number of full-time employees:`,
          nextStep: 'employment_fulltime'
        };
      }
      
      session.data.employmentRevenue.fullTimeCount = validation.data;
      
      return {
        response: "✅ Full-time employees recorded.\n\nHow many are Part-Time employees?",
        nextStep: 'employment_parttime'
      };
    } catch (error) {
      console.error('Error in handleEmploymentFullTime:', error);
      return {
        response: "❌ There was an error processing full-time count. Please try again.",
        nextStep: 'employment_fulltime'
      };
    }
  }

  handleEmploymentPartTime(input, session) {
    try {
      const validation = ValidationService.validateEmployeeCount(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter number of part-time employees:`,
          nextStep: 'employment_parttime'
        };
      }
      
      session.data.employmentRevenue.partTimeCount = validation.data;
      
      return {
        response: "✅ Part-time employees recorded.\n\nHow many years has your business been in operation?",
        nextStep: 'employment_years'
      };
    } catch (error) {
      console.error('Error in handleEmploymentPartTime:', error);
      return {
        response: "❌ There was an error processing part-time count. Please try again.",
        nextStep: 'employment_parttime'
      };
    }
  }

  handleEmploymentYears(input, session) {
    try {
      const validation = ValidationService.validateYearsInOperation(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter years in operation:`,
          nextStep: 'employment_years'
        };
      }
      
      session.data.employmentRevenue.yearsInOperation = validation.data;
      
      return {
        response: this.getRevenueOptions(),
        nextStep: 'employment_revenue'
      };
    } catch (error) {
      console.error('Error in handleEmploymentYears:', error);
      return {
        response: "❌ There was an error processing years in operation. Please try again.",
        nextStep: 'employment_years'
      };
    }
  }

  getRevenueOptions() {
    const options = [
      "< R10,000",
      "R10,000 - R50,000",
      "R50,001 - R200,000",
      "> R200,000"
    ];
    
    let message = "💰 *MONTHLY REVENUE RANGE*\n\n";
    message += "Please select your monthly revenue range:\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleEmploymentRevenue(input, session) {
    try {
      const options = [
        "< R10,000",
        "R10,000 - R50,000",
        "R50,001 - R200,000",
        "> R200,000"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select your revenue range:`,
          nextStep: 'employment_revenue'
        };
      }
      
      session.data.employmentRevenue.monthlyRevenueRange = validation.data || input;
      
      return {
        response: "✅ Employment & Revenue information completed!\n\nLet's move to funding request details.\n\n*How much funding are you requesting (in ZAR)?*",
        nextStep: 'funding_amount'
      };
    } catch (error) {
      console.error('Error in handleEmploymentRevenue:', error);
      return {
        response: "❌ There was an error processing revenue range. Please try again.",
        nextStep: 'employment_revenue'
      };
    }
  }

  // ============ FUNDING REQUEST ============
  
  handleFundingAmount(input, session) {
    try {
      const validation = ValidationService.validateFundingAmount(input);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease enter funding amount (R1,000 - R10,000,000):`,
          nextStep: 'funding_amount'
        };
      }
      
      if (!session.data.fundingRequest) {
        session.data.fundingRequest = {};
      }
      
      session.data.fundingRequest.fundingAmount = validation.data;
      
      return {
        response: this.getFundingPurposeOptions(),
        nextStep: 'funding_purpose'
      };
    } catch (error) {
      console.error('Error in handleFundingAmount:', error);
      return {
        response: "❌ There was an error processing funding amount. Please try again.",
        nextStep: 'funding_amount'
      };
    }
  }

  getFundingPurposeOptions() {
    const options = [
      "Working Capital",
      "Equipment Purchase",
      "Expansion",
      "Debt Consolidation",
      "Other"
    ];
    
    let message = "🎯 *FUNDING PURPOSE*\n\n";
    message += "Please select your funding purpose (you can select multiple):\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the numbers separated by commas (e.g., 1,3):";
    
    return message;
  }

  handleFundingPurpose(input, session) {
    try {
      const options = [
        "Working Capital",
        "Equipment Purchase",
        "Expansion",
        "Debt Consolidation",
        "Other"
      ];
      
      const validation = ValidationService.validateMultipleSelections(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select funding purpose:`,
          nextStep: 'funding_purpose'
        };
      }
      
      session.data.fundingRequest.fundingPurpose = validation.data;
      
      if (validation.data.includes("Other")) {
        return {
          response: "Please specify the 'Other' funding purpose:",
          nextStep: 'funding_other_purpose'
        };
      }
      
      return {
        response: this.getFundingTypeOptions(),
        nextStep: 'funding_type'
      };
    } catch (error) {
      console.error('Error in handleFundingPurpose:', error);
      return {
        response: "❌ There was an error processing funding purpose. Please try again.",
        nextStep: 'funding_purpose'
      };
    }
  }

  handleFundingOtherPurpose(input, session) {
    if (!input || input.trim().length < 5) {
      return {
        response: "❌ Please provide a valid purpose description (at least 5 characters).",
        nextStep: 'funding_other_purpose'
      };
    }
    
    session.data.fundingRequest.otherPurposeDetails = input.trim();
    
    return {
      response: this.getFundingTypeOptions(),
      nextStep: 'funding_type'
    };
  }

  getFundingTypeOptions() {
    const options = [
      "Grant",
      "Loan",
      "Equity",
      "Other"
    ];
    
    let message = "📝 *PREFERRED FUNDING TYPE*\n\n";
    message += "Please select your preferred funding type:\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number or name:";
    
    return message;
  }

  handleFundingType(input, session) {
    try {
      const options = [
        "Grant",
        "Loan",
        "Equity",
        "Other"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select funding type:`,
          nextStep: 'funding_type'
        };
      }
      
      session.data.fundingRequest.preferredFundingType = validation.data || input;
      
      if ((validation.data || input).toLowerCase().includes('loan')) {
        return {
          response: "Can you demonstrate loan repayment ability?\n\nOptions: YES, NO, UNSURE",
          nextStep: 'funding_repayment'
        };
      }
      
      return {
        response: "✅ Funding type recorded.\n\nPlease provide a detailed justification for your funding request:",
        nextStep: 'funding_justification'
      };
    } catch (error) {
      console.error('Error in handleFundingType:', error);
      return {
        response: "❌ There was an error processing funding type. Please try again.",
        nextStep: 'funding_type'
      };
    }
  }

  handleFundingRepayment(input, session) {
    const options = ["YES", "NO", "UNSURE"];
    const normalizedInput = input.toUpperCase().trim();
    
    if (!options.includes(normalizedInput)) {
      return {
        response: "❌ Please select YES, NO, or UNSURE:",
        nextStep: 'funding_repayment'
      };
    }
    
    session.data.fundingRequest.loanRepaymentAbility = normalizedInput;
    
    return {
      response: "✅ Repayment ability recorded.\n\nPlease provide a detailed justification for your funding request:",
      nextStep: 'funding_justification'
    };
  }

  handleFundingJustification(input, session) {
    try {
      const validation = ValidationService.validateTextField(input, 'Funding justification', 50, 1000);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease provide funding justification:`,
          nextStep: 'funding_justification'
        };
      }
      
      session.data.fundingRequest.justification = input.trim();
      
      return {
        response: "✅ Funding request completed!\n\nLet's move to readiness assessment.\n\n*Do you have a business plan?*",
        nextStep: 'readiness_business_plan'
      };
    } catch (error) {
      console.error('Error in handleFundingJustification:', error);
      return {
        response: "❌ There was an error processing your justification. Please try again.",
        nextStep: 'funding_justification'
      };
    }
  }

  // ============ READINESS ASSESSMENT ============
  
  getBusinessPlanOptions() {
    const options = [
      "Yes - I have a written plan",
      "Yes - I have a basic plan (not written)",
      "No - I don't have one",
      "I need help creating one"
    ];
    
    let message = "📊 *BUSINESS PLAN STATUS*\n\n";
    message += "Do you have a business plan?\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessBusinessPlan(input, session) {
    try {
      const options = [
        "Yes - I have a written plan",
        "Yes - I have a basic plan (not written)",
        "No - I don't have one",
        "I need help creating one"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select business plan status:`,
          nextStep: 'readiness_business_plan'
        };
      }
      
      if (!session.data.readinessAssessment) {
        session.data.readinessAssessment = {};
      }
      
      session.data.readinessAssessment.businessPlanStatus = validation.data || input;
      
      return {
        response: this.getFinancialRecordsOptions(),
        nextStep: 'readiness_financial_records'
      };
    } catch (error) {
      console.error('Error in handleReadinessBusinessPlan:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_business_plan'
      };
    }
  }

  getFinancialRecordsOptions() {
    const options = [
      "Yes - Detailed records (spreadsheets/software)",
      "Yes - Basic records (notebook/paper)",
      "No - I don't keep records",
      "I need help with this"
    ];
    
    let message = "📈 *FINANCIAL RECORDS*\n\n";
    message += "Do you keep financial records?\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessFinancialRecords(input, session) {
    try {
      const options = [
        "Yes - Detailed records (spreadsheets/software)",
        "Yes - Basic records (notebook/paper)",
        "No - I don't keep records",
        "I need help with this"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select financial records status:`,
          nextStep: 'readiness_financial_records'
        };
      }
      
      session.data.readinessAssessment.financialRecords = validation.data || input;
      
      return {
        response: this.getBankStatementsOptions(),
        nextStep: 'readiness_bank_statements'
      };
    } catch (error) {
      console.error('Error in handleReadinessFinancialRecords:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_financial_records'
      };
    }
  }

  getBankStatementsOptions() {
    const options = [
      "Yes - I have them ready",
      "Yes - But in a personal account",
      "No - Don't have business banking",
      "No - Need to open business account"
    ];
    
    let message = "🏦 *BANK STATEMENTS*\n\n";
    message += "Do you have bank statements?\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessBankStatements(input, session) {
    try {
      const options = [
        "Yes - I have them ready",
        "Yes - But in a personal account",
        "No - Don't have business banking",
        "No - Need to open business account"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select bank statements status:`,
          nextStep: 'readiness_bank_statements'
        };
      }
      
      session.data.readinessAssessment.bankStatements = validation.data || input;
      
      return {
        response: this.getTrainingOptions(),
        nextStep: 'readiness_training'
      };
    } catch (error) {
      console.error('Error in handleReadinessBankStatements:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_bank_statements'
      };
    }
  }

  getTrainingOptions() {
    const options = [
      "Yes - Formal business training",
      "Yes - Some workshops/courses",
      "No - No formal training",
      "I want training opportunities"
    ];
    
    let message = "🎓 *BUSINESS TRAINING*\n\n";
    message += "Have you received any business training?\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessTraining(input, session) {
    try {
      const options = [
        "Yes - Formal business training",
        "Yes - Some workshops/courses",
        "No - No formal training",
        "I want training opportunities"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select business training status:`,
          nextStep: 'readiness_training'
        };
      }
      
      session.data.readinessAssessment.businessTraining = validation.data || input;
      
      return {
        response: this.getCooperativeOptions(),
        nextStep: 'readiness_cooperative'
      };
    } catch (error) {
      console.error('Error in handleReadinessTraining:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_training'
      };
    }
  }

  getCooperativeOptions() {
    const options = [
      "Yes - Already a member",
      "Yes - Want to join one",
      "Yes - Want to form one",
      "No - Prefer to work alone",
      "Not sure what it is"
    ];
    
    let message = "🤝 *COOPERATIVE INTEREST*\n\n";
    message += "Are you interested in cooperatives?\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessCooperative(input, session) {
    try {
      const options = [
        "Yes - Already a member",
        "Yes - Want to join one",
        "Yes - Want to form one",
        "No - Prefer to work alone",
        "Not sure what it is"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select cooperative interest:`,
          nextStep: 'readiness_cooperative'
        };
      }
      
      session.data.readinessAssessment.cooperativeInterest = validation.data || input;
      
      return {
        response: this.getSelfAssessmentOptions(),
        nextStep: 'readiness_self_assessment'
      };
    } catch (error) {
      console.error('Error in handleReadinessCooperative:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_cooperative'
      };
    }
  }

  getSelfAssessmentOptions() {
    const options = [
      "1 - Just starting (need lots of help)",
      "2 - Early stage",
      "3 - Developing",
      "4 - Almost ready",
      "5 - Fully ready (professional operation)"
    ];
    
    let message = "📊 *SELF-ASSESSMENT READINESS*\n\n";
    message += "Rate your business readiness:\n\n";
    
    options.forEach((option, index) => {
      message += `${option}\n`;
    });
    
    message += "\nType the number (1-5):";
    
    return message;
  }

  handleReadinessSelfAssessment(input, session) {
    try {
      const options = [
        "1 - Just starting (need lots of help)",
        "2 - Early stage",
        "3 - Developing",
        "4 - Almost ready",
        "5 - Fully ready (professional operation)"
      ];
      
      const validation = ValidationService.validateSelection(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select readiness level (1-5):`,
          nextStep: 'readiness_self_assessment'
        };
      }
      
      const readinessLevel = validation.data ? validation.data.split(' - ')[0] : input;
      session.data.readinessAssessment.selfAssessmentReadiness = readinessLevel;
      
      return {
        response: this.getSupportNeedsOptions(),
        nextStep: 'readiness_support_needs'
      };
    } catch (error) {
      console.error('Error in handleReadinessSelfAssessment:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_self_assessment'
      };
    }
  }

  getSupportNeedsOptions() {
    const options = [
      "Funding/Grants",
      "Business training",
      "Mentorship",
      "Marketing help",
      "Financial management",
      "Legal advice",
      "Networking opportunities",
      "Equipment/Tools",
      "Workspace/Premises"
    ];
    
    let message = "🤝 *SUPPORT NEEDS*\n\n";
    message += "What support do you need? (Select multiple):\n\n";
    
    options.forEach((option, index) => {
      message += `${index + 1}. ${option}\n`;
    });
    
    message += "\nType the numbers separated by commas (e.g., 1,3,5):";
    
    return message;
  }

  handleReadinessSupportNeeds(input, session) {
    try {
      const options = [
        "Funding/Grants",
        "Business training",
        "Mentorship",
        "Marketing help",
        "Financial management",
        "Legal advice",
        "Networking opportunities",
        "Equipment/Tools",
        "Workspace/Premises"
      ];
      
      const validation = ValidationService.validateMultipleSelections(input, options);
      
      if (!validation.valid) {
        return {
          response: `❌ ${validation.message}\n\nPlease select support needs:`,
          nextStep: 'readiness_support_needs'
        };
      }
      
      session.data.readinessAssessment.supportNeeds = validation.data;
      
      return {
        response: "✅ Readiness assessment completed!\n\nLet's review your application before submission.",
        nextStep: 'review_summary'
      };
    } catch (error) {
      console.error('Error in handleReadinessSupportNeeds:', error);
      return {
        response: "❌ There was an error processing your response. Please try again.",
        nextStep: 'readiness_support_needs'
      };
    }
  }

  // ============ REVIEW AND SUBMIT ============
  
  getApplicationSummary(data) {
    try {
      let summary = "📋 *APPLICATION SUMMARY*\n\n";
      summary += "Please review your information:\n\n";
      
      // Personal Information
      summary += "👤 *PERSONAL INFORMATION*\n";
      if (data.personalInfo) {
        summary += `• ID: ${data.personalInfo.idNumber || 'Not provided'}\n`;
        summary += `• Name: ${data.personalInfo.fullName || 'Not provided'}\n`;
        summary += `• DOB: ${data.personalInfo.dob ? moment(data.personalInfo.dob).format('DD/MM/YYYY') : 'Not provided'}\n`;
        summary += `• Phone: ${data.personalInfo.phone || 'Not provided'}\n`;
        summary += `• Email: ${data.personalInfo.email || 'Not provided'}\n`;
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      // Business Information
      summary += "🏢 *BUSINESS INFORMATION*\n";
      if (data.businessInfo) {
        summary += `• Business Name: ${data.businessInfo.businessName || 'Not provided'}\n`;
        summary += `• Trading Name: ${data.businessInfo.tradingName || 'Not provided'}\n`;
        summary += `• CIPC: ${data.businessInfo.cipcNumber || 'Not provided'}\n`;
        summary += `• Sub-Sector: ${data.businessInfo.subSector || 'Not provided'}\n`;
        summary += `• Business Type: ${data.businessInfo.businessType || 'Not provided'}\n`;
        summary += `• Industry: ${data.businessInfo.industry || 'Not provided'}\n`;
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      // Address Information
      summary += "📍 *ADDRESS INFORMATION*\n";
      if (data.addressInfo) {
        summary += `• Street: ${data.addressInfo.streetAddress || 'Not provided'}\n`;
        summary += `• Township: ${data.addressInfo.township || 'Not provided'}\n`;
        summary += `• City: ${data.addressInfo.city || 'Not provided'}\n`;
        summary += `• District: ${data.addressInfo.district || 'Not provided'}\n`;
        summary += `• Province: ${data.addressInfo.province || 'Not provided'}\n`;
        summary += `• ZIP: ${data.addressInfo.zipCode || 'Not provided'}\n`;
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      // Employment & Revenue
      summary += "👥 *EMPLOYMENT & REVENUE*\n";
      if (data.employmentRevenue) {
        summary += `• Total Employees: ${data.employmentRevenue.totalEmployees || 'Not provided'}\n`;
        summary += `• Full-Time: ${data.employmentRevenue.fullTimeCount || 'Not provided'}\n`;
        summary += `• Part-Time: ${data.employmentRevenue.partTimeCount || 'Not provided'}\n`;
        summary += `• Years in Operation: ${data.employmentRevenue.yearsInOperation || 'Not provided'}\n`;
        summary += `• Monthly Revenue: ${data.employmentRevenue.monthlyRevenueRange || 'Not provided'}\n`;
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      // Funding Request
      summary += "💰 *FUNDING REQUEST*\n";
      if (data.fundingRequest) {
        summary += `• Amount: R${data.fundingRequest.fundingAmount?.toLocaleString() || 'Not provided'}\n`;
        summary += `• Purpose: ${Array.isArray(data.fundingRequest.fundingPurpose) ? data.fundingRequest.fundingPurpose.join(', ') : data.fundingRequest.fundingPurpose || 'Not provided'}\n`;
        if (data.fundingRequest.otherPurposeDetails) {
          summary += `• Other Purpose: ${data.fundingRequest.otherPurposeDetails}\n`;
        }
        summary += `• Preferred Type: ${data.fundingRequest.preferredFundingType || 'Not provided'}\n`;
        if (data.fundingRequest.loanRepaymentAbility) {
          summary += `• Repayment Ability: ${data.fundingRequest.loanRepaymentAbility}\n`;
        }
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      // Readiness Assessment
      summary += "📋 *READINESS ASSESSMENT*\n";
      if (data.readinessAssessment) {
        summary += `• Business Plan: ${data.readinessAssessment.businessPlanStatus || 'Not provided'}\n`;
        summary += `• Financial Records: ${data.readinessAssessment.financialRecords || 'Not provided'}\n`;
        summary += `• Bank Statements: ${data.readinessAssessment.bankStatements || 'Not provided'}\n`;
        summary += `• Business Training: ${data.readinessAssessment.businessTraining || 'Not provided'}\n`;
        summary += `• Cooperative Interest: ${data.readinessAssessment.cooperativeInterest || 'Not provided'}\n`;
        summary += `• Self-Assessment: ${data.readinessAssessment.selfAssessmentReadiness || 'Not provided'}/5\n`;
        summary += `• Support Needs: ${Array.isArray(data.readinessAssessment.supportNeeds) ? data.readinessAssessment.supportNeeds.join(', ') : data.readinessAssessment.supportNeeds || 'Not provided'}\n`;
      } else {
        summary += "• Not provided\n";
      }
      summary += "\n";
      
      summary += "Type *CONFIRM* to submit your application\n";
      summary += "Type *EDIT* to make changes\n";
      summary += "Type *SAVE* to save and continue later";
      
      return summary;
    } catch (error) {
      console.error('Error in getApplicationSummary:', error);
      return "Unable to generate summary. Please type REVIEW to try again.";
    }
  }

  handleReviewSummary(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'confirm') {
      return {
        response: "Are you sure you want to submit your application?\n\nType SUBMIT to confirm or BACK to review.",
        nextStep: 'confirm_submission'
      };
    } else if (normalizedInput === 'edit') {
      return {
        response: this.getEditMenu(session.data),
        nextStep: 'edit_menu'
      };
    } else if (normalizedInput === 'save') {
      return {
        response: "Would you like to save your progress and continue later?",
        nextStep: 'save_confirm',
        shouldSave: true
      };
    } else {
      return {
        response: "Please type CONFIRM, EDIT, or SAVE.",
        nextStep: 'review_summary'
      };
    }
  }

  handleConfirmSubmission(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'submit') {
      session.data.summary = this.getApplicationSummary(session.data);
      session.data.completed = true;
      session.data.submittedAt = new Date().toISOString();
      
      return {
        response: `✅ *APPLICATION SUBMITTED SUCCESSFULLY!* ✅\n\nThank you for submitting your funding application.\n\n📧 You will receive a confirmation email shortly.\n📱 We'll contact you via WhatsApp for updates.\n⏳ Processing time: 7-14 business days.\n\nYour reference number: ${session.id?.substring(0, 8).toUpperCase() || 'N/A'}\n\nType MENU to start a new application.`,
        nextStep: null,
        shouldSave: true,
        isComplete: true
      };
    } else if (normalizedInput === 'back') {
      return {
        response: this.getApplicationSummary(session.data),
        nextStep: 'review_summary'
      };
    } else {
      return {
        response: "Please type SUBMIT to confirm or BACK to review.",
        nextStep: 'confirm_submission'
      };
    }
  }

  handleSaveConfirm(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'yes') {
      return {
        response: `✅ Your application has been saved. You can continue later by messaging us again.\n\nYour reference: ${session.id?.substring(0, 8).toUpperCase() || 'N/A'}\n\nType CONTINUE anytime to resume.`,
        nextStep: null,
        shouldSave: true
      };
    } else if (normalizedInput === 'no') {
      return {
        response: "Continuing with your application...",
        nextStep: session.step
      };
    } else {
      return {
        response: "Please type YES to save or NO to continue.",
        nextStep: 'save_confirm'
      };
    }
  }

  getEditMenu(data) {
    try {
      let menu = "✏️ *EDIT INFORMATION*\n\n";
      menu += "Which section would you like to edit?\n\n";
      
      menu += "1. Personal Information\n";
      menu += "2. Business Information\n";
      menu += "3. Address Information\n";
      menu += "4. Employment & Revenue\n";
      menu += "5. Funding Request\n";
      menu += "6. Readiness Assessment\n";
      menu += "7. Back to Review\n\n";
      
      menu += "Type the number:";
      
      return menu;
    } catch (error) {
      console.error('Error in getEditMenu:', error);
      return "Please type MENU to return to the main menu.";
    }
  }

  handleEditMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    switch(normalizedInput) {
      case '1':
        return {
          response: "Editing Personal Information. Please enter your ID number:",
          nextStep: 'personal_id'
        };
      case '2':
        return {
          response: "Editing Business Information. Please enter your Business Name:",
          nextStep: 'business_name'
        };
      case '3':
        return {
          response: "Editing Address Information. Please enter your Street Address:",
          nextStep: 'address_street'
        };
      case '4':
        return {
          response: "Editing Employment & Revenue. Please enter total employees:",
          nextStep: 'employment_total'
        };
      case '5':
        return {
          response: "Editing Funding Request. Please enter funding amount:",
          nextStep: 'funding_amount'
        };
      case '6':
        return {
          response: "Editing Readiness Assessment.",
          nextStep: 'readiness_business_plan'
        };
      case '7':
        return {
          response: this.getApplicationSummary(session.data),
          nextStep: 'review_summary'
        };
      default:
        return {
          response: "Please select a valid option (1-7).",
          nextStep: 'edit_menu'
        };
    }
  }

  handleContinueMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'personal') {
      return {
        response: "Continuing with Personal Information. Please enter your ID number:",
        nextStep: 'personal_id'
      };
    } else if (normalizedInput === 'business') {
      return {
        response: "Continuing with Business Information. Please enter your Business Name:",
        nextStep: 'business_name'
      };
    } else if (normalizedInput === 'address') {
      return {
        response: "Continuing with Address Information. Please enter your Street Address:",
        nextStep: 'address_street'
      };
    } else if (normalizedInput === 'employment') {
      return {
        response: "Continuing with Employment & Revenue. Please enter total employees:",
        nextStep: 'employment_total'
      };
    } else if (normalizedInput === 'funding') {
      return {
        response: "Continuing with Funding Request. Please enter funding amount:",
        nextStep: 'funding_amount'
      };
    } else if (normalizedInput === 'readiness') {
      return {
        response: "Continuing with Readiness Assessment.",
        nextStep: 'readiness_business_plan'
      };
    } else if (normalizedInput === 'review') {
      return {
        response: this.getApplicationSummary(session.data),
        nextStep: 'review_summary'
      };
    } else {
      return {
        response: "Please select PERSONAL, BUSINESS, ADDRESS, EMPLOYMENT, FUNDING, READINESS, or REVIEW.",
        nextStep: 'continue_menu'
      };
    }
  }

  // ============ UTILITY FUNCTIONS ============
  
  calculateProgress(data) {
    try {
      if (!data) return 0;
      
      let completedFields = 0;
      let totalFields = 0;
      
      // Personal Info (5 fields)
      totalFields += 5;
      if (data.personalInfo) {
        completedFields += data.personalInfo.idNumber ? 1 : 0;
        completedFields += data.personalInfo.fullName ? 1 : 0;
        completedFields += data.personalInfo.dob ? 1 : 0;
        completedFields += data.personalInfo.phone ? 1 : 0;
        completedFields += data.personalInfo.email ? 1 : 0;
      }
      
      // Business Info (7 fields)
      totalFields += 7;
      if (data.businessInfo) {
        completedFields += data.businessInfo.businessName ? 1 : 0;
        completedFields += data.businessInfo.tradingName ? 1 : 0;
        completedFields += data.businessInfo.cipcNumber !== undefined ? 1 : 0;
        completedFields += data.businessInfo.subSector ? 1 : 0;
        completedFields += data.businessInfo.description ? 1 : 0;
        completedFields += data.businessInfo.businessType ? 1 : 0;
        completedFields += data.businessInfo.industry ? 1 : 0;
      }
      
      // Address Info (6 fields)
      totalFields += 6;
      if (data.addressInfo) {
        completedFields += data.addressInfo.streetAddress ? 1 : 0;
        completedFields += data.addressInfo.township ? 1 : 0;
        completedFields += data.addressInfo.city ? 1 : 0;
        completedFields += data.addressInfo.district ? 1 : 0;
        completedFields += data.addressInfo.province ? 1 : 0;
        completedFields += data.addressInfo.zipCode ? 1 : 0;
      }
      
      // Employment & Revenue (5 fields)
      totalFields += 5;
      if (data.employmentRevenue) {
        completedFields += data.employmentRevenue.totalEmployees !== undefined ? 1 : 0;
        completedFields += data.employmentRevenue.fullTimeCount !== undefined ? 1 : 0;
        completedFields += data.employmentRevenue.partTimeCount !== undefined ? 1 : 0;
        completedFields += data.employmentRevenue.yearsInOperation !== undefined ? 1 : 0;
        completedFields += data.employmentRevenue.monthlyRevenueRange ? 1 : 0;
      }
      
      // Funding Request (6 fields)
      totalFields += 6;
      if (data.fundingRequest) {
        completedFields += data.fundingRequest.fundingAmount !== undefined ? 1 : 0;
        completedFields += data.fundingRequest.fundingPurpose ? 1 : 0;
        completedFields += data.fundingRequest.otherPurposeDetails !== undefined ? 1 : 0;
        completedFields += data.fundingRequest.preferredFundingType ? 1 : 0;
        completedFields += data.fundingRequest.loanRepaymentAbility ? 1 : 0;
        completedFields += data.fundingRequest.justification ? 1 : 0;
      }
      
      // Readiness Assessment (7 fields)
      totalFields += 7;
      if (data.readinessAssessment) {
        completedFields += data.readinessAssessment.businessPlanStatus ? 1 : 0;
        completedFields += data.readinessAssessment.financialRecords ? 1 : 0;
        completedFields += data.readinessAssessment.bankStatements ? 1 : 0;
        completedFields += data.readinessAssessment.businessTraining ? 1 : 0;
        completedFields += data.readinessAssessment.cooperativeInterest ? 1 : 0;
        completedFields += data.readinessAssessment.selfAssessmentReadiness ? 1 : 0;
        completedFields += data.readinessAssessment.supportNeeds ? 1 : 0;
      }
      
      return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  }

  getCompletedSections(data) {
    const sections = {
      completed: [],
      incomplete: []
    };
    
    try {
      if (!data) return sections;
      
      // Check Personal Info
      if (data.personalInfo && 
          data.personalInfo.idNumber && 
          data.personalInfo.fullName && 
          data.personalInfo.dob && 
          data.personalInfo.phone && 
          data.personalInfo.email) {
        sections.completed.push("✅ Personal Information");
      } else {
        sections.incomplete.push("❌ Personal Information");
      }
      
      // Check Business Info
      if (data.businessInfo && 
          data.businessInfo.businessName && 
          data.businessInfo.businessType && 
          data.businessInfo.industry) {
        sections.completed.push("✅ Business Information");
      } else {
        sections.incomplete.push("❌ Business Information");
      }
      
      // Check Address Info
      if (data.addressInfo && 
          data.addressInfo.streetAddress && 
          data.addressInfo.city && 
          data.addressInfo.province && 
          data.addressInfo.zipCode) {
        sections.completed.push("✅ Address Information");
      } else {
        sections.incomplete.push("❌ Address Information");
      }
      
      // Check Employment & Revenue
      if (data.employmentRevenue && 
          data.employmentRevenue.totalEmployees !== undefined && 
          data.employmentRevenue.yearsInOperation !== undefined &&
          data.employmentRevenue.monthlyRevenueRange) {
        sections.completed.push("✅ Employment & Revenue");
      } else {
        sections.incomplete.push("❌ Employment & Revenue");
      }
      
      // Check Funding Request
      if (data.fundingRequest && 
          data.fundingRequest.fundingAmount && 
          data.fundingRequest.fundingPurpose &&
          data.fundingRequest.preferredFundingType) {
        sections.completed.push("✅ Funding Request");
      } else {
        sections.incomplete.push("❌ Funding Request");
      }
      
      // Check Readiness Assessment
      if (data.readinessAssessment && 
          data.readinessAssessment.businessPlanStatus &&
          data.readinessAssessment.supportNeeds) {
        sections.completed.push("✅ Readiness Assessment");
      } else {
        sections.incomplete.push("❌ Readiness Assessment");
      }
      
      return sections;
    } catch (error) {
      console.error('Error getting completed sections:', error);
      return sections;
    }
  }
}

module.exports = new QuestionFlows();