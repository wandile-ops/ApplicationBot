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
  logger.info(`${req.method} ${req.url}`);
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
      bodyLength: JSON.stringify(req.body).length 
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
          messageLength: messageBody.length 
        });
        
        // Handle the message asynchronously
        whatsappHandler.handleMessage(from, messageBody).catch(err => {
          logger.error('Error in message handling:', err);
        });
      } else if (value?.statuses) {
        // Handle message delivery status
        const status = value.statuses[0];
        logger.debug('Message status update', {
          to: status.recipient_id,
          status: status.status,
          messageId: status.id
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
  const sessions = sessionManager.getStats();
  res.json({ 
    success: true, 
    sessions: sessions,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/sessions/:phone', (req, res) => {
  const { phone } = req.params;
  let sessionInfo = null;
  
  // Find session by phone number
  for (const [sessionId, session] of sessionManager.sessions.entries()) {
    if (session.phoneNumber === phone) {
      sessionInfo = {
        sessionId,
        step: session.step,
        lastActivity: new Date(session.lastActivity).toISOString(),
        data: session.data
      };
      break;
    }
  }
  
  res.json({ 
    success: true, 
    session: sessionInfo,
    exists: sessionInfo !== null
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
      message: 'Test message sent' 
    });
  } catch (error) {
    logger.error('Test message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message' 
    });
  }
});

// Debug endpoints
app.get('/api/debug/sessions', (req, res) => {
  const sessions = sessionManager.getStats();
  res.json({
    success: true,
    sessions: sessions,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/debug/reset-session/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Find and delete session
    let deleted = false;
    for (const [sessionId, session] of sessionManager.sessions.entries()) {
      if (session.phoneNumber === phoneNumber) {
        sessionManager.deleteSession(sessionId);
        deleted = true;
        break;
      }
    }
    
    res.json({
      success: true,
      deleted: deleted,
      phoneNumber: phoneNumber,
      message: deleted ? 'Session deleted' : 'No session found'
    });
  } catch (error) {
    logger.error('Debug reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Airtable test endpoints
app.get('/api/test-airtable', async (req, res) => {
  try {
    const connectionTest = await airtableService.testConnection();
    const stats = await airtableService.getApplicationStats();
    
    res.json({
      success: true,
      connection: connectionTest,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Airtable test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema', async (req, res) => {
  try {
    const schema = await airtableService.getTableSchema();
    const connection = await airtableService.testConnection();
    
    res.json({
      success: true,
      connection: connection,
      schema: schema,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Schema test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'whatsapp-funding-bot',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp Funding Bot API',
    endpoints: {
      health: '/health',
      webhook: '/webhook',
      sessions: '/api/sessions',
      testAirtable: '/api/test-airtable',
      schema: '/api/schema',
      sendTest: '/api/send-test (POST)'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Application error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`WhatsApp bot server running on port ${PORT}`);
  logger.info(`Webhook URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/webhook`);
  logger.info(`Health check: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clear expired sessions periodically
setInterval(() => {
  sessionManager.cleanup();
}, 300000); // Every 5 minutes