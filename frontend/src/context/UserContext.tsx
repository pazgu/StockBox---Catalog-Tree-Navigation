import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserRole } from "../types/types";

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  approved?: boolean;
  role: "editor" | "viewer";
  requestSent?: boolean;
}

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  users: User[];
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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

  // Add a user via POST
  const addUser = async (user: User) => {
    try {
      const response = await axios.post<User>(API_URL, user);
      setUsers((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  // Update a user via PATCH
  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await axios.patch<User>(`${API_URL}/${id}`, updates);
      setUsers((prev) => prev.map((u) => (u._id === id ? response.data : u)));
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // Delete a user via DELETE
  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        users,
        addUser,
        updateUser,
        deleteUser,
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
