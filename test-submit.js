require('dotenv').config();
const sessionManager = require('./session-manager');
const airtableService = require('./airtable');
const { v4: uuidv4 } = require('uuid');

async function testSubmitApplicant() {
  console.log('📝 TEST SUBMISSION - Sending test applicant to Airtable\n');
  
  // Generate unique test data
  const testSessionId = uuidv4();
  const testPhone = '27761234567'; // Test phone number
  
  // Create comprehensive test data with proper formatting for multiple select fields
  const testData = {
    phoneNumber: testPhone,
    sessionId: testSessionId,
    consentGiven: true,
    consentTimestamp: new Date().toISOString(),
    status: 'Submitted',
    completed: true,
    
    personalInfo: {
      idNumber: '9001010001088',
      fullName: 'Test Applicant',
      dob: '1990-01-01',
      phone: '+27761234567',
      email: 'test.applicant@example.com'
    },
    
    businessInfo: {
      businessName: 'Test Business (Pty) Ltd',
      tradingName: 'Test Trading',
      businessType: 'Private Company', // Single select
      cipcNumber: 'CK2024/123456/07',
      industry: 'Technology', // Single select
      subSector: 'Software Development',
      description: 'A test business for development purposes'
    },
    
    addressInfo: {
      streetAddress: '123 Test Street',
      township: 'Test Township',
      city: 'Johannesburg',
      district: 'Johannesburg Metro',
      province: 'Gauteng', // Single select
      zipCode: '2000'
    },
    
    employmentRevenue: {
      totalEmployees: 5,
      fullTimeCount: 3,
      partTimeCount: 2,
      yearsInOperation: 2,
      monthlyRevenueRange: 'R10,000 - R50,000' // Single select
    },
    
    fundingRequest: {
      fundingAmount: 50000,
      fundingPurpose: ['Working Capital', 'Equipment Purchase'], // Array for multiple select
      otherPurposeDetails: '',
      preferredFundingType: 'Loan', // Single select
      loanRepaymentAbility: 'YES', // Single select
      justification: 'Need funding for new equipment to expand production capacity'
    },
    
    readinessAssessment: {
      businessPlanStatus: 'Yes - I have a written plan', // Single select
      financialRecords: 'Yes - Detailed records (spreadsheets/software)', // Single select
      bankStatements: 'Yes - I have them ready', // Single select
      businessTraining: 'Yes - Formal business training', // Single select
      cooperativeInterest: 'No - Prefer to work alone', // Single select
      selfAssessmentReadiness: '4', // Single select (number)
      supportNeeds: ['Funding/Grants', 'Mentorship', 'Marketing help'] // Array for multiple select
    }
  };
  
  console.log('Test Data Prepared:');
  console.log(`   Session ID: ${testSessionId}`);
  console.log(`   Name: ${testData.personalInfo.fullName}`);
  console.log(`   Business: ${testData.businessInfo.businessName}`);
  console.log(`   Amount: R${testData.fundingRequest.fundingAmount}`);
  console.log(`   Funding Purpose: ${testData.fundingRequest.fundingPurpose.join(', ')}`);
  console.log(`   Support Needs: ${testData.readinessAssessment.supportNeeds.join(', ')}\n`);
  
  try {
    // Method 1: Direct Airtable create
    console.log('📤 Attempting to create record in Airtable...');
    
    const recordId = await airtableService.createApplication(testData);
    
    console.log(`✅ SUCCESS! Record created with ID: ${recordId}\n`);
    
    // Method 2: Verify by retrieving it
    console.log('📥 Verifying by retrieving the record...');
    const retrieved = await airtableService.getApplication(testSessionId);
    
    if (retrieved) {
      console.log('✅ Record retrieved successfully!');
      console.log('   Retrieved Data:');
      console.log(`   • Name: ${retrieved.personalInfo?.fullName}`);
      console.log(`   • Business: ${retrieved.businessInfo?.businessName}`);
      console.log(`   • Email: ${retrieved.personalInfo?.email}`);
      console.log(`   • Status: ${retrieved.status}`);
      console.log(`   • Funding Purpose: ${retrieved.fundingRequest?.fundingPurpose?.join(', ')}`);
      console.log(`   • Support Needs: ${retrieved.readinessAssessment?.supportNeeds?.join(', ')}`);
    } else {
      console.log('❌ Could not retrieve the record');
    }
    
    console.log('\n📊 Check your Airtable base to verify!');
    console.log(`   Session ID to search for: ${testSessionId}`);
    console.log(`   Direct link: https://airtable.com/${process.env.AIRTABLE_BASE_ID}/tbl...`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   Error: ${error.message}`);
    
    if (error.error) {
      console.error(`   Type: ${error.error}`);
    }
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    
    // Detailed error information
    if (error.message.includes('Funding Purpose')) {
      console.error('\n🔧 Issue with Funding Purpose field:');
      console.error('   This field is likely a Single Select but we\'re sending multiple values');
      console.error('   Check your Airtable schema:');
      console.error('   • Is "Funding Purpose" a Single Select or Multiple Select?');
      console.error('   • If Single Select, only send one value');
      console.error('   • If Multiple Select, send as array like we did');
    }
    
    if (error.message.includes('Support Needs')) {
      console.error('\n🔧 Issue with Support Needs field:');
      console.error('   Check if this is properly configured as Multiple Select in Airtable');
    }
    
    // Helpful troubleshooting
    console.error('\n🔧 Quick Check:');
    console.error('   1. Run "node test-airtable.js" to see your actual field types');
    console.error('   2. Verify in Airtable if fields are Single or Multiple Select');
    console.error('   3. Make sure all Single Select values exactly match your Airtable options');
  }
}

testSubmitApplicant();