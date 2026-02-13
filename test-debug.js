process.env.DEBUG = 'true';

const sessionManager = require('./session-manager');
const whatsappHandler = require('./whatsapp-handler');
const questionFlows = require('./question-flows');

async function debugTest() {
  console.log('\n🔧 === DEBUG TEST ===\n');
  
  const phone = '27831234567';
  let sessionId = null;
  
  try {
    // Step 1: Clear any existing session
    console.log('Step 1: Clearing existing sessions...');
    for (const [sid, s] of sessionManager.sessions.entries()) {
      if (s.phoneNumber === phone) {
        sessionManager.deleteSession(sid);
        console.log(`   ✓ Deleted session: ${sid.substring(0, 8)}...`);
      }
    }
    
    // Step 2: Create new session
    console.log('\nStep 2: Creating new session...');
    sessionId = await sessionManager.getOrCreateSession(phone);
    const session = sessionManager.getSession(sessionId);
    console.log(`   ✓ Session created: ${sessionId.substring(0, 8)}...`);
    console.log(`   • Step: ${session.step}`);
    console.log(`   • Consent: ${session.data.consentGiven}`);
    
    // Step 3: Send start command
    console.log('\nStep 3: Sending START command...');
    await whatsappHandler.handleMessage(phone, 'start');
    console.log('   ✓ START sent');
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 4: Check session after start
    const sessionAfterStart = sessionManager.getSession(sessionId);
    console.log(`   • Step after START: ${sessionAfterStart.step}`);
    
    // Step 5: Send agree
    console.log('\nStep 4: Sending AGREE...');
    await whatsappHandler.handleMessage(phone, 'agree');
    console.log('   ✓ AGREE sent');
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 6: Check session after consent
    const sessionAfterConsent = sessionManager.getSession(sessionId);
    console.log(`   • Step after AGREE: ${sessionAfterConsent.step}`);
    console.log(`   • Consent given: ${sessionAfterConsent.data.consentGiven}`);
    
    // Step 7: Send ID
    console.log('\nStep 5: Sending ID number...');
    await whatsappHandler.handleMessage(phone, '9001010001088');
    console.log('   ✓ ID sent');
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 8: Final state
    const finalSession = sessionManager.getSession(sessionId);
    console.log('\n📊 Final Session State:');
    console.log(`   • Step: ${finalSession.step}`);
    console.log(`   • Personal Info:`, finalSession.data.personalInfo);
    console.log(`   • Business Info:`, finalSession.data.businessInfo);
    
    console.log('\n✅ Debug test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error);
    console.error('   Stack:', error.stack);
  }
}

debugTest();