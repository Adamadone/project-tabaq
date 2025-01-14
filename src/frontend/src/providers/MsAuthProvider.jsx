import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_LOGIN_CLIENT_ID,
    authority: import.meta.env.VITE_LOGIN_AUTHORITY_URL,

    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
});

export const MsAuthProvider = ({ children }) => {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
