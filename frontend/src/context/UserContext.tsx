import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, User } from "../../src/components/models/user.models";
import { environment } from "../environments/environment.development";
import api from "../services/axios";

interface UserContextType {
  user: User | null;
  role: UserRole | null;
  id: string | null;
  isAuthReady: boolean;

  setUser: (user: User | null) => void;

  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  refreshUsers: () => Promise<void>;
  blockUser: (id: string, isBlocked: boolean) => Promise<void>;
}

const UserContext = createContext<UserContextType>(null!);

const API_URL = environment.API_URL;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [id, setId] = useState<string | null>(null);

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setId(parsed.id ?? parsed._id ?? null);
      } catch {
        localStorage.removeItem("user");
        setUser(null);
        setId(null);
      }
    }

    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setId((user as any).id ?? (user as any)._id ?? null);
    } else {
      localStorage.removeItem("user");
      setId(null);
    }
  }, [user]);

  const refreshUsers = async () => {
    try {
      const response = await api.get<User[]>(`${API_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const blockUser = async (id: string, isBlocked: boolean) => {
    try {
      const response = await api.patch<User>(`${API_URL}/${id}/block`, {
        isBlocked,
      });
      setUsers((prev) => prev.map((u) => (u._id === id ? response.data : u)));
    } catch (err) {
      console.error("Error blocking user:", err);
      throw err;
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        role: (user?.role as UserRole) ?? null,
        id,
        isAuthReady,

        setUser,
        users,
        setUsers,
        refreshUsers,
        blockUser,
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
