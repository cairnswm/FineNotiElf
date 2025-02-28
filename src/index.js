import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { AuthenticationProvider } from "./auth/context/AuthContext";
import { TenantProvider } from "./auth/context/TenantContext";
import { SettingsProvider } from "./auth/context/SettingsContext";
import "bootstrap/dist/css/bootstrap.min.css";

// Function to determine the base path dynamically
const getBasename = () => {
  // First approach: Check if we're in a known subdirectory
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // For specific domains, we can hardcode known subdirectories
  if (hostname.includes('cairns.co.za') && pathname.startsWith('/notielf')) {
    return '/notielf';
  }
  
  // Second approach: Extract subdirectory from pathname
  // This handles cases like https://example.com/subdir/
  const pathParts = pathname.split('/').filter(Boolean);
  
  // If we have at least one path segment and we're not on a specific page
  if (pathParts.length > 0) {
    // Get the first segment as the potential subdirectory
    const firstSegment = pathParts[0];
    
    // Check if this looks like a route rather than a subdirectory
    // Routes typically don't have file extensions and match our known routes
    const knownRoutes = ['login', 'register', 'home', 'profile', 'settings', 'properties', 'payment', 'forgot-password'];
    
    if (!knownRoutes.includes(firstSegment) && !firstSegment.includes('.')) {
      return '/' + firstSegment;
    }
  }
  
  // Third approach: Try to find the script tag with bundle.js
  const scriptTags = document.querySelectorAll('script');
  for (let i = 0; i < scriptTags.length; i++) {
    const src = scriptTags[i].getAttribute('src') || '';
    if (src.includes('bundle.js')) {
      // Extract the directory path from the script src
      const srcPath = src.split('/');
      srcPath.pop(); // Remove the filename
      
      if (srcPath.length > 0 && srcPath[0] !== '.') {
        return '/' + srcPath.filter(segment => segment !== '.' && segment !== '..').join('/');
      }
    }
  }
  
  // If we couldn't determine a specific subdirectory, return empty string
  // This will work for root deployments
  console.log("Could not determine base path, defaulting to empty string");
  return '';
};

const container = document.getElementById("root");
console.log(container);
const root = createRoot(container);

// Get the base path for the router
const basename = getBasename();
console.log("Base path for router:", basename);

root.render(
  <React.StrictMode>
    <TenantProvider
      applicationId="d814e6e1-bfa5-11ef-b768-1a220d8ac2c9"
      config={{}}
      onError={(message, error) => console.error(message, error)}
    >
      <AuthenticationProvider
        googleClientId="YOUR_GOOGLE_CLIENT_ID"
        onError={(message, error) => console.error(message, error)}
      >
        <SettingsProvider>
          <HashRouter basename={basename}>
            <App />
          </HashRouter>
        </SettingsProvider>
      </AuthenticationProvider>
    </TenantProvider>
  </React.StrictMode>
);
