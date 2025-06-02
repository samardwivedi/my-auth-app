# Volunteer Dashboard

This feature adds a comprehensive dashboard for volunteers to track their service requests, payments, and overall activity.

## Features

- **Dashboard Overview**: View key stats about earnings, pending payments, and service requests
- **Request Management**: Track and update the status of service requests
- **Payment History**: Monitor all payment transactions related to volunteer services
- **Payment Details**: View and update payment information
- **Availability Management**: Set your availability status and schedule when you can provide services

## Setup

1. **Database Setup**:
   - New models have been added: `Payment.js` for tracking payment transactions
   - The `Request` model has been updated with a status field
   - The `User` model has been updated with availability fields: `isAvailable` and `availabilitySchedule`

2. **Backend API Endpoints**:
   - `/api/payments` - CRUD operations for payments
   - Updated `/api/requests` with status update functionality
   - `/api/auth/availability` - Update volunteer availability settings

3. **Frontend Components**:
   - `VolunteerDashboard.jsx` - Main dashboard page with tabs for different sections
   - `PaymentDetailsModal.jsx` - Modal for viewing/editing payment details
   - `AvailabilityManager.jsx` - Component for managing volunteer availability

## Testing with Sample Data

A database seeding script has been added to help with testing:

1. Run `seed-database.bat` to populate the database with sample volunteers, requests, and payments.
2. Start the application with `start-app.bat`.
3. Login with one of the sample volunteer accounts:
   - Email: `john.volunteer@example.com` / Password: `password123`
   - Email: `sarah.volunteer@example.com` / Password: `password123`
   - Email: `michael.volunteer@example.com` / Password: `password123`
4. Navigate to the dashboard via the "Dashboard" link in the navigation or by visiting `/volunteer-dashboard` directly.

## Dashboard Sections

### Overview Tab

- Shows key statistics:
  - Total earnings
  - Pending payments
  - Completed requests
  - Pending requests
- Displays recent requests and recent payments

### Availability Tab

- Toggle overall availability status (available/unavailable)
- Set weekly schedule with specific hours for each day
- Allows volunteers to indicate when they're available to provide services
- Hidden from search results when marked as unavailable

### Requests Tab

- Lists all service requests for the volunteer
- Allows updating request status (pending, accepted, completed, cancelled)
- Provides filtering options

### Payments Tab

- Shows payment history and summary
- Provides filtering options
- Allows viewing and editing payment details

## Technical Details

### Payment Model

The Payment model includes:
- volunteerId - Reference to the volunteer
- requestId - Reference to the service request
- amount - Payment amount
- status - Payment status (pending, completed, cancelled)
- paymentMethod - Method of payment
- transactionId - Optional transaction reference
- paymentDate - Date payment was made
- notes - Additional information

### Request Status Flow

Requests follow this status flow:
1. **Pending**: Initial status when a request is created
2. **Accepted**: Volunteer has agreed to provide the service
3. **Completed**: Service has been provided and completed
4. **Cancelled**: Service request was cancelled

### Availability Management

Volunteers can manage their availability in two ways:
1. **Overall Availability**: Toggle to indicate if they are generally available for new service requests
2. **Weekly Schedule**: Set specific hours for each day of the week when they can provide services
3. **Search Visibility**: Only available volunteers appear in search results for users looking for help

## Extending the Dashboard

To add more features to the dashboard:

1. **New Analytics**: Add more statistical calculations in the payment stats API endpoint.
2. **Calendar Integration**: Create a calendar view of scheduled services.
3. **Export Features**: Add functionality to export payment history or generate invoices.
4. **Notification System**: Implement notifications for payment status changes.
