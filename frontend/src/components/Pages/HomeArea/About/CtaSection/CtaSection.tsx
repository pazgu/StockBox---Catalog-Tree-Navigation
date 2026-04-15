import React from "react";
import { GripVertical, Compass } from "lucide-react";

interface CtaSectionProps {
  isEditing: boolean;
  handleNavigateToCategories: () => void;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  isEditing,
  handleNavigateToCategories,
}) => {
  return (
    <div className="flex justify-center my-10">
      {isEditing && (
        <div className="absolute -top-4 -right-4 group">
          <div className="bg-stockblue text-white p-3 rounded-xl shadow-lg cursor-move transition hover:bg-stockblue/90">
            <GripVertical size={18} />
          </div>

          <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md z-50">
            שינוי סדר
          </span>
        </div>
      )}

      <button
        onClick={handleNavigateToCategories}
        className="group inline-flex items-center gap-3 rounded-2xl border border-stockblue/20 bg-gradient-to-r from-white/90 via-white/80 to-blue-50/60 px-10 py-4 text-[1.15rem] font-bold text-stockblue backdrop-blur-sm shadow-[0_8px_28px_rgba(13,48,91,0.18)] hover:shadow-[0_12px_38px_rgba(13,48,91,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stockblue text-white shadow-[0_4px_14px_rgba(13,48,91,0.35)] group-hover:rotate-12 transition-transform duration-300">
          <Compass size={22} />
        </span>

        גלו את התכולות והאמצעים

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-[22px] w-[22px] -scale-x-100 transition-transform duration-300 group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default CtaSection;