const sessionManager = require('./session-manager');
const whatsappHandler = require('./whatsapp-handler');

async function testFlow() {
  console.log('\n=== TESTING WHATSAPP BOT FLOW ===\n');
  
  const testNumber = '27831234567';
  
  // Clear any existing session
  for (const [sessionId, session] of sessionManager.sessions.entries()) {
    if (session.phoneNumber === testNumber) {
      sessionManager.deleteSession(sessionId);
      console.log('✓ Cleared existing session\n');
    }
  }
  
  // Test 1: Greeting
  console.log('Test 1: Sending "hi"');
  await whatsappHandler.handleMessage(testNumber, 'hi');
  console.log('✓ Sent greeting\n');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Start application
  console.log('Test 2: Sending "start"');
  await whatsappHandler.handleMessage(testNumber, 'start');
  console.log('✓ Sent start command\n');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Consent
  console.log('Test 3: Sending "agree"');
  await whatsappHandler.handleMessage(testNumber, 'agree');
  console.log('✓ Sent consent\n');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check session state
  const sessionId = await sessionManager.getOrCreateSession(testNumber);
  const session = sessionManager.getSession(sessionId);
  
  console.log('\n=== SESSION STATE ===');
  console.log(`Session ID: ${sessionId}`);
  console.log(`Step: ${session?.step}`);
  console.log(`Consent: ${session?.data?.consentGiven}`);
  console.log(`Personal Info: ${JSON.stringify(session?.data?.personalInfo)}\n`);
  
  console.log('✅ Test complete!\n');
}

testFlow().catch(console.error);