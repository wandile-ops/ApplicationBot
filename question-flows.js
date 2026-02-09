const ValidationService = require('./validation');
const moment = require('moment');

class QuestionFlows {
  constructor() {
    this.flows = {
      consent: {
        question: () => this.getConsentMessage(),
        handler: (input, session) => this.handleConsent(input, session)
      },
      welcome: {
        question: (session) => this.getWelcomeMenu(session),
        handler: (input, session) => this.handleWelcomeMenu(input, session)
      },
      personal_id: {
        question: () => "Please enter your 13-digit South African ID number:",
        handler: (input, session) => this.handlePersonalID(input, session)
      },
      personal_name: {
        question: () => "Please enter your full name:\n\nExample: John Doe",
        handler: (input, session) => this.handlePersonalName(input, session)
      },
      personal_dob: {
        question: (session) => `Please enter your date of birth (DD/MM/YYYY):\n\nExample: 15/01/1990`,
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
        question: () => "Please enter your phone number:\n\nExample: 0712345678 or 27712345678",
        handler: (input, session) => this.handlePersonalPhone(input, session)
      },
      personal_email: {
        question: () => "Please enter your email address:",
        handler: (input, session) => this.handlePersonalEmail(input, session)
      },
      business_menu: {
        question: () => "🏢 *BUSINESS INFORMATION*\n\nLet's collect your business details.\n\nType START to begin:",
        handler: (input, session) => this.handleBusinessMenu(input, session)
      },
      business_name: {
        question: () => "Please enter your Business Name:",
        handler: (input, session) => this.handleBusinessName(input, session)
      },
      business_trading: {
        question: (session) => "Is your Trading Name different from your Business Name?\n\nType YES or NO:",
        handler: (input, session) => this.handleBusinessTrading(input, session)
      },
      business_trading_name: {
        question: () => "Please enter your Trading Name:",
        handler: (input, session) => this.handleBusinessTradingName(input, session)
      },
      business_type: {
        question: () => this.getBusinessTypeOptions(),
        handler: (input, session) => this.handleBusinessType(input, session)
      },
      business_cipc: {
        question: () => "Please enter your CIPC Registration Number:\n\nFormat: CK2012/123456/07\n\nIf not registered, type SKIP:",
        handler: (input, session) => this.handleBusinessCIPC(input, session)
      },
      business_industry: {
        question: () => this.getIndustryOptions(),
        handler: (input, session) => this.handleBusinessIndustry(input, session)
      },
      business_sub_sector: {
        question: () => "Please describe your business sub-sector:\n\nExample: Organic vegetable farming, Mobile app development, Bakery, etc.",
        handler: (input, session) => this.handleBusinessSubSector(input, session)
      },
      business_description: {
        question: () => "Please provide a brief description of your business (what you do, products/services):",
        handler: (input, session) => this.handleBusinessDescription(input, session)
      },
      address_menu: {
        question: () => "📍 *ADDRESS INFORMATION*\n\nLet's collect your business address.\n\nType START to begin:",
        handler: (input, session) => this.handleAddressMenu(input, session)
      },
      address_street: {
        question: () => "Please enter your Street Address:\n\nExample: 123 Main Street",
        handler: (input, session) => this.handleAddressStreet(input, session)
      },
      address_township: {
        question: () => "Please enter your Township/Area:",
        handler: (input, session) => this.handleAddressTownship(input, session)
      },
      address_city: {
        question: () => "Please enter your City:",
        handler: (input, session) => this.handleAddressCity(input, session)
      },
      address_district: {
        question: () => "Please enter your District/Municipality:",
        handler: (input, session) => this.handleAddressDistrict(input, session)
      },
      address_province: {
        question: () => this.getProvinceOptions(),
        handler: (input, session) => this.handleAddressProvince(input, session)
      },
      address_zip: {
        question: () => "Please enter your ZIP/Postal Code (4 digits):\n\nExample: 2000",
        handler: (input, session) => this.handleAddressZip(input, session)
      },
      employment_menu: {
        question: () => "👥 *EMPLOYMENT & REVENUE*\n\nLet's collect employment and revenue details.\n\nType START to begin:",
        handler: (input, session) => this.handleEmploymentMenu(input, session)
      },
      employment_total: {
        question: () => "How many total employees do you have?\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentTotal(input, session)
      },
      employment_fulltime: {
        question: () => "How many of these are Full-Time employees?\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentFullTime(input, session)
      },
      employment_parttime: {
        question: () => "How many are Part-Time employees?\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentPartTime(input, session)
      },
      employment_years: {
        question: () => "How many years has your business been in operation?\n\nEnter number:",
        handler: (input, session) => this.handleEmploymentYears(input, session)
      },
      employment_revenue: {
        question: () => this.getRevenueOptions(),
        handler: (input, session) => this.handleEmploymentRevenue(input, session)
      },
      funding_menu: {
        question: () => "💵 *FUNDING REQUEST*\n\nLet's collect your funding needs.\n\nType START to begin:",
        handler: (input, session) => this.handleFundingMenu(input, session)
      },
      funding_amount: {
        question: () => "How much funding are you requesting (in ZAR)?\n\nEnter amount:",
        handler: (input, session) => this.handleFundingAmount(input, session)
      },
      funding_purpose: {
        question: () => this.getFundingPurposeOptions(),
        handler: (input, session) => this.handleFundingPurpose(input, session)
      },
      funding_other_purpose: {
        question: () => "Please specify the 'Other' funding purpose:",
        handler: (input, session) => this.handleFundingOtherPurpose(input, session)
      },
      funding_type: {
        question: () => this.getFundingTypeOptions(),
        handler: (input, session) => this.handleFundingType(input, session)
      },
      funding_repayment: {
        question: () => "Can you demonstrate loan repayment ability?\n\nOptions: YES, NO, UNSURE",
        handler: (input, session) => this.handleFundingRepayment(input, session)
      },
      funding_justification: {
        question: () => "Please provide a detailed justification for your funding request:\n\nExplain how you will use the funds and the expected impact on your business.",
        handler: (input, session) => this.handleFundingJustification(input, session)
      },
      readiness_menu: {
        question: () => "📋 *READINESS ASSESSMENT*\n\nLet's assess your business readiness.\n\nType START to begin:",
        handler: (input, session) => this.handleReadinessMenu(input, session)
      },
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
      review_summary: {
        question: (session) => this.getApplicationSummary(session.data),
        handler: (input, session) => this.handleReviewSummary(input, session)
      },
      confirm_submission: {
        question: () => "Are you ready to submit your application?\n\nType SUBMIT to submit or BACK to review",
        handler: (input, session) => this.handleConfirmSubmission(input, session)
      },
      save_confirm: {
        question: () => "Would you like to save your progress and continue later?\n\nType SAVE to save or CONTINUE to keep filling",
        handler: (input, session) => this.handleSaveConfirm(input, session)
      },
      edit_menu: {
        question: (session) => this.getEditMenu(session.data),
        handler: (input, session) => this.handleEditMenu(input, session)
      },
      continue_menu: {
        question: (session) => {
          const progress = this.calculateProgress(session.data);
          return `Your application is ${progress}% complete. Where would you like to continue?\n\nType:\nPERSONAL - Personal Information\nBUSINESS - Business Information\nADDRESS - Address Information\nEMPLOYMENT - Employment & Revenue\nFUNDING - Funding Request\nREADINESS - Readiness Assessment\nREVIEW - Review & Submit`;
        },
        handler: (input, session) => this.handleContinueMenu(input, session)
      }
    };
  }

