const questionFlows = require('./question-flows');

// Sample data similar to what would be in a session
const testData = {
  personalInfo: {
    idNumber: '9001010001088',
    fullName: 'Test Applicant',
    dob: '1990-01-01',
    phone: '+27761234567',
    email: 'test@example.com'
  },
  businessInfo: {
    businessName: 'Test Business',
    tradingName: 'Test Trading',
    businessType: 'Private Company',
    cipcNumber: 'CK2024/123456/07',
    industry: 'Technology',
    subSector: 'Software',
    description: 'Test description'
  },
  addressInfo: {
    streetAddress: '123 Test St',
    township: 'Test Township',
    city: 'Johannesburg',
    district: 'Metro',
    province: 'Gauteng',
    zipCode: '2000'
  },
  employmentRevenue: {
    totalEmployees: 5,
    fullTimeCount: 3,
    partTimeCount: 2,
    yearsInOperation: 2,
    monthlyRevenueRange: 'R10,000 - R50,000'
  },
  fundingRequest: {
    fundingAmount: 50000,
    fundingPurpose: ['Working Capital', 'Equipment Purchase'],
    preferredFundingType: 'Loan',
    loanRepaymentAbility: 'Yes',
    justification: 'Test justification'
  },
  readinessAssessment: {
    businessPlanStatus: 'Yes - I have a written plan',
    financialRecords: 'Yes - Detailed records',
    bankStatements: 'Yes - I have them ready',
    businessTraining: 'Yes - Formal business training',
    cooperativeInterest: 'No - Prefer to work alone',
    selfAssessmentReadiness: '4 - Almost ready',
    supportNeeds: ['Funding/Grants', 'Mentorship']
  }
};

console.log('Testing summary generation...\n');
const summary = questionFlows.getApplicationSummary(testData);
console.log(summary);