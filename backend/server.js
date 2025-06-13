const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const auth = require('./middleware/auth');
const chatbotAI = require('./utils/chatbotAI');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');
const adminVerify = require('./middleware/adminVerify');
 
// Manually load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() !== '' && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}

const app = express();
// Configure Express to trust proxy headers like X-Forwarded-For
// For local development, do NOT trust proxy headers to avoid rate limit bypass
app.set('trust proxy', false);
const server = http.createServer(app); // Create server for socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from any origin for development
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow requests from any origin for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Security middleware
// Security: HTTP headers
app.use(helmet());
// REMOVE rate limiting for development
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// }));
// Security: Prevent XSS attacks
app.use(xss());
// Security: Prevent NoSQL injection
app.use(mongoSanitize());

// Serve static files from the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Use Winston logger for all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Handle message sending
  socket.on('send_message', async (data) => {
    console.log('📨 Message received:', data);
    
    try {
      // Create default chat if needed (this is a simplification - in a real app, you'd have proper chat creation)
      let chatId = data.chatId;
      
      if (!chatId) {
        // Check if a default chat exists
        const Chat = require('./models/Chat');
        let defaultChat = await Chat.findOne({ name: 'Default Chat' });
        
        if (!defaultChat) {
          // Create a default chat if it doesn't exist
          defaultChat = new Chat({
            name: 'Default Chat',
            participants: [] // In a real app, you'd add actual user IDs
          });
          await defaultChat.save();
        }
        
        chatId = defaultChat._id;
      }
      
      // Store the message in the database
      const Message = require('./models/Message');
      const newMessage = new Message({
        message: data.message,
        chatId: chatId,
        // For simplicity, we're not requiring senderId anymore
        // In a real app with authentication, you'd include user ID here
        sender: data.sender || 'user',
        content: data.content || 'text'
      });
      
      const savedMessage = await newMessage.save();
      console.log('💾 Message saved to database:', savedMessage);
      
      // Broadcast the message to all connected clients
      // Preserve the fromCurrentUser flag if it exists in the original message
      io.emit('receive_message', {
        ...data,
        id: savedMessage._id,
        timestamp: savedMessage.timestamp
      });
      
      // Generate AI response
      setTimeout(async () => {
        try {
          // Process the message through the AI
          const aiResponse = chatbotAI.processMessage(data.message);
          
          // Save AI response to database
          const aiMessage = new Message({
            message: aiResponse.message,
            chatId: chatId,
            sender: 'ai',
            content: 'text'
          });
          
          const savedAiMessage = await aiMessage.save();
          console.log('💾 AI response saved to database:', savedAiMessage);
          
          // Send AI response back to clients
          io.emit('receive_message', {
            message: aiResponse.message,
            chatId: chatId,
            sender: 'ai',
            id: savedAiMessage._id,
            timestamp: savedAiMessage.timestamp
          });
        } catch (error) {
          console.error('❌ Error generating AI response:', error);
        }
      }, 1000); // Small delay to make the conversation feel more natural
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Routes
try {
  // Auth routes
  const authRoutes = require('./routes/auth');
  if (typeof authRoutes !== 'function') {
    console.error('Error: authRoutes is not a function. Type:', typeof authRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/auth', authRoutes);
  
  // Request routes
  const requestRoutes = require('./routes/request');
  if (typeof requestRoutes !== 'function') {
    console.error('Error: requestRoutes is not a function. Type:', typeof requestRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/requests', requestRoutes);
  
  // Message routes
  const messageRoutes = require('./routes/message');
  if (typeof messageRoutes !== 'function') {
    console.error('Error: messageRoutes is not a function. Type:', typeof messageRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/messages', messageRoutes);
  
  // Review routes
  const reviewRoutes = require('./routes/review');
  if (typeof reviewRoutes !== 'function') {
    console.error('Error: reviewRoutes is not a function. Type:', typeof reviewRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/reviews', reviewRoutes);
  
  // Payment routes
  const paymentRoutes = require('./routes/payment');
  if (typeof paymentRoutes !== 'function') {
    console.error('Error: paymentRoutes is not a function. Type:', typeof paymentRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/payments/general', paymentRoutes);

  // Search routes (advanced volunteer search)
  const searchRoutes = require('./routes/search');
  if (typeof searchRoutes !== 'function') {
    console.error('Error: searchRoutes is not a function. Type:', typeof searchRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/search', searchRoutes);
  
  // Stripe payment routes
  const stripeRoutes = require('./routes/stripe');
  if (typeof stripeRoutes !== 'function') {
    console.error('Error: stripeRoutes is not a function. Type:', typeof stripeRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/stripe', stripeRoutes);
  
  // Service Payment routes
  const servicePaymentRoutes = require('./routes/servicePayment');
  if (typeof servicePaymentRoutes !== 'function') {
    console.error('Error: servicePaymentRoutes is not a function. Type:', typeof servicePaymentRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/payments', servicePaymentRoutes);
  
  // Admin routes
  const adminRoutes = require('./routes/admin');
  if (typeof adminRoutes !== 'function') {
    console.error('Error: adminRoutes is not a function. Type:', typeof adminRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/admin', adminRoutes);

  // Stats routes
  const statsRoutes = require('./routes/stats');
  if (typeof statsRoutes !== 'function') {
    console.error('Error: statsRoutes is not a function. Type:', typeof statsRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/stats', statsRoutes);
  
  // User routes
  const userRoutes = require('./routes/user');
  if (typeof userRoutes !== 'function') {
    console.error('Error: userRoutes is not a function. Type:', typeof userRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/user', userRoutes);

  // Helper application routes
  const helperRoutes = require('./routes/helper');
  if (typeof helperRoutes !== 'function') {
    console.error('Error: helperRoutes is not a function. Type:', typeof helperRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/helpers', helperRoutes);

  // Volunteer profile routes
  const volunteerRoutes = require('./routes/volunteer');
  if (typeof volunteerRoutes !== 'function') {
    console.error('Error: volunteerRoutes is not a function. Type:', typeof volunteerRoutes);
    throw new Error('Invalid router object');
  }
  app.use('/api/volunteer', volunteerRoutes);
} catch (error) {
  console.error('Failed to load routes:', error);
}

// Secure route
app.post('/api/secure-data', auth, (req, res) => {
  res.send('Secure data for ' + req.user.id);
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/react-app';
console.log('Using MongoDB URI:', mongoURI);

// Connect to MongoDB with more verbose logging
console.log('Attempting to connect to MongoDB...');
mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    // Log some information about the connection
    console.log(`Connected to database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Port: ${mongoose.connection.port}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Is MongoDB installed and running? Try these steps:');
    console.error('1. Install MongoDB if not already installed');
    console.error('2. Start MongoDB service');
    console.error('3. Run seed-database.bat to initialize the database with sample data');
    console.error('4. Check your MONGO_URI in .env file is correct');
  });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Start the server with port fallback mechanism
const PORT = parseInt(process.env.PORT, 10) || 5000;
let currentPort = PORT;

const startServer = () => {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${currentPort} is already in use, trying ${currentPort + 1}...`);
      // Close the current server (even though it failed to bind)
      server.close();
      // Try the next port number
      currentPort += 1;
      setTimeout(startServer, 100); // Small delay before retry
    } else {
      console.error('❌ Server error:', error);
    }
  });

  server.listen(currentPort, () => {
    console.log(`✅ Server running on http://localhost:${currentPort}`);
  });
};

// Start the server
startServer();

// Example: Use adminVerify middleware for payment release (add to your payment route)
// const adminVerify = require('./middleware/adminVerify');
// app.post('/api/payments/release', auth, adminVerify, (req, res) => { ... });
// This ensures only a verified admin can release payments.

// Stripe Connect setup (see PAYMENT_GUIDE.md for details)
// - Use Stripe Connect for holding and releasing payments
// - Store all Stripe secrets in .env
// - Log all payment actions using Winston

// Root route for health check or welcome message
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});
