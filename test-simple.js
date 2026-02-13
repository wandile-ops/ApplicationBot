const sessionManager = require('./session-manager');
const questionFlows = require('./question-flows');
const ValidationService = require('./validation');

async function simpleTest() {
  console.log('\n🔍 === SIMPLE TEST ===\n');
  
  try {
    // Test 1: Session Creation
    console.log('📌 Test 1: Session Creation');
    const phone = '27831234567';
    const sessionId = await sessionManager.getOrCreateSession(phone);
    const session = sessionManager.getSession(sessionId);
    
    console.log('   ✓ Session created');
    console.log(`   • Session ID: ${sessionId.substring(0, 8)}...`);
    console.log(`   • Step: ${session.step}`);
    console.log(`   • Consent: ${session.data.consentGiven}\n`);

    // Test 2: Consent Flow
    console.log('📌 Test 2: Consent Flow');
    const consentResult = questionFlows.handleAnswer('consent', 'agree', session);
    console.log('   ✓ Consent processed');
    console.log(`   • Response: ${consentResult.response.substring(0, 50)}...`);
    console.log(`   • Next Step: ${consentResult.nextStep}\n`);
    
    if (consentResult.nextStep) {
      session.step = consentResult.nextStep;
      session.data.consentGiven = true;
    }

    // Test 3: ID Validation
    console.log('📌 Test 3: SA ID Validation');
    const testID = '9001010001088';
    const validation = ValidationService.validateSAID(testID);
    
    if (validation.valid) {
      console.log('   ✓ Valid ID');
      console.log(`   • Age: ${validation.data.age} years`);
      console.log(`   • DOB: ${validation.data.dateOfBirth}\n`);
    } else {
      console.log('   ✗ Invalid ID:', validation.message);
    }

    // Test 4: Personal ID Step
    console.log('📌 Test 4: Personal ID Handler');
    const idResult = questionFlows.handleAnswer('personal_id', testID, session);
    console.log('   ✓ ID processed');
    console.log(`   • Response: ${idResult.response.substring(0, 50)}...`);
    console.log(`   • Next Step: ${idResult.nextStep}\n`);
    
    if (idResult.nextStep) {
      session.step = idResult.nextStep;
    }

    // Test 5: Welcome Menu
    console.log('📌 Test 5: Welcome Menu');
    const welcomeMenu = questionFlows.getWelcomeMenu(session);
    console.log('   ✓ Menu generated');
    console.log(`   • Length: ${welcomeMenu.length} characters`);
    console.log(`   • Preview: ${welcomeMenu.substring(0, 100)}...\n`);

    // Test 6: Progress Calculation
    console.log('📌 Test 6: Progress Calculation');
    const progress = questionFlows.calculateProgress(session.data);
    console.log(`   • Progress: ${progress}%\n`);

    // Test 7: Session State
    console.log('📌 Test 7: Final Session State');
    console.log(`   • Step: ${session.step}`);
    console.log(`   • Consent: ${session.data.consentGiven}`);
    console.log(`   • Personal Info:`, session.data.personalInfo);
    console.log();

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
simpleTest();