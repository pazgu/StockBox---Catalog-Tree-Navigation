import React from "react";
import { Check } from "lucide-react";
import { type SectionType } from "../about.utils";

interface IntroSectionProps {
  section: SectionType;
  sectionIndex: number;
  isEditing: boolean;
  updateSectionTitle: (index: number, title: string) => void;
  updateTextContent: (index: number, content: string) => void;
  markDirty: (key: string, currentValue: string) => void;
  confirmField: (key: string, currentValue: string) => void;
  isDirty: (key: string) => boolean;
  mkKey: (kind: "sectionTitle" | "introContent", sectionId: string, itemId?: string) => string;
}

const IntroSection: React.FC<IntroSectionProps> = ({
  section,
  sectionIndex,
  isEditing,
  updateSectionTitle,
  updateTextContent,
  markDirty,
  confirmField,
  isDirty,
  mkKey,
}) => {
  return (
    <>
      {/* Intro Title */}
      {(() => {
        const key = mkKey("sectionTitle", section.id);

        return isEditing ? (
          <div className="flex items-center gap-2 mb-5">
            <input
              type="text"
              value={section.title}
              placeholder="כותרת חדשה"
              onChange={(e) => {
                const val = e.target.value;
                updateSectionTitle(sectionIndex, val);
                markDirty(key, val);
              }}
              className="text-[2.5rem] text-stockblue font-bold text-center w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
            />

            {isDirty(key) && (
              <button
                type="button"
                onClick={() => confirmField(key, section.title)}
                className="h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                title="אישור שינוי"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        ) : (
          <h1 className="text-[2.5rem] text-stockblue mb-5 font-bold text-center">
            {section.title}
          </h1>
        );
      })()}

      {/* Intro Content */}
      <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px] transition-all duration-300 ease-out hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(13,48,91,0.06),0_2px_8px_rgba(13,48,91,0.03)] hover:border-stockblue/10 before:content-[''] before:absolute before:top-0 before:right-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-stockblue before:to-stockblue/30 before:rounded-r-[2px] before:opacity-70">
        {(() => {
          const key = mkKey("introContent", section.id);

          return isEditing ? (
            <div className="flex items-start gap-2">
              <textarea
                value={section.content || ""}
                placeholder="תיאור חדש"
                onChange={(e) => {
                  const val = e.target.value;
                  updateTextContent(sectionIndex, val);
                  markDirty(key, val);
                }}
                className="w-full leading-[1.7] text-stockblue/85 font-normal text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[150px]"
              />

              {isDirty(key) && (
                <button
                  type="button"
                  onClick={() => confirmField(key, section.content ?? "")}
                  className="mt-1 h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                  title="אישור שינוי"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ) : (
            <p className="leading-[1.7] text-stockblue/85 font-normal m-0 text-[1.1rem] text-justify">
              <strong>StockBox</strong> {section.content}
            </p>
          );
        })()}
      </div>
    </>
  );
};

export default IntroSection;