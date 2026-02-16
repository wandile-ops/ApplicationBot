require('dotenv').config();
const Airtable = require('airtable');
const { v4: uuidv4 } = require('uuid');

async function testSubmitFinal() {
  console.log('📝 FINAL TEST - Submitting test applicant with Session ID\n');
  
  // Generate unique test data
  const testSessionId = uuidv4();
  const testPhone = '27761234567';
  
  // Initialize Airtable directly for testing
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID);
  
  // Create test data matching your EXACT schema with correct option values
  const testData = {
    // Personal Information
    "South African ID": "9001010001088",
    "Full Name": "Test Applicant",
    "Date of Birth": "1990-01-01",
    "Phone Number": "+27761234567",
    "Email Address": "test.applicant@example.com",
    
    // Business Information
    "Business Name": "Test Business (Pty) Ltd",
    "Trading Name": "Test Trading",
    "Business Type": "Private Company",
    "CIPC Registration Number": "CK2024/123456/07",
    "Industry": "Technology",
    "Sub-Sector": "Software Development",
    "Business Description": "A test business for development purposes",
    "Years in Operation": 2,
    
    // Address Information
    "Street Address": "123 Test Street",
    "Township": "Test Township",
    "City": "Johannesburg",
    "District": "Johannesburg Metro",
    "Zip Code": "2000",
    "Province": "Gauteng",
    
    // Employee Information
    "Total Employees": 5,
    "Full-Time Count": 3,
    "Part-Time Count": 2,
    
    // Financial Information
    "Monthly Revenue Range": "R10,000 - R50,000",
    
    // Funding Details
    "Funding Amount ZAR": 50000,
    "Funding Purpose": ["Working Capital", "Equipment Purchase"],
    "Other Purpose Details": "",
    "Preferred Funding Type": "Loan",
    "Loan Repayment Ability": "Yes",
    "Funding Justification": "Need funding for new equipment to expand production capacity",
    
    // Readiness Assessment
    "Business Plan Status": "Yes - I have a written plan",
    "Financial Records": "Yes - Detailed records (spreadsheets/software)",
    "Bank Statements": "Yes - I have them ready",
    "Business Training": "Yes - Formal business training",
    "Cooperative Interest": "No - Prefer to work alone",
    "Self-Assessment Readiness": "4 - Almost ready",
    "Support Needs": ["Funding/Grants", "Mentorship", "Marketing help"],
    
    // Metadata - Using correct Status value
    "Session ID": testSessionId,
    "Status": "Submitted",  // Changed from "Test Submission" to "Submitted"
    "Submission Date": new Date().toISOString().split('T')[0],
    "Applicant UUID": testSessionId
  };
  
  console.log('Test Data Summary:');
  console.log(`   Session ID: ${testSessionId}`);
  console.log(`   Name: ${testData["Full Name"]}`);
  console.log(`   Phone: ${testData["Phone Number"]}`);
  console.log(`   Business: ${testData["Business Name"]}`);
  console.log(`   Amount: R${testData["Funding Amount ZAR"]}`);
  console.log(`   Status: ${testData["Status"]}`);
  console.log(`   Loan Repayment: ${testData["Loan Repayment Ability"]}`);
  console.log(`   Self-Assessment: ${testData["Self-Assessment Readiness"]}`);
  console.log(`   Submission Date: ${testData["Submission Date"]}`);
  console.log(`   Funding Purpose: ${testData["Funding Purpose"].join(', ')}`);
  console.log(`   Support Needs: ${testData["Support Needs"].join(', ')}`);
  console.log('');
  
  try {
    // Step 1: Check if Session ID already exists
    console.log('🔍 Checking for existing Session ID...');
    const existing = await base('Applicants').select({
      filterByFormula: `{Session ID} = '${testSessionId}'`,
      maxRecords: 1
    }).firstPage();
    
    if (existing.length > 0) {
      console.log('   ⚠️ Session ID already exists, will update instead of create');
      
      // Update existing record
      await base('Applicants').update([
        {
          id: existing[0].id,
          fields: testData
        }
      ]);
      console.log('   ✅ Record updated successfully');
    } else {
      console.log('   ✅ Session ID is unique');
      
      // Create the record
      console.log('\n📤 Creating record in Airtable...');
      const records = await base('Applicants').create([
        { fields: testData }
      ]);
      
      console.log(`✅ SUCCESS! Record created with ID: ${records[0].getId()}`);
      console.log(`   🔗 View record: https://airtable.com/${process.env.AIRTABLE_BASE_ID}/${records[0].getId()}`);
    }
    
    // Step 2: Verify by retrieving it
    console.log('\n📥 Verifying by retrieving the record...');
    const retrieved = await base('Applicants').select({
      filterByFormula: `{Session ID} = '${testSessionId}'`,
      maxRecords: 1
    }).firstPage();
    
    if (retrieved.length > 0) {
      console.log('✅ Record retrieved successfully!');
      console.log('\n📊 Retrieved Data:');
      console.log(`   • Record ID: ${retrieved[0].id}`);
      console.log(`   • Session ID: ${retrieved[0].fields["Session ID"]}`);
      console.log(`   • Name: ${retrieved[0].fields["Full Name"]}`);
      console.log(`   • Phone: ${retrieved[0].fields["Phone Number"]}`);
      console.log(`   • Business: ${retrieved[0].fields["Business Name"]}`);
      console.log(`   • Status: ${retrieved[0].fields["Status"]}`);
      console.log(`   • Loan Repayment: ${retrieved[0].fields["Loan Repayment Ability"]}`);
      console.log(`   • Self-Assessment: ${retrieved[0].fields["Self-Assessment Readiness"]}`);
      console.log(`   • Submission Date: ${retrieved[0].fields["Submission Date"]}`);
      console.log(`   • Funding Purpose: ${JSON.stringify(retrieved[0].fields["Funding Purpose"])}`);
      console.log(`   • Support Needs: ${JSON.stringify(retrieved[0].fields["Support Needs"])}`);
      
      // Check if AI fields were auto-generated
      if (retrieved[0].fields["Funding Justification Summary (AI)"]) {
        console.log(`   • AI Summary: ${retrieved[0].fields["Funding Justification Summary (AI)"].substring(0, 50)}...`);
      }
      if (retrieved[0].fields["Funding Purpose Category (AI)"]) {
        console.log(`   • AI Category: ${retrieved[0].fields["Funding Purpose Category (AI)"]}`);
      }
    }
    
    console.log('\n🎉 TEST PASSED! Check your Airtable base:');
    console.log(`   https://airtable.com/${process.env.AIRTABLE_BASE_ID}`);
    console.log(`   Search for Session ID: ${testSessionId}`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   Error: ${error.message}`);
    
    if (error.error) {
      console.error(`   Type: ${error.error}`);
    }
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    
    // Helpful troubleshooting
    if (error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
      console.error('\n🔧 Single Select Field Error:');
      console.error('   The value you provided is not a valid option in Airtable.');
      console.error('   For Status field, common options are:');
      console.error('   • "Draft"');
      console.error('   • "In Progress"');
      console.error('   • "Submitted"');
      console.error('   • "Approved"');
      console.error('   • "Rejected"');
      console.error('   • "Under Review"');
    }
  }
}

// Run the test
testSubmitFinal();