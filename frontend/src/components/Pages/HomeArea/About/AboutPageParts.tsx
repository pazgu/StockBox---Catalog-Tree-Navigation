import React from "react";
import {
  Edit2,
  Save,
  X,
  FileText,
  ListChecks,
  LayoutGrid,
  Plus,
  GripVertical,
  Trash2,
} from "lucide-react";
import AddSectionButton from "./AddSectionButton/AddSectionButton/AddSectionButton";
import { Spinner } from "../../../ui/spinner";
type SectionKind = "features" | "bullets" | "paragraph";

interface AboutFloatingActionsProps {
  role?: string | null;
  isEditing: boolean;
  isSaving: boolean;
  handleCancelClick: () => void;
  cancelPendingExit: () => void;
  setEditExitAction: (value: "save" | "cancel" | null) => void;
  debouncedSaveChanges: () => void;
  setIsEditing: (value: boolean) => void;
}

interface AboutSectionTopActionsProps {
  isEditing: boolean;
  isCtaSection: boolean;
  sectionIndex: number;
  removeSection: (index: number) => void;
}

export const AboutSectionTopActions: React.FC<AboutSectionTopActionsProps> = ({
  isEditing,
  isCtaSection,
  sectionIndex,
  removeSection,
}) => {
  if (!isEditing || isCtaSection) return null;

  return (
    <div className="absolute -right-3 -top-3 flex gap-2 z-20">
      <div className="group relative">
        <div className="p-2 bg-stockblue text-white rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:bg-stockblue/90 transition">
          <GripVertical size={20} />
        </div>
        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md z-50">
          יש לגרור לשינוי סדר
        </span>
      </div>

      <div className="group relative">
        <button
          onClick={() => {
            removeSection(sectionIndex);
          }}
          className="p-2 bg-red-500 text-white rounded-lg transition shadow-md hover:bg-red-600"
        >
          <Trash2 size={18} />
        </button>
        <span className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md z-50">
          מחיקת מקטע
        </span>
      </div>
    </div>
  );
};

export const AboutFloatingActions: React.FC<AboutFloatingActionsProps> = ({
  role,
  isEditing,
  isSaving,
  handleCancelClick,
  cancelPendingExit,
  setEditExitAction,
  debouncedSaveChanges,
  setIsEditing,
}) => {
  if (role !== "editor") return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {isEditing && (
        <div className="relative">
          <button
            onClick={handleCancelClick}
            aria-label="ביטול עריכה"
            className="peer flex items-center justify-center w-14 h-14 rounded-full font-semibold bg-white text-red-600 shadow-lg ring-2 ring-red-500/20 hover:ring-red-500/30 hover:bg-red-50 transition-all duration-300"
          >
            <X size={22} />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
            ביטול עריכה
          </span>
        </div>
      )}

      <div className="relative">
  <button
    onClick={() => {
      if (isSaving) return;

      cancelPendingExit();

      if (isEditing) {
        setEditExitAction("save");
        debouncedSaveChanges();
        return;
      }

      setEditExitAction(null);
      setIsEditing(true);
    }}
    disabled={isSaving}
    aria-label={isEditing ? "שמירת שינויים" : "עריכה"}
    className={`peer flex items-center justify-center w-14 h-14 rounded-full font-semibold text-white shadow-lg ring-2 transition-all duration-300 ${
      isSaving
        ? "bg-slate-400 cursor-not-allowed ring-slate-300"
        : "bg-stockblue ring-stockblue/30 hover:ring-stockblue/40 hover:bg-stockblue/90"
    }`}
  >
    {isSaving ? (
      <Spinner className="size-5 text-white" />
    ) : isEditing ? (
      <Save size={22} />
    ) : (
      <Edit2 size={22} />
    )}
  </button>
  <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
    {isSaving ? "שומר..." : isEditing ? "שמירת שינויים" : "עריכה"}
  </span>
</div>
    </div>
  );
};

interface AboutSectionFooterActionsProps {
  isEditing: boolean;
  isCtaSection: boolean;
  sectionIndex: number;
  hasUnconfirmedChanges: boolean;
  canAdd: boolean;
  handleAddSection: (
    afterIndex: number,
    type: SectionKind,
  ) => void;
  disabledReason: string;
  blockedReason: string;
  onBlockedAdd: () => void;
}

export const AboutSectionFooterActions: React.FC<
  AboutSectionFooterActionsProps
> = ({
  isEditing,
  isCtaSection,
  sectionIndex,
  hasUnconfirmedChanges,
  canAdd,
  handleAddSection,
  disabledReason,
  blockedReason,
  onBlockedAdd,
}) => {
  if (!isEditing || isCtaSection) return null;

  return (
    <div className="mt-6 flex justify-center">
      <AddSectionButton
        index={sectionIndex}
        handleAddSection={handleAddSection}
        disabled={hasUnconfirmedChanges}
        disabledReason={disabledReason}
        canAdd={canAdd}
        blockedReason={blockedReason}
        onBlockedAdd={onBlockedAdd}
      />
    </div>
  );
};

