import React from "react";
import { Check } from "lucide-react";
import { type SectionType } from "../about.utils";

interface ParagraphSectionProps {
  section: SectionType;
  sectionIndex: number;
  isEditing: boolean;
  updateSectionTitle: (index: number, title: string) => void;
  updateTextContent: (index: number, content: string) => void;
  markDirty: (key: string, currentValue: string) => void;
  confirmField: (key: string, currentValue: string) => void;
  isDirty: (key: string) => boolean;
  mkKey: (
    kind: "sectionTitle" | "paragraphContent",
    sectionId: string,
    itemId?: string,
  ) => string;
}

const ParagraphSection: React.FC<ParagraphSectionProps> = ({
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
      {/* Paragraph Title */}
      {(() => {
        const key = mkKey("sectionTitle", section.id);

        return isEditing ? (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={section.title}
              placeholder="כותרת ראשית"
              onChange={(e) => {
                const val = e.target.value;
                updateSectionTitle(sectionIndex, val);
                markDirty(key, val);
              }}
              className="text-[1.8rem] text-stockblue font-bold w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
            />

            {isDirty(key) && (
              <button
                type="button"
                onClick={() => confirmField(key, section.title)}
                className="h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                title="אשר שינוי"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        ) : (
          <h2 className="text-[1.8rem] text-stockblue mb-4 font-bold">
            {section.title}
          </h2>
        );
      })()}

      {/* Paragraph Content */}
      <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px]">
        {(() => {
          const key = mkKey("paragraphContent", section.id);

          return isEditing ? (
            <div className="flex items-start gap-2">
              <textarea
                value={section.content || ""}
                placeholder="תוכן חדש"
                onChange={(e) => {
                  const val = e.target.value;
                  updateTextContent(sectionIndex, val);
                  markDirty(key, val);
                }}
                className="w-full leading-[1.7] text-stockblue/85 text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[120px]"
              />

              {isDirty(key) && (
                <button
                  type="button"
                  onClick={() => confirmField(key, section.content ?? "")}
                  className="mt-1 h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                  title="אשר שינוי"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ) : (
            <p className="leading-[1.7] text-stockblue/85 m-0 text-[1.1rem] text-justify">
              {section.content}
            </p>
          );
        })()}
      </div>
    </>
  );
};

export default ParagraphSection;