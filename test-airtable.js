require('dotenv').config();
const Airtable = require('airtable');

async function testAirtableConnection() {
  console.log('🔍 Testing Airtable Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   API Key: ${process.env.AIRTABLE_API_KEY ? '✓ Present' : '✗ Missing'}`);
  console.log(`   Base ID: ${process.env.AIRTABLE_BASE_ID ? '✓ Present' : '✗ Missing'}`);
  console.log('');
  
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  try {
    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID);
    
    // Test 1: Try to access the base
    console.log('📡 Testing base access...');
    const tables = await base('Applicants').select({
      maxRecords: 1
    }).firstPage();
    
    console.log('   ✅ Successfully connected to base');
    console.log(`   📊 Table "Applicants" exists with ${tables.length} records found\n`);
    
    // Test 2: Check field names and types
    if (tables.length > 0) {
      console.log('📋 Available fields in your table:');
      const fields = Object.keys(tables[0].fields);
      fields.forEach(field => {
        console.log(`   • "${field}"`);
      });
      
      // Check for potential session ID fields
      console.log('\n🔍 Looking for session identifier fields:');
      const possibleSessionFields = fields.filter(f => 
        f.toLowerCase().includes('session') || 
        f.toLowerCase().includes('uuid') || 
        f.toLowerCase().includes('id') && !f.toLowerCase().includes('record')
      );
      
      if (possibleSessionFields.length > 0) {
        console.log('   Found possible session fields:');
        possibleSessionFields.forEach(field => {
          console.log(`   • "${field}" - Value: ${tables[0].fields[field]}`);
        });
      } else {
        console.log('   ⚠️  No session identifier field found!');
        console.log('   You need to add either:');
        console.log('   • "Session ID" (Single line text)');
        console.log('   • Or use existing "Applicant UUID" field');
      }
      
      // Check for multiple select fields
      console.log('\n📋 Multiple Select Fields (need arrays):');
      const multipleSelectFields = ['Funding Purpose', 'Support Needs'];
      multipleSelectFields.forEach(field => {
        if (fields.includes(field)) {
          const value = tables[0].fields[field];
          console.log(`   • "${field}" - Current value type: ${Array.isArray(value) ? 'Array ✓' : typeof value}`);
        } else {
          console.log(`   • "${field}" - Not found in table`);
        }
      });
      
    } else {
      console.log('📋 Table is empty, but connection works');
    }
    
    console.log('\n✅ Connection test PASSED!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Based on your fields, use "Applicant UUID" as your session identifier');
    console.log('   2. Update your code to use "{Applicant UUID}" instead of "{Session ID}"');
    console.log('   3. Make sure multiple select fields (Funding Purpose, Support Needs) are sent as arrays');
    
  } catch (error) {
    console.error('\n❌ Connection test FAILED:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND')) {
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Check if your Base ID is correct');
      console.error('   2. Verify your API key has access to this base');
      console.error('   3. Make sure you\'re a collaborator on the base');
      console.error('   4. Check if the table name is exactly "Applicants"');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Your API key might be invalid');
      console.error('   2. Generate a new API key at https://airtable.com/account');
    }
  }
}

testAirtableConnection();