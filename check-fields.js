// check-fields.js
require('dotenv').config();
const Airtable = require('airtable');

async function checkFields() {
  console.log('🔍 Checking all fields in your Airtable table...\n');
  
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID);
  
  try {
    const records = await base('Applicants').select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      console.log('No records found. Creating a test record to see fields...');
      
      // Create a minimal test record
      const testId = `test-${Date.now()}`;
      const newRecord = await base('Applicants').create([
        {
          fields: {
            "South African ID": "9001010001088",
            "Full Name": "Field Test",
            "Session ID": testId
          }
        }
      ]);
      
      const fields = Object.keys(newRecord[0].fields);
      console.log('\n📋 Fields in your table (from new record):');
      fields.forEach(field => {
        console.log(`   • "${field}"`);
      });
      
      // Clean up
      await base('Applicants').destroy([newRecord[0].getId()]);
      
    } else {
      const fields = Object.keys(records[0].fields);
      console.log('📋 Fields in your table:');
      fields.forEach(field => {
        console.log(`   • "${field}"`);
      });
    }
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFields();