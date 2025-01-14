import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState } from "react";
import { useUserMutation } from "../api/useUserMutation";

const authContext = createContext(null);

const SCOPES = [
  "offline_access",
  "openid",
  "profile",
  `api://${import.meta.env.VITE_BE_CLIENT_ID}/access_as_user`,
];

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);

  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const { mutateAsync: getUser } = useUserMutation();

  const acquireTokenAndRole = async () => {
    const { accessToken } = await instance.acquireTokenSilent({
      scopes: SCOPES,
      account: accounts[0],
    });

    const user = await getUser({ token: accessToken });
    setAuthData({
      accessToken,
      name: accounts[0].name,
      user: {
        ...user,
        role: user.role.toLowerCase(),
      },
    });
  };

  const login = async () => {
    await instance.loginRedirect({
      scopes: SCOPES,
    });
  };

  const logout = async () => {
    instance.logout();
  };

  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !!authData) return;

      await acquireTokenAndRole();
    })();
  }, [isAuthenticated, authData, accounts]);

  const value = { ...authData, login, logout };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuthContext = () => useContext(authContext);