  getQuestion(step, session) {
    const flow = this.flows[step];
    return flow ? flow.question(session) : "Invalid step. Type MENU to see options.";
  }

  handleAnswer(step, input, session) {
    const flow = this.flows[step];
    return flow ? flow.handler(input, session) : { 
      response: "Invalid step. Type MENU to see options.", 
      nextStep: 'welcome' 
    };
  }

  // Consent Section
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
• Contact you regarding your application
• Improve our services (anonymized data)
• Comply with legal requirements

✅ *YOUR RIGHTS:*
• Access your data anytime
• Request corrections
• Withdraw consent
• Request deletion (where applicable)

📞 *Contact for privacy questions:* privacy@fundingsa.org.za

Type *AGREE* to consent and continue, or *EXIT* to cancel.`;
  }

  handleConsent(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'agree') {
      session.data.consentGiven = true;
      session.data.consentTimestamp = new Date().toISOString();
      return {
        response: "✅ Thank you for your consent. Let's begin your funding application!\n\nType MENU at any time for options.",
        nextStep: 'welcome'
      };
    } else if (normalizedInput === 'exit') {
      return {
        response: "Application cancelled. Your data has not been saved.",
        nextStep: null
      };
    } else {
      return {
        response: "Please type AGREE to continue or EXIT to cancel.",
        nextStep: 'consent'
      };
    }
  }

  // Welcome Menu
  getWelcomeMenu(session) {
    let menu = "🌟 *FUNDING APPLICATION BOT* 🌟\n\n";
    
    if (session.data.personalInfo?.idNumber) {
      const name = session.data.personalInfo.fullName || 'Applicant';
      const progress = this.calculateProgress(session.data);
      menu += `Welcome back, ${name}!\n📊 Progress: ${progress}%\n\n`;
    } else {
      menu += "Welcome to the Funding Application System!\n\n";
    }
    
    menu += "Please choose:\n\n";
    menu += "1️⃣ *Start/Continue Application*\n";
    menu += "2️⃣ *View Progress*\n";
    menu += "3️⃣ *Edit Information*\n";
    menu += "4️⃣ *Save & Exit*\n";
    menu += "5️⃣ *Help*\n\n";
    menu += "Type the number or command:";
    
    return menu;
  }

  calculateProgress(data) {
    let completed = 0;
    let total = 38; // Total fields across all sections
    
    // Personal Info (5 fields)
    if (data.personalInfo?.idNumber) completed++;
    if (data.personalInfo?.fullName) completed++;
    if (data.personalInfo?.dob) completed++;
    if (data.personalInfo?.phone) completed++;
    if (data.personalInfo?.email) completed++;
    
    // Business Info (8 fields)
    if (data.businessInfo?.businessName) completed++;
    if (data.businessInfo?.tradingName) completed++;
    if (data.businessInfo?.businessType) completed++;
    if (data.businessInfo?.cipcNumber !== undefined) completed++;
    if (data.businessInfo?.industry) completed++;
    if (data.businessInfo?.subSector) completed++;
    if (data.businessInfo?.description) completed++;
    
    // Address Info (6 fields)
    if (data.addressInfo?.streetAddress) completed++;
    if (data.addressInfo?.township) completed++;
    if (data.addressInfo?.city) completed++;
    if (data.addressInfo?.district) completed++;
    if (data.addressInfo?.province) completed++;
    if (data.addressInfo?.zipCode) completed++;
    
    // Employment & Revenue (5 fields)
    if (data.employmentRevenue?.totalEmployees !== undefined) completed++;
    if (data.employmentRevenue?.fullTimeCount !== undefined) completed++;
    if (data.employmentRevenue?.partTimeCount !== undefined) completed++;
    if (data.employmentRevenue?.yearsInOperation !== undefined) completed++;
    if (data.employmentRevenue?.monthlyRevenueRange) completed++;
    
    // Funding Request (6 fields)
    if (data.fundingRequest?.fundingAmount !== undefined) completed++;
    if (data.fundingRequest?.fundingPurpose) completed++;
    if (data.fundingRequest?.preferredFundingType) completed++;
    if (data.fundingRequest?.loanRepaymentAbility) completed++;
    if (data.fundingRequest?.justification) completed++;
    
    // Readiness Assessment (8 fields)
    if (data.readinessAssessment?.businessPlanStatus) completed++;
    if (data.readinessAssessment?.financialRecords) completed++;
    if (data.readinessAssessment?.bankStatements) completed++;
    if (data.readinessAssessment?.businessTraining) completed++;
    if (data.readinessAssessment?.cooperativeInterest) completed++;
    if (data.readinessAssessment?.selfAssessmentReadiness) completed++;
    if (data.readinessAssessment?.supportNeeds) completed++;
    
    return Math.round((completed / total) * 100);
  }

  handleWelcomeMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    switch(normalizedInput) {
      case '1':
      case 'start':
      case 'continue':
        if (!session.data.personalInfo?.idNumber) {
          return { response: "Let's start with personal information.", nextStep: 'personal_id' };
        } else if (!session.data.businessInfo?.businessName) {
          return { response: "Let's continue with business information.", nextStep: 'business_menu' };
        } else {
          return { response: "Where would you like to continue?", nextStep: 'continue_menu' };
        }
      case '2':
      case 'progress':
        const progress = this.calculateProgress(session.data);
        return {
          response: `📊 *APPLICATION PROGRESS*\n\nOverall Completion: ${progress}%\n\nType CONTINUE to resume.`,
          nextStep: 'welcome'
        };
      case '3':
      case 'edit':
        return { response: "Which section would you like to edit?", nextStep: 'edit_menu' };
      case '4':
      case 'save':
        return { response: "Would you like to save your progress?", nextStep: 'save_confirm' };
      case '5':
      case 'help':
        return { response: this.getHelpMessage(), nextStep: 'welcome' };
      case 'menu':
        return { response: this.getWelcomeMenu(session), nextStep: 'welcome' };
      default:
        return { response: "Please choose 1-5 or type START.", nextStep: 'welcome' };
    }
  }

  getHelpMessage() {
    return `🆘 *HELP & COMMANDS* 🆘

*Available Commands:*
• MENU - Show main menu
• SAVE - Save progress and exit
• CONTINUE - Continue application
• PROGRESS - View progress
• EDIT - Edit a section
• HELP - Show this message
• EXIT - Cancel

*Support:* support@fundingsa.org.za
*Hours:* Mon-Fri, 8am-5pm

Type MENU to return.`;
  }

  // Personal Information Handlers
  handlePersonalID(input, session) {
    const validation = ValidationService.validateSAID(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter your 13-digit ID number:`,
        nextStep: 'personal_id'
      };
    }
    
    session.data.personalInfo = session.data.personalInfo || {};
    session.data.personalInfo.idNumber = validation.data.idNumber;
    session.data.personalInfo.dob = validation.data.dateOfBirth;
    
    return {
      response: `✅ ID verified. Age: ${validation.data.age} years.\n\nPlease enter your full name:`,
      nextStep: 'personal_name'
    };
  }

  handlePersonalName(input, session) {
    const validation = ValidationService.validateName(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter your full name:`,
        nextStep: 'personal_name'
      };
    }
    
    session.data.personalInfo.fullName = input.trim();
    
    if (session.data.personalInfo.dob) {
      return {
        response: `✅ Name recorded.\n\nDate of birth from ID: ${moment(session.data.personalInfo.dob).format('DD/MM/YYYY')}\n\nIs this correct? Type YES or enter correct date:`,
        nextStep: 'personal_dob_confirm'
      };
    }
    
    return {
      response: "✅ Name recorded.\n\nPlease enter your date of birth (DD/MM/YYYY):",
      nextStep: 'personal_dob'
    };
  }

  handlePersonalDOBConfirm(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'yes' || normalizedInput === 'y') {
      return {
        response: "✅ Date confirmed.\n\nPlease enter your phone number:",
        nextStep: 'personal_phone'
      };
    } else {
      return this.handlePersonalDOB(input, session);
    }
  }

  handlePersonalDOB(input, session) {
    const validation = ValidationService.validateDOB(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter date (DD/MM/YYYY):`,
        nextStep: 'personal_dob'
      };
    }
    
    session.data.personalInfo.dob = validation.data.dob;
    
    return {
      response: "✅ Date recorded.\n\nPlease enter your phone number:",
      nextStep: 'personal_phone'
    };
  }

  handlePersonalPhone(input, session) {
    const validation = ValidationService.validatePhone(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter your phone number:`,
        nextStep: 'personal_phone'
      };
    }
    
    session.data.personalInfo.phone = validation.data.formatted;
    
    return {
      response: "✅ Phone recorded.\n\nPlease enter your email address:",
      nextStep: 'personal_email'
    };
  }

  handlePersonalEmail(input, session) {
    const validation = ValidationService.validateEmail(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter your email:`,
        nextStep: 'personal_email'
      };
    }
    
    session.data.personalInfo.email = input.trim().toLowerCase();
    
    return {
      response: "✅ Personal information completed!\n\nLet's move to business information.",
      nextStep: 'business_menu'
    };
  }

  // Business Information
  handleBusinessMenu(input, session) {
    if (input.toLowerCase().trim() === 'start') {
      return {
        response: "Please enter your Business Name:",
        nextStep: 'business_name'
      };
    }
    return {
      response: "Please type START to begin business information.",
      nextStep: 'business_menu'
    };
  }

  handleBusinessName(input, session) {
    const validation = ValidationService.validateBusinessName(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter Business Name:`,
        nextStep: 'business_name'
      };
    }
    
    session.data.businessInfo = session.data.businessInfo || {};
    session.data.businessInfo.businessName = input.trim();
    
    return {
      response: "✅ Business name recorded.\n\nIs Trading Name different? Type YES or NO:",
      nextStep: 'business_trading'
    };
  }

  handleBusinessTrading(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'yes' || normalizedInput === 'y') {
      return {
        response: "Please enter your Trading Name:",
        nextStep: 'business_trading_name'
      };
    } else if (normalizedInput === 'no' || normalizedInput === 'n') {
      session.data.businessInfo.tradingName = session.data.businessInfo.businessName;
      return {
        response: this.getBusinessTypeOptions(),
        nextStep: 'business_type'
      };
    } else {
      return {
        response: "Please type YES or NO:",
        nextStep: 'business_trading'
      };
    }
  }

  handleBusinessTradingName(input, session) {
    const validation = ValidationService.validateBusinessName(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter Trading Name:`,
        nextStep: 'business_trading_name'
      };
    }
    
    session.data.businessInfo.tradingName = input.trim();
    
    return {
      response: this.getBusinessTypeOptions(),
      nextStep: 'business_type'
    };
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
    
    let message = "🏢 *BUSINESS TYPE*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number or name:";
    
    return message;
  }

  handleBusinessType(input, session) {
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
        response: `❌ ${validation.message}\n\nPlease select business type:`,
        nextStep: 'business_type'
      };
    }
    
    session.data.businessInfo.businessType = validation.data || input;
    
    return {
      response: "✅ Business type recorded.\n\nDo you have CIPC Registration Number? Enter it or type SKIP:",
      nextStep: 'business_cipc'
    };
  }

  handleBusinessCIPC(input, session) {
    const validation = ValidationService.validateCIPC(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}`,
        nextStep: 'business_cipc'
      };
    }
    
    session.data.businessInfo.cipcNumber = input.toLowerCase() === 'skip' ? 'Not Provided' : input.trim().toUpperCase();
    
    return {
      response: this.getIndustryOptions(),
      nextStep: 'business_industry'
    };
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
    
    let message = "🏭 *INDUSTRY*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number or name:";
    
    return message;
  }

  handleBusinessIndustry(input, session) {
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
        response: `❌ ${validation.message}\n\nPlease select industry:`,
        nextStep: 'business_industry'
      };
    }
    
    session.data.businessInfo.industry = validation.data || input;
    
    return {
      response: "✅ Industry recorded.\n\nPlease describe your business sub-sector:\n\nExample: Organic vegetable farming, Mobile app development, etc.",
      nextStep: 'business_sub_sector'
    };
  }

  handleBusinessSubSector(input, session) {
    if (!input || input.trim().length < 3) {
      return {
        response: "❌ Please provide a valid sub-sector (at least 3 characters).",
        nextStep: 'business_sub_sector'
      };
    }
    
    session.data.businessInfo.subSector = input.trim();
    
    return {
      response: "✅ Sub-sector recorded.\n\nPlease provide a business description:",
      nextStep: 'business_description'
    };
  }

  handleBusinessDescription(input, session) {
    const validation = ValidationService.validateTextField(input, 'Business description', 20, 500);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease provide description:`,
        nextStep: 'business_description'
      };
    }
    
    session.data.businessInfo.description = input.trim();
    
    return {
      response: "✅ Business information completed!\n\nLet's move to address information.",
      nextStep: 'address_menu'
    };
  }

  // Address Information
  handleAddressMenu(input, session) {
    if (input.toLowerCase().trim() === 'start') {
      return {
        response: "Please enter your Street Address:",
        nextStep: 'address_street'
      };
    }
    return {
      response: "Please type START to begin address information.",
      nextStep: 'address_menu'
    };
  }

  handleAddressStreet(input, session) {
    const validation = ValidationService.validateAddressField(input, 'Street address');
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter Street Address:`,
        nextStep: 'address_street'
      };
    }
    
    session.data.addressInfo = session.data.addressInfo || {};
    session.data.addressInfo.streetAddress = input.trim();
    
    return {
      response: "✅ Street address recorded.\n\nPlease enter your Township/Area:",
      nextStep: 'address_township'
    };
  }

  handleAddressTownship(input, session) {
    const validation = ValidationService.validateAddressField(input, 'Township');
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter Township:`,
        nextStep: 'address_township'
      };
    }
    
    session.data.addressInfo.township = input.trim();
    
    return {
      response: "✅ Township recorded.\n\nPlease enter your City:",
      nextStep: 'address_city'
    };
  }

  handleAddressCity(input, session) {
    const validation = ValidationService.validateAddressField(input, 'City');
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter City:`,
        nextStep: 'address_city'
      };
    }
    
    session.data.addressInfo.city = input.trim();
    
    return {
      response: "✅ City recorded.\n\nPlease enter your District/Municipality:",
      nextStep: 'address_district'
    };
  }

  handleAddressDistrict(input, session) {
    const validation = ValidationService.validateAddressField(input, 'District');
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter District:`,
        nextStep: 'address_district'
      };
    }
    
    session.data.addressInfo.district = input.trim();
    
    return {
      response: this.getProvinceOptions(),
      nextStep: 'address_province'
    };
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
    
    let message = "🗺️ *PROVINCE*\n\nPlease select:\n\n";
    provinces.forEach((prov, i) => message += `${i+1}. ${prov}\n`);
    message += "\nType the number or name:";
    
    return message;
  }

  handleAddressProvince(input, session) {
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
        response: `❌ ${validation.message}\n\nPlease select province:`,
        nextStep: 'address_province'
      };
    }
    
    session.data.addressInfo.province = validation.data || input;
    
    return {
      response: "✅ Province recorded.\n\nPlease enter your ZIP Code (4 digits):",
      nextStep: 'address_zip'
    };
  }

  handleAddressZip(input, session) {
    const validation = ValidationService.validateZipCode(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter ZIP code:`,
        nextStep: 'address_zip'
      };
    }
    
    session.data.addressInfo.zipCode = validation.data;
    
    return {
      response: "✅ Address information completed!\n\nLet's move to employment & revenue.",
      nextStep: 'employment_menu'
    };
  }

  // Employment & Revenue
  handleEmploymentMenu(input, session) {
    if (input.toLowerCase().trim() === 'start') {
      return {
        response: "How many total employees do you have?\n\nEnter number:",
        nextStep: 'employment_total'
      };
    }
    return {
      response: "Please type START to begin employment information.",
      nextStep: 'employment_menu'
    };
  }

  handleEmploymentTotal(input, session) {
    const validation = ValidationService.validateEmployeeCount(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter total employees:`,
        nextStep: 'employment_total'
      };
    }
    
    session.data.employmentRevenue = session.data.employmentRevenue || {};
    session.data.employmentRevenue.totalEmployees = validation.data;
    
    return {
      response: "✅ Total employees recorded.\n\nHow many are Full-Time?\n\nEnter number:",
      nextStep: 'employment_fulltime'
    };
  }

  handleEmploymentFullTime(input, session) {
    const validation = ValidationService.validateEmployeeCount(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter full-time count:`,
        nextStep: 'employment_fulltime'
      };
    }
    
    session.data.employmentRevenue.fullTimeCount = validation.data;
    
    return {
      response: "✅ Full-time recorded.\n\nHow many are Part-Time?\n\nEnter number:",
      nextStep: 'employment_parttime'
    };
  }

  handleEmploymentPartTime(input, session) {
    const validation = ValidationService.validateEmployeeCount(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter part-time count:`,
        nextStep: 'employment_parttime'
      };
    }
    
    session.data.employmentRevenue.partTimeCount = validation.data;
    
    return {
      response: "✅ Part-time recorded.\n\nHow many years in operation?\n\nEnter number:",
      nextStep: 'employment_years'
    };
  }

  handleEmploymentYears(input, session) {
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
  }

  getRevenueOptions() {
    const options = [
      "< R10,000",
      "R10,000 - R50,000",
      "R50,001 - R200,000",
      "> R200,000"
    ];
    
    let message = "💰 *MONTHLY REVENUE RANGE*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleEmploymentRevenue(input, session) {
    const options = [
      "< R10,000",
      "R10,000 - R50,000",
      "R50,001 - R200,000",
      "> R200,000"
    ];
    
    const validation = ValidationService.validateSelection(input, options);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease select revenue range:`,
        nextStep: 'employment_revenue'
      };
    }
    
    session.data.employmentRevenue.monthlyRevenueRange = validation.data || input;
    
    return {
      response: "✅ Employment & Revenue completed!\n\nLet's move to funding request.",
      nextStep: 'funding_menu'
    };
  }

  // Funding Request
  handleFundingMenu(input, session) {
    if (input.toLowerCase().trim() === 'start') {
      return {
        response: "How much funding are you requesting (in ZAR)?\n\nEnter amount:",
        nextStep: 'funding_amount'
      };
    }
    return {
      response: "Please type START to begin funding request.",
      nextStep: 'funding_menu'
    };
  }

  handleFundingAmount(input, session) {
    const validation = ValidationService.validateFundingAmount(input);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease enter funding amount:`,
        nextStep: 'funding_amount'
      };
    }
    
    session.data.fundingRequest = session.data.fundingRequest || {};
    session.data.fundingRequest.fundingAmount = validation.data;
    
    return {
      response: this.getFundingPurposeOptions(),
      nextStep: 'funding_purpose'
    };
  }

  getFundingPurposeOptions() {
    const options = [
      "Working Capital",
      "Equipment Purchase",
      "Expansion",
      "Debt Consolidation",
      "Other"
    ];
    
    let message = "🎯 *FUNDING PURPOSE*\n\nSelect multiple (comma-separated):\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nExample: 1,3 or type names:";
    
    return message;
  }

  handleFundingPurpose(input, session) {
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
        response: "Please specify 'Other' funding purpose:",
        nextStep: 'funding_other_purpose'
      };
    }
    
    return {
      response: this.getFundingTypeOptions(),
      nextStep: 'funding_type'
    };
  }

  handleFundingOtherPurpose(input, session) {
    if (!input || input.trim().length < 5) {
      return {
        response: "❌ Please provide a valid purpose (at least 5 characters).",
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
    
    let message = "📝 *PREFERRED FUNDING TYPE*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number or name:";
    
    return message;
  }

  handleFundingType(input, session) {
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
        response: "Can you demonstrate loan repayment ability?\n\nYES, NO, or UNSURE:",
        nextStep: 'funding_repayment'
      };
    }
    
    return {
      response: "✅ Funding type recorded.\n\nPlease provide funding justification:",
      nextStep: 'funding_justification'
    };
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
      response: "✅ Repayment ability recorded.\n\nPlease provide funding justification:",
      nextStep: 'funding_justification'
    };
  }

  handleFundingJustification(input, session) {
    const validation = ValidationService.validateTextField(input, 'Funding justification', 50, 1000);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease provide justification:`,
        nextStep: 'funding_justification'
      };
    }
    
    session.data.fundingRequest.justification = input.trim();
    
    return {
      response: "✅ Funding request completed!\n\nLet's move to readiness assessment.",
      nextStep: 'readiness_menu'
    };
  }

  // Readiness Assessment
  handleReadinessMenu(input, session) {
    if (input.toLowerCase().trim() === 'start') {
      return {
        response: this.getBusinessPlanOptions(),
        nextStep: 'readiness_business_plan'
      };
    }
    return {
      response: "Please type START to begin readiness assessment.",
      nextStep: 'readiness_menu'
    };
  }

  getBusinessPlanOptions() {
    const options = [
      "Yes - I have a written plan",
      "Yes - I have a basic plan (not written)",
      "No - I don't have one",
      "I need help creating one"
    ];
    
    let message = "📊 *BUSINESS PLAN STATUS*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessBusinessPlan(input, session) {
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
    
    session.data.readinessAssessment = session.data.readinessAssessment || {};
    session.data.readinessAssessment.businessPlanStatus = validation.data || input;
    
    return {
      response: this.getFinancialRecordsOptions(),
      nextStep: 'readiness_financial_records'
    };
  }

  getFinancialRecordsOptions() {
    const options = [
      "Yes - Detailed records (spreadsheets/software)",
      "Yes - Basic records (notebook/paper)",
      "No - I don't keep records",
      "I need help with this"
    ];
    
    let message = "📈 *FINANCIAL RECORDS*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessFinancialRecords(input, session) {
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
  }

  getBankStatementsOptions() {
    const options = [
      "Yes - I have them ready",
      "Yes - But in a personal account",
      "No - Don't have business banking",
      "No - Need to open business account"
    ];
    
    let message = "🏦 *BANK STATEMENTS*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessBankStatements(input, session) {
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
  }

  getTrainingOptions() {
    const options = [
      "Yes - Formal business training",
      "Yes - Some workshops/courses",
      "No - No formal training",
      "I want training opportunities"
    ];
    
    let message = "🎓 *BUSINESS TRAINING*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessTraining(input, session) {
    const options = [
      "Yes - Formal business training",
      "Yes - Some workshops/courses",
      "No - No formal training",
      "I want training opportunities"
    ];
    
    const validation = ValidationService.validateSelection(input, options);
    
    if (!validation.valid) {
      return {
        response: `❌ ${validation.message}\n\nPlease select training status:`,
        nextStep: 'readiness_training'
      };
    }
    
    session.data.readinessAssessment.businessTraining = validation.data || input;
    
    return {
      response: this.getCooperativeOptions(),
      nextStep: 'readiness_cooperative'
    };
  }

  getCooperativeOptions() {
    const options = [
      "Yes - Already a member",
      "Yes - Want to join one",
      "Yes - Want to form one",
      "No - Prefer to work alone",
      "Not sure what it is"
    ];
    
    let message = "🤝 *COOPERATIVE INTEREST*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nType the number:";
    
    return message;
  }

  handleReadinessCooperative(input, session) {
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
  }

  getSelfAssessmentOptions() {
    const options = [
      "1 - Just starting (need lots of help)",
      "2 - Early stage",
      "3 - Developing",
      "4 - Almost ready",
      "5 - Fully ready (professional operation)"
    ];
    
    let message = "📊 *SELF-ASSESSMENT READINESS*\n\nPlease select:\n\n";
    options.forEach((opt, i) => message += `${opt}\n`);
    message += "\nType the number (1-5):";
    
    return message;
  }

  handleReadinessSelfAssessment(input, session) {
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
        response: `❌ ${validation.message}\n\nPlease select readiness level:`,
        nextStep: 'readiness_self_assessment'
      };
    }
    
    session.data.readinessAssessment.selfAssessmentReadiness = validation.data ? validation.data.split(' - ')[0] : input;
    
    return {
      response: this.getSupportNeedsOptions(),
      nextStep: 'readiness_support_needs'
    };
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
    
    let message = "🤝 *SUPPORT NEEDS*\n\nSelect multiple (comma-separated):\n\n";
    options.forEach((opt, i) => message += `${i+1}. ${opt}\n`);
    message += "\nExample: 1,3,5 or type names:";
    
    return message;
  }

  handleReadinessSupportNeeds(input, session) {
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
      response: "✅ Readiness assessment completed!\n\nLet's review your application.",
      nextStep: 'review_summary'
    };
  }

  // Review and Submit
  getApplicationSummary(data) {
    let summary = "📋 *APPLICATION SUMMARY*\n\nPlease review:\n\n";
    
    summary += "👤 *PERSONAL INFORMATION*\n";
    if (data.personalInfo) {
      summary += `• ID: ${data.personalInfo.idNumber || 'Not provided'}\n`;
      summary += `• Name: ${data.personalInfo.fullName || 'Not provided'}\n`;
      summary += `• DOB: ${data.personalInfo.dob ? moment(data.personalInfo.dob).format('DD/MM/YYYY') : 'Not provided'}\n`;
      summary += `• Phone: ${data.personalInfo.phone || 'Not provided'}\n`;
      summary += `• Email: ${data.personalInfo.email || 'Not provided'}\n`;
    }
    
    summary += "\n🏢 *BUSINESS INFORMATION*\n";
    if (data.businessInfo) {
      summary += `• Business: ${data.businessInfo.businessName || 'Not provided'}\n`;
      summary += `• Trading: ${data.businessInfo.tradingName || 'Not provided'}\n`;
      summary += `• Type: ${data.businessInfo.businessType || 'Not provided'}\n`;
      summary += `• Industry: ${data.businessInfo.industry || 'Not provided'}\n`;
    }
    
    summary += "\n📍 *ADDRESS*\n";
    if (data.addressInfo) {
      summary += `• Address: ${data.addressInfo.streetAddress || 'Not provided'}\n`;
      summary += `• City: ${data.addressInfo.city || 'Not provided'}\n`;
      summary += `• Province: ${data.addressInfo.province || 'Not provided'}\n`;
    }
    
    summary += "\n💰 *FUNDING REQUEST*\n";
    if (data.fundingRequest) {
      summary += `• Amount: R${data.fundingRequest.fundingAmount?.toLocaleString() || 'Not provided'}\n`;
      summary += `• Type: ${data.fundingRequest.preferredFundingType || 'Not provided'}\n`;
    }
    
    summary += "\n---\nType *CONFIRM* to submit, *EDIT* to make changes, or *SAVE* to continue later.";
    
    return summary;
  }

  handleReviewSummary(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'confirm') {
      return {
        response: "Are you sure you want to submit?\n\nType SUBMIT to confirm or BACK to review.",
        nextStep: 'confirm_submission'
      };
    } else if (normalizedInput === 'edit') {
      return {
        response: "Which section to edit?",
        nextStep: 'edit_menu'
      };
    } else if (normalizedInput === 'save') {
      return {
        response: "Save progress and continue later?",
        nextStep: 'save_confirm'
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
      session.data.completed = true;
      session.data.status = 'Submitted';
      session.data.submittedAt = new Date().toISOString();
      
      return {
        response: `✅ *APPLICATION SUBMITTED!* ✅\n\nThank you! Your application has been received.\n\n📧 Confirmation email will be sent.\n📱 WhatsApp updates will follow.\n⏳ Processing: 7-14 business days.\n\nReference: ${session.id?.substring(0, 8).toUpperCase() || 'N/A'}\n\nSupport: support@fundingsa.org.za\n\nType MENU for new application.`,
        nextStep: null,
        shouldSave: true,
        isComplete: true
      };
    } else {
      return {
        response: this.getApplicationSummary(session.data),
        nextStep: 'review_summary'
      };
    }
  }

  handleSaveConfirm(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    if (normalizedInput === 'save') {
      return {
        response: "✅ Progress saved! You can continue later by messaging us.\n\nSave code: " + (session.id?.substring(0, 8).toUpperCase() || 'N/A') + "\n\nType CONTINUE anytime to resume.",
        nextStep: null,
        shouldSave: true
      };
    } else {
      return {
        response: "Continuing...",
        nextStep: session.step
      };
    }
  }

  getEditMenu(data) {
    return "✏️ *EDIT INFORMATION*\n\nWhich section?\n\n1. Personal Information\n2. Business Information\n3. Address Information\n4. Employment & Revenue\n5. Funding Request\n6. Readiness Assessment\n7. Back to Menu\n\nType the number:";
  }

  handleEditMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    switch(normalizedInput) {
      case '1':
        return { response: "Editing Personal Information. Enter ID:", nextStep: 'personal_id' };
      case '2':
        return { response: "Editing Business Information. Enter Business Name:", nextStep: 'business_name' };
      case '3':
        return { response: "Editing Address Information. Enter Street Address:", nextStep: 'address_street' };
      case '4':
        return { response: "Editing Employment & Revenue. Enter total employees:", nextStep: 'employment_total' };
      case '5':
        return { response: "Editing Funding Request. Enter funding amount:", nextStep: 'funding_amount' };
      case '6':
        return { response: "Editing Readiness Assessment.", nextStep: 'readiness_business_plan' };
      case '7':
        return { response: "Returning to menu...", nextStep: 'welcome' };
      default:
        return { response: "Please select 1-7.", nextStep: 'edit_menu' };
    }
  }

  handleContinueMenu(input, session) {
    const normalizedInput = input.toLowerCase().trim();
    
    switch(normalizedInput) {
      case 'personal':
        return { response: "Continuing Personal Information.", nextStep: 'personal_id' };
      case 'business':
        return { response: "Continuing Business Information.", nextStep: 'business_name' };
      case 'address':
        return { response: "Continuing Address Information.", nextStep: 'address_street' };
      case 'employment':
        return { response: "Continuing Employment & Revenue.", nextStep: 'employment_total' };
      case 'funding':
        return { response: "Continuing Funding Request.", nextStep: 'funding_amount' };
      case 'readiness':
        return { response: "Continuing Readiness Assessment.", nextStep: 'readiness_business_plan' };
      case 'review':
        return { response: "Reviewing application.", nextStep: 'review_summary' };
      default:
        return { response: "Please specify section to continue.", nextStep: 'continue_menu' };
    }
  }
}

module.exports = new QuestionFlows();