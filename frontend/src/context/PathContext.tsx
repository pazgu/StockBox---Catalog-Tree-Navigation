import React, { createContext, useContext, useState, ReactNode } from "react";

interface PathContextType {
  previousPath: string | null;
  setPreviousPath: (path: string | null) => void;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export const PathProvider = ({ children }: { children: ReactNode }) => {
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  return (
    <PathContext.Provider value={{ previousPath, setPreviousPath }}>
      {children}
    </PathContext.Provider>
  );
};

export const usePath = () => {
  const ctx = useContext(PathContext);
  if (!ctx) throw new Error("usePath must be used within a PathProvider");
  return ctx;
};
