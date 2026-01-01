import React, { FC, useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  index: number;
  handleAddSection: (index: number, type: "features" | "bullets" | "paragraph") => void;

  // ✅ NEW
  disabled?: boolean;
  disabledReason?: string;
}

const AddSectionButton: FC<AddSectionButtonProps> = ({
  index,
  handleAddSection,
  disabled = false,
  disabledReason = "יש לאשר שינויים (✓) לפני הוספת מקטע חדש.",
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // ✅ if it becomes disabled while menu is open, close it
  useEffect(() => {
    if (disabled && showMenu) setShowMenu(false);
  }, [disabled, showMenu]);

  const toggleMenu = () => {
    if (disabled) return;
    setShowMenu((prev) => !prev);
  };

  const handlePick = (type: "features" | "bullets" | "paragraph") => {
    if (disabled) return;
    handleAddSection(index, type);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        disabled={disabled}
        title={disabled ? disabledReason : "הוסף מקטע"}
        className={`flex items-center gap-2 rounded-full border border-stockblue/30 bg-white px-4 py-2 text-sm font-semibold shadow-md transition-all duration-300
          ${
            disabled
              ? "text-gray-400 cursor-not-allowed opacity-60"
              : "text-stockblue hover:bg-stockblue hover:text-white"
          }`}
      >
        <Plus size={16} /> הוסף מקטע
      </button>

      {showMenu && !disabled && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
          <button
            type="button"
            onClick={() => handlePick("features")}
            className="block w-full text-right px-4 py-2 hover:bg-gray-100 rounded-t-lg"
          >
            הוסף מקטע פיצ'רים
          </button>

          <button
            type="button"
            onClick={() => handlePick("bullets")}
            className="block w-full text-right px-4 py-2 hover:bg-gray-100"
          >
            הוסף מקטע נקודות
          </button>

          <button
            type="button"
            onClick={() => handlePick("paragraph")}
            className="block w-full text-right px-4 py-2 hover:bg-gray-100 rounded-b-lg"
          >
            הוסף מקטע פסקה
          </button>
        </div>
      )}
    </div>
  );
};

export default AddSectionButton;
