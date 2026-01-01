import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserRole, User } from "../types/types"; 

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshUsers: () => Promise<void>;
}


const UserContext = createContext<UserContextType>(null!);

const API_URL = "http://localhost:4000/users";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from backend
  const refreshUsers = async () => {
    try {
      const response = await axios.get<User[]>(API_URL);
      console.log("Fetched users:", response.data);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // Persist role in localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === "editor" || storedRole === "viewer") {
      setRole(storedRole as UserRole);
    }
  }, []);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [role]);


  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        users,
        setUsers,
        refreshUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
