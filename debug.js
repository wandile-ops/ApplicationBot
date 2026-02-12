require('dotenv').config();
const sessionManager = require('./session-manager');
const questionFlows = require('./question-flows');
const airtableService = require('./airtable');

async function debug() {
  console.log('\n=== DEBUGGING WHATSAPP FUNDING BOT ===\n');
  
  // Test 1: Check environment variables
  console.log('1️⃣ Environment Variables:');
  console.log(`   • WHATSAPP_TOKEN: ${process.env.WHATSAPP_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`   • WHATSAPP_PHONE_ID: ${process.env.WHATSAPP_PHONE_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`   • AIRTABLE_API_KEY: ${process.env.AIRTABLE_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   • AIRTABLE_BASE_ID: ${process.env.AIRTABLE_BASE_ID ? '✓ Set' : '✗ Missing'}\n`);
  
  // Test 2: Airtable connection
  console.log('2️⃣ Testing Airtable Connection:');
  const airtableTest = await airtableService.testConnection();
  console.log(`   • Connected: ${airtableTest.connected ? '✓' : '✗'}`);
  if (airtableTest.error) {
    console.log(`   • Error: ${airtableTest.error}`);
  }
  console.log(`   • Table: ${airtableTest.tableName}`);
  console.log(`   • Has Records: ${airtableTest.hasRecords ? '✓' : '✗'}\n`);
  
  // Test 3: Session Manager
  console.log('3️⃣ Testing Session Manager:');
  console.log(`   • Initial Sessions: ${sessionManager.sessions.size}`);
  
  const phone = '27831234567';
  const sessionId = await sessionManager.getOrCreateSession(phone);
  console.log(`   • Created Session: ${sessionId}`);
  
  const session = sessionManager.getSession(sessionId);
  console.log(`   • Session Step: ${session?.step}`);
  console.log(`   • Consent Given: ${session?.data?.consentGiven ? '✓' : '✗'}\n`);
  
  // Test 4: Question Flows
  console.log('4️⃣ Testing Question Flows:');
  console.log(`   • Consent Message Length: ${questionFlows.getConsentMessage().length} chars`);
  console.log(`   • Welcome Menu Length: ${questionFlows.getWelcomeMenu(session).length} chars`);
  
  const progress = questionFlows.calculateProgress(session.data);
  console.log(`   • Initial Progress: ${progress}%\n`);
  
  // Test 5: Validation
  console.log('5️⃣ Testing Validation:');
  const testID = '9001010001088';
  const validID = require('./validation').validateSAID(testID);
  console.log(`   • SA ID Validation: ${validID.valid ? '✓' : '✗'} ${validID.message}`);
  
  const testEmail = 'test@example.com';
  const validEmail = require('./validation').validateEmail(testEmail);
  console.log(`   • Email Validation: ${validEmail.valid ? '✓' : '✗'}\n`);
  
  // Test 6: Session Stats
  console.log('6️⃣ Current Sessions:');
  const stats = sessionManager.getStats();
  console.log(`   • Total Active Sessions: ${stats.totalSessions}`);
  
  if (stats.sessions.length > 0) {
    console.log('\n   Active Sessions:');
    stats.sessions.forEach(s => {
      console.log(`     - ${s.id.substring(0, 8)}... | Phone: ${s.phoneNumber} | Step: ${s.step} | Last: ${s.lastActivity.substring(11, 19)}`);
    });
  }
  
  // Cleanup
  sessionManager.deleteSession(sessionId);
  console.log(`\n   • Cleaned up test session\n`);
  
  console.log('✅ Debug Complete!\n');
}

debug().catch(console.error);