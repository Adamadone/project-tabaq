import { useMsal } from "@azure/msal-react";
import { Button } from "../Button";
import { useAuthContext } from "../../providers/AuthProvider";

export const Login = () => {
  const auth = useAuthContext();

  return <Button onClick={auth.login}>Přihlásit se</Button>;
};
