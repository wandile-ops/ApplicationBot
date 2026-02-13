const sessionManager = require('./session-manager');
const whatsappHandler = require('./whatsapp-handler');
const questionFlows = require('./question-flows');

async function testFlow() {
  console.log('\n=== TESTING WHATSAPP BOT FLOW ===\n');
  
  const testNumber = '27831234567';
  
  try {
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
    
    // Test 4: Should now be at personal_id
    console.log('Test 4: Current state after consent');
    const sessionId = await sessionManager.getOrCreateSession(testNumber);
    const session = sessionManager.getSession(sessionId);
    
    console.log('\n=== SESSION STATE ===');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Step: ${session?.step}`);
    console.log(`Consent: ${session?.data?.consentGiven}`);
    console.log(`Personal Info: ${JSON.stringify(session?.data?.personalInfo)}\n`);
    
    // Test 5: Send ID number
    console.log('Test 5: Sending test ID number');
    await whatsappHandler.handleMessage(testNumber, '9001010001088');
    console.log('✓ Sent ID number\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check updated state
    const updatedSession = sessionManager.getSession(sessionId);
    console.log('=== UPDATED SESSION STATE ===');
    console.log(`Step: ${updatedSession?.step}`);
    console.log(`Personal Info: ${JSON.stringify(updatedSession?.data?.personalInfo)}\n`);
    
    console.log('✅ Test complete!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testFlow().catch(console.error);