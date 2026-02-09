const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
require('dotenv').config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Import modules
const whatsappHandler = require('./whatsapp-handler');
const sessionManager = require('./session-manager');
const airtableService = require('./airtable');

// Webhook verification endpoint (for Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('Webhook verification attempt', { mode, token });

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      logger.info('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      logger.warn('Webhook verification failed: invalid token');
      res.sendStatus(403);
    }
  } else {
    logger.warn('Webhook verification failed: missing parameters');
    res.sendStatus(400);
  }
});

// Webhook endpoint for receiving messages
app.post('/webhook', async (req, res) => {
  try {
    logger.debug('Received webhook', { 
      body: req.body,
      headers: req.headers 
    });
    
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (value?.messages) {
        const message = value.messages[0];
        const from = message.from;
        const messageType = message.type;
        
        let messageBody = '';
        
        if (messageType === 'text') {
          messageBody = message.text?.body || '';
        } else if (messageType === 'interactive') {
          const interactive = message.interactive;
          if (interactive.type === 'list_reply') {
            messageBody = interactive.list_reply.id;
          } else if (interactive.type === 'button_reply') {
            messageBody = interactive.button_reply.id;
          }
        }
        
        logger.info('Processing message', { 
          from, 
          messageType, 
          messageBody: messageBody.substring(0, 100) 
        });
        
        // Handle the message asynchronously
        whatsappHandler.handleMessage(from, messageBody).catch(err => {
          logger.error('Error in message handling:', err);
        });
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.sendStatus(500);
  }
});

// API endpoints for testing and management
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(sessionManager.sessions.entries()).map(([id, session]) => ({
    id,
    phoneNumber: session.phoneNumber,
    step: session.step,
    lastActivity: new Date(session.lastActivity).toISOString(),
    dataSummary: {
      hasPersonalInfo: !!session.data.personalInfo?.idNumber,
      hasBusinessInfo: !!session.data.businessInfo?.businessName,
      hasAddressInfo: !!session.data.addressInfo?.streetAddress
    }
  }));
  
  res.json({ 
    sessions, 
    count: sessions.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/send-test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message required' 
      });
    }
    
    await whatsappHandler.sendMessage(phoneNumber, message);
    res.json({ 
      success: true, 
      message: 'Test message sent',
      to: phoneNumber
    });
  } catch (error) {
    logger.error('Test message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message' 
    });
  }
});

// Test Airtable connection
app.get('/api/test-airtable', async (req, res) => {
  try {
    const connectionTest = await airtableService.testConnection();
    const stats = await airtableService.getApplicationStats();
    const schema = await airtableService.getTableSchema();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      stats: stats,
      schema: schema
    });
  } catch (error) {
    logger.error('Airtable test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get application by session ID
app.get('/api/applications/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const application = await airtableService.getApplication(sessionId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    logger.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'whatsapp-funding-bot',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Clear expired sessions periodically
setInterval(() => {
  sessionManager.cleanup();
  logger.debug('Session cleanup completed');
}, 3600000); // Every hour

// Start server
app.listen(PORT, () => {
  logger.info(`WhatsApp bot server running on port ${PORT}`);
  logger.info(`Webhook URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/webhook`);
  logger.info(`Health check: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/health`);
  
  // Test Airtable connection on startup
  airtableService.testConnection().then(result => {
    if (result.connected) {
      logger.info('Airtable connection established successfully');
    } else {
      logger.error('Airtable connection failed:', result.error);
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});