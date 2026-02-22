import { useUser } from "../../../../context/UserContext";
import { Navigate } from "react-router-dom";
import { JSX } from "react/jsx-runtime";

interface Props {
  children: JSX.Element;
}

export const RequireAuth: React.FC<Props> = ({ children }) => {
  const { user, isAuthReady } = useUser();

  if (!isAuthReady) return null; 

  if (!user) return <Navigate to="/login" replace />;

  return children;
};