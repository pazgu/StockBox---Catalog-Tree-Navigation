import React from "react";

type UnsavedChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  subMessage?: string;
  cancelText?: string;
  confirmText?: string;
};

const UnsavedChangesDialog = ({
  open,
  onClose,
  onConfirm,
  title = "ישנם שינויים שלא נשמרו",
  message = "האם אתם בטוחים שברצונכם לצאת ללא שמירה?",
  subMessage = "כל השינויים שבוצעו יאבדו.",
  cancelText = "חזרה לעריכה",
  confirmText = "יציאה ללא שמירה",
}: UnsavedChangesDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 text-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="p-8">
          <div className="flex justify-start w-full mb-5">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
              <svg
                className="w-7 h-7 text-[#0D305B]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8v5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{title}</span>
            </h2>
          </div>

          <div className="bg-white/70 border border-blue-100 rounded-xl p-4 shadow-sm mb-6">
            <p className="text-gray-800 font-semibold mb-2">{message}</p>
            <p className="text-sm text-gray-600">{subMessage}</p>
          </div>

          <div className="flex justify-center items-center gap-4 pt-2 border-t-2 border-gray-200 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-bold"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="px-8 py-3 rounded-xl text-white bg-[#0D305B] hover:bg-[#15457a] transition-colors font-bold shadow-lg"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;