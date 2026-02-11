import React, { useState } from "react";
import { Trash, AlertTriangle } from "lucide-react";

interface SmartDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  currentPaths: Array<string>;
  currentCategoryPath: string;
  onClose: () => void;
  onDeleteFromCurrent: () => void;
  onDeleteFromAll: () => void;
  onDeleteSelected?: (paths: string[]) => void;
  isDeleting: boolean;
}

const SmartDeleteModal: React.FC<SmartDeleteModalProps> = ({
  isOpen,
  itemName,
  currentPaths,
  currentCategoryPath,
  onClose,
  onDeleteFromCurrent,
  onDeleteFromAll,
  onDeleteSelected,
  isDeleting,
}) => {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  if (!isOpen) return null;

  const isMultiLocation = currentPaths.length > 1;

  const togglePathSelection = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const handleDeleteSelected = () => {
    if (selectedPaths.length === 0) return;

    if (selectedPaths.length === currentPaths.length) {
      onDeleteFromAll();
    } else if (onDeleteSelected) {
      onDeleteSelected(selectedPaths);
    } else {
      console.warn("onDeleteSelected not provided, falling back to delete all");
      onDeleteFromAll();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-xl transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-8 py-5 rounded-t-2xl border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
              <AlertTriangle className="text-slate-600" size={22} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-800">
                מחיקת מוצר
              </h4>
              <p className="text-sm text-slate-600 mt-0.5">
                נא לבחור את אופן המחיקה המתאים
              </p>
            </div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Info */}
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-700 mb-3">
                  פרטי מוצר
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">שם מוצר:</span>
                    <span className="text-slate-900 font-medium text-sm">
                      {itemName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">מיקומים:</span>
                    <span className="text-slate-900 font-medium text-sm">
                      {currentPaths.length}
                    </span>
                  </div>
                </div>
              </div>

              {isMultiLocation && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                  <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 px-2 py-0.5 rounded text-xs">
                      {currentPaths.length}
                    </span>
                    מיקומי המוצר במערכת
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentPaths.map((path, i) => (
                      <div
                        key={i}
                        className={`py-2.5 px-3.5 rounded-lg text-sm transition-colors ${
                          path.startsWith(currentCategoryPath)
                            ? "bg-blue-100 border border-blue-200"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedPaths.includes(path)}
                              onChange={() => togglePathSelection(path)}
                              className="w-4 h-4 cursor-pointer accent-blue-600"
                            />
                            <span
                              className={`text-xs font-mono ${
                                path.startsWith(currentCategoryPath)
                                  ? "text-blue-900 font-medium"
                                  : "text-slate-600"
                              }`}
                              dir="ltr"
                            >
                              {path}
                            </span>
                          </div>
                          {path.startsWith(currentCategoryPath) && (
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                              מיקום נוכחי
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isMultiLocation && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    ⚠️ פעולה זו תמחק את המוצר לצמיתות מהמערכת. לא ניתן יהיה
                    לשחזר את המוצר לאחר המחיקה.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Action Buttons */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-4">
                אפשרויות מחיקה
              </h5>

              {isMultiLocation && (
                <>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting || selectedPaths.length === 0}
                    className={`w-full group ${
                      isDeleting || selectedPaths.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-md"
                    } transition-all duration-200`}
                  >
                    <div
                      className={`p-5 rounded-xl border-2 text-right ${
                        isDeleting || selectedPaths.length === 0
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-orange-200 group-hover:border-orange-300 group-hover:bg-orange-50/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            isDeleting || selectedPaths.length === 0
                              ? "bg-slate-100"
                              : "bg-orange-100 group-hover:bg-orange-200"
                          } transition-colors`}
                        >
                          <Trash
                            className={
                              isDeleting || selectedPaths.length === 0
                                ? "text-slate-400"
                                : "text-orange-700"
                            }
                            size={20}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold mb-1.5 ${
                              isDeleting || selectedPaths.length === 0
                                ? "text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            מחק מיקומים נבחרים ({selectedPaths.length})
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              isDeleting || selectedPaths.length === 0
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            {selectedPaths.length === 0
                              ? "נא לבחור לפחות מיקום אחד למחיקה"
                              : `המוצר יימחק מ-${selectedPaths.length} ${
                                  selectedPaths.length === 1
                                    ? "מיקום"
                                    : "מיקומים"
                                }`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onDeleteFromCurrent}
                    disabled={isDeleting}
                    className={`w-full group ${
                      isDeleting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-md"
                    } transition-all duration-200`}
                  >
                    <div
                      className={`p-5 rounded-xl border-2 text-right ${
                        isDeleting
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-amber-200 group-hover:border-amber-300 group-hover:bg-amber-50/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            isDeleting
                              ? "bg-slate-100"
                              : "bg-amber-100 group-hover:bg-amber-200"
                          } transition-colors`}
                        >
                          <Trash
                            className={
                              isDeleting ? "text-slate-400" : "text-amber-700"
                            }
                            size={20}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-semibold mb-1.5 ${
                              isDeleting ? "text-slate-400" : "text-slate-800"
                            }`}
                          >
                            מחיקה ממיקום נוכחי בלבד
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              isDeleting ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            המוצר יוסר מהקטגוריה הנוכחית אך יישאר זמין ב-
                            {currentPaths.length - 1} מיקומים נוספים במערכת
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={onDeleteFromAll}
                disabled={isDeleting}
                className={`w-full group ${
                  isDeleting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg"
                } transition-all duration-200`}
              >
                <div
                  className={`p-5 rounded-xl text-right ${
                    isDeleting
                      ? "bg-slate-300"
                      : "bg-slate-700 group-hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isDeleting
                          ? "bg-slate-400"
                          : "bg-slate-600 group-hover:bg-slate-700"
                      } transition-colors`}
                    >
                      <Trash className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1.5">
                        {isMultiLocation
                          ? "מחיקה מוחלטת מהמערכת"
                          : "מחיקת מוצר"}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {isMultiLocation
                          ? `המוצר יימחק לצמיתות מכל ${currentPaths.length} המיקומים במערכת`
                          : "המוצר יימחק לצמיתות ולא ניתן יהיה לשחזר אותו"}
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className={`w-full p-3.5 rounded-xl font-medium transition-all duration-200 ${
                    isDeleting
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDeleteModal;
