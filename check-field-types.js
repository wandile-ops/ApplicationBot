require('dotenv').config();
const Airtable = require('airtable');

async function checkFieldTypes() {
  console.log('🔍 Checking Airtable field types...\n');
  
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID);
  
  try {
    // Get one record to see field types
    const records = await base('Applicants').select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      console.log('No records found. Create a test record first.');
      return;
    }
    
    const fields = records[0].fields;
    
    console.log('📋 Field Analysis:');
    console.log('==================\n');
    
    Object.keys(fields).forEach(fieldName => {
      const value = fields[fieldName];
      let type = typeof value;
      
      if (Array.isArray(value)) {
        type = 'Multiple Select (Array)';
      } else if (typeof value === 'string') {
        type = 'Single Select or Text';
      } else if (typeof value === 'number') {
        type = 'Number';
      } else if (typeof value === 'boolean') {
        type = 'Checkbox';
      } else if (value instanceof Date) {
        type = 'Date';
      }
      
      console.log(`${fieldName}:`);
      console.log(`   Type: ${type}`);
      console.log(`   Sample: ${JSON.stringify(value)}`);
      console.log('');
    });
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFieldTypes();