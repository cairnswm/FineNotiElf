# User Authentication System with Google OAuth

This project implements a user authentication system using React and Google OAuth 2.0.

## Getting Started

### Prerequisites
- Node.js installed on your system
- A Google account
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Setting Up Google OAuth 2.0

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter a project name and click "Create"

### Step 2: Enable Google OAuth API

1. Select your project in the Google Cloud Console
2. Go to the Navigation Menu (☰) > APIs & Services > Library
3. Search for "Google OAuth2 API" or "Google+ API"
4. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to Navigation Menu (☰) > APIs & Services > OAuth consent screen
2. Select "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
4. Click "Save and Continue"
5. Under "Scopes", add the following scopes:
   - .../auth/userinfo.email
   - .../auth/userinfo.profile
6. Click "Save and Continue"
7. Add test users if you're in testing mode
8. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Client ID

1. Go to Navigation Menu (☰) > APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name your OAuth 2.0 client
5. Add authorized JavaScript origins:
   - For development: `http://localhost:8080`
   - For production: Add your production domain
6. Add authorized redirect URIs:
   - For development: `http://localhost:8080`
   - For production: Add your production domain
7. Click "Create"

### Step 5: Get Your Client ID

1. After creating the OAuth client, you'll see a modal with your client ID and client secret
2. Copy the client ID

### Step 6: Configure Your Application

1. Open `src/index.js`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual client ID:

```javascript
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
```

## Running the Application

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:8080`

## Important Security Notes

- Never commit your Google Client ID to public repositories
- For production, use environment variables to store sensitive information
- Implement proper backend validation of Google OAuth tokens
- Follow OAuth 2.0 best practices and security guidelines

## Features

- User registration and login
- Google OAuth integration
- Protected routes
- User profile page
- Responsive design using React Bootstrap

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google NPM Package](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)
