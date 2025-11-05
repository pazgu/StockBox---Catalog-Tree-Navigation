import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "../types/types";

interface User {
  id: string | number;
  name: string;
  email: string;
  isApproved?: boolean;
  role: "admin" | "user";
}

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string | number, updates: Partial<User>) => void;
  deleteUser: (id: string | number) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
// Initial mock data
const initialUsers: User[] = [
  { id: 1, name: "ליאלי עמנואלי", email: "lali@outlook.com", isApproved: false, role: "admin" },
  { id: 2, name: "משתמש 2", email: "user2@domain.com", isApproved: false, role: "user" },
  { id: 3, name: "משתמש 3", email: "user3@domain.com", isApproved: false, role: "user" },
  { id: 4, name: "משתמש 4", email: "user4@domain.com", isApproved: true, role: "user" },
  { id: 5, name: "משתמש 5", email: "user5@domain.com", isApproved: true, role: "user" },
  { id: 6, name: "משתמש 6", email: "user6@domain.com", isApproved: true, role: "user" },
  { id: 7, name: "משתמש 7", email: "user7@domain.com", isApproved: true, role: "user" },
  { id: 8, name: "משתמש 8", email: "user8@domain.com", isApproved: true, role: "user" },
  { id: 9, name: "משתמש 9", email: "user9@domain.com", isApproved: true, role: "user" },
  { id: 10, name: "משתמש 10", email: "user10@domain.com", isApproved: true, role: "user" },
  { id: 11, name: "משתמש 11", email: "user11@domain.com", isApproved: true, role: "user" },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : initialUsers;
  });

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === "admin" || storedRole === "user") {
      setRole(storedRole as UserRole);
    }
  }, []);

  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string | number, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string | number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UserContext.Provider value={{ role, setRole, users, addUser, updateUser, deleteUser, setUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};