interface AboutBottomDropZoneProps {
  isEditing: boolean;
  hasUnconfirmedChanges: boolean;
  dragOverIndex: number | null;
  sectionsLength: number;
  draggedIndexRef: React.MutableRefObject<number | null>;
  setDragOverIndex: (index: number) => void;
}

export const AboutBottomDropZone: React.FC<AboutBottomDropZoneProps> = ({
  isEditing,
  hasUnconfirmedChanges,
  dragOverIndex,
  sectionsLength,
  draggedIndexRef,
  setDragOverIndex,
}) => {
  if (!isEditing || hasUnconfirmedChanges) return null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        const from = draggedIndexRef.current;
        if (from === null) return;
        setDragOverIndex(sectionsLength);
      }}
      onDragEnter={() => {
        const from = draggedIndexRef.current;
        if (from === null) return;
        setDragOverIndex(sectionsLength);
      }}
      className={`my-6 h-12 rounded-xl transition-all duration-200 ${
        dragOverIndex === sectionsLength
          ? "border-2 border-solid border-stockblue bg-stockblue/5"
          : "border-2 border-dashed border-stockblue/15"
      }`}
    />
  );
};

interface EmptyAboutSectionsStateProps {
  isEditing: boolean;
  isEmptyContent: boolean;
  hasUnconfirmedChanges: boolean;
  handleAddSection: (afterIndex: number, type: SectionKind) => void;
  unconfirmedChangesBlockedText: string;
}

export const EmptyAboutSectionsState: React.FC<EmptyAboutSectionsStateProps> = ({
  isEditing,
  isEmptyContent,
  hasUnconfirmedChanges,
  handleAddSection,
  unconfirmedChangesBlockedText,
}) => {
  if (!isEditing || !isEmptyContent) return null;

  return (
    <div className="my-6 border-2 border-dashed border-stockblue/20 rounded-2xl p-10 bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-stockblue font-bold text-xl mb-2">
          הוספת תוכן לעמוד{" "}
        </h3>
        <p className="text-stockblue/70 text-sm">
          יש לבחור סוג מקטע להתחלה :{" "}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          disabled={hasUnconfirmedChanges}
          onClick={() => handleAddSection(-1, "paragraph")}
          title={
            hasUnconfirmedChanges
              ? unconfirmedChangesBlockedText
              : "הוסף מקטע פסקה"
          }
          className={`group inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold border shadow-md transition-all duration-300
      ${
        hasUnconfirmedChanges
          ? "text-gray-400 border-gray-200 bg-white cursor-not-allowed opacity-60"
          : "text-stockblue border-stockblue/30 bg-white hover:bg-stockblue hover:text-white"
      }`}
        >
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300
        ${
          hasUnconfirmedChanges
            ? "border-gray-200 bg-gray-50"
            : "border-stockblue/20 bg-stockblue/5 group-hover:bg-white/10 group-hover:border-white/30"
        }`}
          >
            <FileText size={18} />
          </span>
          פסקה
          <Plus size={16} className="opacity-70 group-hover:opacity-100" />
        </button>

        <button
          type="button"
          disabled={hasUnconfirmedChanges}
          onClick={() => handleAddSection(-1, "bullets")}
          title={
            hasUnconfirmedChanges
              ? unconfirmedChangesBlockedText
              : "הוסף מקטע נקודות"
          }
          className={`group inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold border shadow-md transition-all duration-300
      ${
        hasUnconfirmedChanges
          ? "text-gray-400 border-gray-200 bg-white cursor-not-allowed opacity-60"
          : "text-stockblue border-stockblue/30 bg-white hover:bg-stockblue hover:text-white"
      }`}
        >
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300
        ${
          hasUnconfirmedChanges
            ? "border-gray-200 bg-gray-50"
            : "border-stockblue/20 bg-stockblue/5 group-hover:bg-white/10 group-hover:border-white/30"
        }`}
          >
            <ListChecks size={18} />
          </span>
          נקודות
          <Plus size={16} className="opacity-70 group-hover:opacity-100" />
        </button>

        <button
          type="button"
          disabled={hasUnconfirmedChanges}
          onClick={() => handleAddSection(-1, "features")}
          title={
            hasUnconfirmedChanges
              ? unconfirmedChangesBlockedText
              : "הוסף מקטע פיצ'רים"
          }
          className={`group inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold border shadow-md transition-all duration-300
      ${
        hasUnconfirmedChanges
          ? "text-gray-400 border-gray-200 bg-white cursor-not-allowed opacity-60"
          : "text-stockblue border-stockblue/30 bg-white hover:bg-stockblue hover:text-white"
      }`}
        >
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300
        ${
          hasUnconfirmedChanges
            ? "border-gray-200 bg-gray-50"
            : "border-stockblue/20 bg-stockblue/5 group-hover:bg-white/10 group-hover:border-white/30"
        }`}
          >
            <LayoutGrid size={18} />
          </span>
          פיצ׳רים
          <Plus size={16} className="opacity-70 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};