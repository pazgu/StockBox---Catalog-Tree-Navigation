import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserRole, User } from "../types/types";
import { environment } from "../environments/environment.development";

interface UserContextType {
  user: User | null;
  role: UserRole | null;
  setUser: (user: User | null) => void;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType>(null!);

const API_URL = environment.API_URL

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const refreshUsers = async () => {
    try {
      const response = await axios.get<User[]>(API_URL);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        setUser,
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
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
