# VolunteerHub Service Marketplace

A full-stack application connecting users with local service providers including electricians, plumbers, doctors, and more. Now available as a Progressive Web App (PWA) for installation on mobile and desktop devices.

## Features

- **User Authentication**: Secure signup and login functionality
- **Service Categories**: Browse various service categories
- **Service Provider Listings**: Find and view service providers by category
- **Service Request System**: Submit requests to service providers
- **Review & Rating System**: Submit and view reviews for service providers
- **Real-time Chat**: Communicate with service providers via the integrated chat
- **User Profile**: Manage your profile and skills as a service provider

## Tech Stack

- **Frontend**: React, React Router, Socket.io-client, Tailwind CSS, Framer Motion, Swiper
- **Backend**: Node.js, Express, Socket.io, MongoDB/Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Notifications**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or remote instance)
- NPM or Yarn

### Installation

1. Clone the repository or extract the project files
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd my-auth-app
   npm install
   ```

### Configuration

#### Backend Configuration

Update the `.env` file in the `backend` folder:

```
MONGO_URI=mongodb://localhost:27017/react-app
PORT=5000
JWT_SECRET=your_secret_key_here

# For email functionality (optional)
DEV_MODE=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=your-email@gmail.com
```

#### Frontend Configuration

The frontend configuration can be found in `my-auth-app/src/config.js`. By default, it's configured to connect to the backend on port 5000.

### Running the Application

#### Using the Start Script

For easy startup, simply run the start-app.bat file by double-clicking it, or by running:

```
start-app.bat
```

This will:
1. Check and install any missing dependencies
2. Start the backend server on port 5000 (or the next available port)
3. Start the frontend development server on port 3002

#### Manual Startup

Alternatively, you can start the backend and frontend manually:

1. Start the backend:
   ```
   cd backend
   npm start
   ```

2. Start the frontend (in a separate terminal):
   ```
   cd my-auth-app
   set PORT=3002 && npm start
   ```

### Accessing the Application

- Frontend: [http://localhost:3002](http://localhost:3002)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Testing the Application

For quick testing:
1. Register a new account or use the login functionality
2. Browse service categories on the home page
3. Check the service listings for specific categories
4. Use the chat feature to communicate with service providers
5. Submit a service request to a provider
6. Submit a review for a service provider
7. Update your profile to offer services yourself

## License

This project is licensed under the MIT License.

## Progressive Web App (PWA)

The application now includes Progressive Web App features, allowing users to install it on their devices and use it offline. For detailed information on PWA features and how to use them, see [PWA-FEATURES.md](./my-auth-app/PWA-FEATURES.md).

Key PWA features include:
- Installable on mobile and desktop devices
- Offline functionality
- Faster loading through asset caching
- Full-screen app-like experience
#   b a c k e n d  
 #   m y - a u t h - a p p  
 