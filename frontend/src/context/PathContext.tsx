import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PathContextType {
  previousPath: string | null;
  setPreviousPath: (path: string | null) => void;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export const PathProvider = ({ children }: { children: ReactNode }) => {
  const [previousPath, setPreviousPathState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("previousPath");
    if (saved) setPreviousPathState(saved);
  }, []);

  const dynamicPages = [
  /^\/products\/[^/]+$/,          
  /^\/permissions\/[^/]+\/[^/]+$/, 
  /^\/permissions\/product\/[^/]+$/, 
  /^\/permissions\/category\/[^/]+$/ 
];

  const setPreviousPath = (path: string | null) => {
    if (path) {
      const isDynamic = dynamicPages.some((pattern) => pattern.test(path));
      if (isDynamic) return; 

      setPreviousPathState(path);
      localStorage.setItem("previousPath", path);
    } else {
      setPreviousPathState(null);
      localStorage.removeItem("previousPath");
    }
  };

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
