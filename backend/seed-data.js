const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const Payment = require('./models/Payment');

// Load environment variables
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/react-app');
    console.log('MongoDB connected for seeding');

    // Clear existing volunteer data without affecting admin users
    await User.deleteMany({ userType: 'volunteer' });
    await Request.deleteMany({});
    await Payment.deleteMany({});

    console.log('Cleared existing data');

    // Check if admin users exist, create only if they don't
    let admins = [];
    const adminEmails = ['samardwivedi97@gmail.com'];
    
    for (const email of adminEmails) {
      const existingAdmin = await User.findOne({ email });
      
      if (!existingAdmin) {
        try {
          const newAdmin = await User.create({
            name: email === 'samardwivedi97@gmail.com' ? 'samar' : 'Admin User',
            email,
            password: '$2a$10$X7BnzMfIiLKJr1rMSl.K1.u0ERhKQPe.M2rmU6C2KkGNXwMx0r3aq',
            userType: 'admin',
            status: 'active',
            location: email === 'samardwivedi97@gmail.com' ? 'Delhi' : 'Admin HQ',
            description: email === 'samardwivedi97@gmail.com' ? 'Primary administrator' : 'System administrator',
            isVerifiedProvider: true
          });
          
          admins.push(newAdmin);
          console.log(`Created admin user: ${email}`);
        } catch (err) {
          console.log(`Admin user ${email} could not be created: ${err.message}`);
        }
      } else {
        console.log(`Admin user ${email} already exists`);
        admins.push(existingAdmin);
      }
    }

    console.log('Database seeded successfully!');
    console.log(`Sample volunteers: ${volunteers.length}`);
    console.log(`Sample requests: ${requests.length}`);
    console.log(`Sample payments: ${payments.length}`);

    return {
      volunteers,
      requests,
      payments
    };
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Execute seeding if this script is run directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seeding complete. Connection closed.');
    process.exit(0);
  });
}

module.exports = seedDatabase;
