import { Navigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { JSX } from "react/jsx-runtime";

interface Props {
  children: JSX.Element;
}

export const RequireAdmin: React.FC<Props> = ({ children }) => {
  const { user, role, isAuthReady } = useUser();

  if (!isAuthReady) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "editor") return <Navigate to="/403" replace />;

  return children;
};