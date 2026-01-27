// components/ui/BackButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  text?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ text = "חזרה", className }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`flex items-center gap-1 text-gray-700 hover:text-black font-sans text-base px-2 py-1 rounded transition-colors duration-150 ${className}`}
    >
      ← {text}
    </button>
  );
};

export default BackButton;
