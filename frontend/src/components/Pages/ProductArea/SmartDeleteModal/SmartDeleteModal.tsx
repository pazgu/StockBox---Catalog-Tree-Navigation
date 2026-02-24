import React, { useState } from "react";
import { Trash, AlertTriangle } from "lucide-react";
import { PathDisplay } from "../../SharedComponents/PathDisplay/PathDisplay";

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


  const removeLastSegment = (p: string) => {
  const parts = p.split("/");
  parts.pop(); 
  return parts.join("/");
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

  const handleSelectAll = () => {
  if (selectedPaths.length === currentPaths.length) {
    setSelectedPaths([]);
  } else {
    setSelectedPaths(currentPaths);
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
                    <button
                      onClick={handleSelectAll}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-500/30 border border-indigo-400/30 transition-all duration-200 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:from-indigo-600 active:to-indigo-700"
                    >
                      בחר הכל
                    </button>

                  </h5>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentPaths.map((path, i) => (
                      <div
                        key={i}
                        className={`py-2.5 px-3.5 rounded-lg text-sm transition-colors ${
                          removeLastSegment(path) === currentCategoryPath
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
                              removeLastSegment(path) === currentCategoryPath
                                ? "text-blue-900 font-medium"
                                : "text-slate-600"
                            }`}
                            dir="ltr"
                          style={{ unicodeBidi: "isolate" }}
                          >
                            <PathDisplay path={path} />
                          </span>

                          </div>
                          {removeLastSegment(path) === currentCategoryPath && (
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

            </div>

            {/* Right Column - Action Buttons */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-4">
                אפשרויות מחיקה
              </h5>

              {isMultiLocation && (
                <>
                {selectedPaths.length < currentPaths.length ? (
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
                  </button>) : (                  
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
                              העבר מוצר לסל מחזור

                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              isDeleting || selectedPaths.length === 0
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>)}     


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
