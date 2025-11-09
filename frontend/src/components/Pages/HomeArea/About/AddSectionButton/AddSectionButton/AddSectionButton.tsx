import React, { FC, useState } from "react";
import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  index: number;
  handleAddSection: (index: number, type: "features" | "vision") => void;
}

const AddSectionButton: FC<AddSectionButtonProps> = ({ index, handleAddSection }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-full border border-stockblue/30 bg-white text-stockblue px-4 py-2 text-sm font-semibold shadow-md hover:bg-stockblue hover:text-white transition-all duration-300"
      >
        <Plus size={16} /> הוסף מקטע
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
          <button
            onClick={() => {
              handleAddSection(index, "features");
              setShowMenu(false);
            }}
            className="block w-full text-right px-4 py-2 hover:bg-gray-100 rounded-t-lg"
          >
            הוסף מקטע פיצ'רים
          </button>
          <button
            onClick={() => {
              handleAddSection(index, "vision");
              setShowMenu(false);
            }}
            className="block w-full text-right px-4 py-2 hover:bg-gray-100 rounded-b-lg"
          >
            הוסף מקטע חזון
          </button>
        </div>
      )}
    </div>
  );
};

export default AddSectionButton;