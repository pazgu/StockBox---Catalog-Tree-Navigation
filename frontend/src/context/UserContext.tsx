import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  role: string | null;
  setRole: (role: string | null) => void;
}

const UserContext = createContext<UserContextType>({
  role: null,
  setRole: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
  }, [role]);

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
