# MongoDB Compass Setup Guide

## What is MongoDB Compass?

MongoDB Compass is the official GUI for MongoDB, allowing you to explore and manipulate your database visually. It provides a user-friendly interface to:

- View and edit documents
- Create and manage collections
- Run queries
- Analyze data
- Optimize performance
- Manage indexes

## Installation Instructions

1. **Download MongoDB Compass**:
   - Go to [MongoDB Compass Download Page](https://www.mongodb.com/try/download/compass)
   - Select the appropriate version for your operating system (Windows/macOS/Linux)
   - Choose the "Compass" edition (not Compass Isolated/Readonly)
   - Download the installer

2. **Install MongoDB Compass**:
   - Run the downloaded installer
   - Follow the installation wizard instructions
   - Launch MongoDB Compass after installation

## Connecting to Your Database

1. **Connect to Local MongoDB** (Using default connection string):
   - When MongoDB Compass starts, it will suggest connecting to `mongodb://localhost:27017`
   - This is the default URL for a local MongoDB server
   - Click "Connect" to connect to your local MongoDB server

   OR

2. **Connect Using Custom Connection String**:
   - In the connection form, enter: `mongodb://localhost:27017/react-app` 
   - This connects to the `react-app` database used in your application
   - Click "Connect"

## Viewing Your Data

1. **Explore Databases**:
   - Once connected, you'll see a list of databases on the left
   - Click on `react-app` database
   
2. **View Collections**:
   - Inside the database, you'll see collections like `users`, `requests`, `payments`, etc.
   - Click on the `users` collection to see user data
   
3. **Find User Registrations/Logins**:
   - In the `users` collection, you should see documents representing registered users
   - Each document contains fields like `name`, `email`, `password` (hashed), `userType`, etc.

## Troubleshooting

If you don't see your data in MongoDB Compass:

1. **Verify MongoDB is Running**:
   - On Windows: Check Services app to see if MongoDB Server is running
   - On macOS/Linux: Run `ps aux | grep mongod` to check if MongoDB process is active
   - If not running, start the MongoDB service

2. **Check Database Connection**:
   - Your application is using the connection string in `.env` file: `mongodb://localhost:27017/react-app`
   - Make sure this matches the connection you're using in Compass

3. **Verify Database Name**:
   - The application is configured to use `react-app` as the database name
   - Make sure you're looking at the correct database in Compass

4. **Initialize with Sample Data**:
   - Run the `seed-database.bat` script to populate the database with sample data
   - This will create test users and ensure the database structure is correct
   
5. **Check MongoDB Logs**:
   - Look for error messages in MongoDB logs that might indicate connection issues
   - On Windows: Check the MongoDB log file in the data directory
   - On macOS/Linux: Check system logs or the MongoDB log file

## Testing MongoDB Connection from Application

To test if your application is connecting to MongoDB properly:

1. Start your application with the `start-app.bat` script
2. Watch the console output for MongoDB connection messages:
   - Success: `✅ MongoDB Connected Successfully`
   - Error: `❌ MongoDB connection error: [error details]`

## Common MongoDB Connection Issues

1. **MongoDB Not Installed**: Make sure MongoDB is properly installed on your system
2. **MongoDB Service Not Running**: Start the MongoDB service
3. **Wrong Port**: Default MongoDB port is 27017; ensure no port conflicts
4. **Authentication Issues**: If MongoDB is set up with authentication, provide correct credentials
5. **Firewall/Antivirus**: Temporary disable firewall/antivirus to test if they're blocking connections
6. **Network Issues**: Ensure you can reach the MongoDB server (especially if not local)

## Need More Help?

- Check the official [MongoDB Compass documentation](https://docs.mongodb.com/compass/)
- Visit the [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- Review your application logs for specific MongoDB connection errors
