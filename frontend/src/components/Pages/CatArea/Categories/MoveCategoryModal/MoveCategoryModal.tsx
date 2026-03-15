import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../../services/CategoryService";
import { Category } from "../Categories";
import { MoveRight, Search, X, FolderOpen, Check } from "lucide-react";
import { PathDisplay } from "../../../../../components/Pages/SharedComponents/PathDisplay/PathDisplay";

interface MoveCategoryModalProps {
  isOpen: boolean;
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveCategoryModal: React.FC<MoveCategoryModalProps> = ({
  isOpen,
  category,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [destinationCategoryPath, setDestinationCategoryPath] = useState<string>("");
  const [selectedDestCategory, setSelectedDestCategory] = useState<Category | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searching, setSearching] = useState(false);
  const [moving, setMoving] = useState(false);

  const getCurrentParentPath = (): string => {
    const parts = category.categoryPath.split("/");
    parts.pop();
    return parts.join("/");
  };

  const currentParentPath = getCurrentParentPath();
  const currentParentLabel = currentParentPath.split("/").pop() || "ראשי";

  useEffect(() => {
    if (isOpen) {
      setDestinationCategoryPath("");
      setSelectedDestCategory(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await categoriesService.searchCategories(searchQuery.trim());
        // Filter out the category itself and any of its descendants
        setSearchResults(
          results.filter(
            (cat) =>
              cat._id !== category._id &&
              !cat.categoryPath.startsWith(category.categoryPath + "/")
          )
        );
      } catch (error) {
        toast.error("שגיאה בחיפוש קטגוריות");
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleMove = async () => {
    if (!destinationCategoryPath) {
      toast.error("נא לבחור קטגוריית יעד");
      return;
    }
    if (destinationCategoryPath === currentParentPath) {
      toast.error("קטגורית היעד זהה לנוכחית");
      return;
    }
    try {
      setMoving(true);
      await categoriesService.moveCategory(category._id, destinationCategoryPath);
      toast.success(`${category.categoryName} הועבר בהצלחה!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "שגיאה בהעברת הקטגוריה"
      );
    } finally {
      setMoving(false);
    }
  };

  if (!isOpen) return null;

  const canMove = !!destinationCategoryPath && destinationCategoryPath !== currentParentPath;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl w-[700px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h4 className="m-0 mb-1 text-xl text-slate-700 font-semibold tracking-tight text-center">
          העבר קטגוריה
        </h4>
        <p className="text-center text-gray-500 text-sm mb-6">
          <strong className="text-slate-700">{category.categoryName}</strong>
        </p>

        {/* Current location */}
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
            <FolderOpen size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">מיקום נוכחי</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-white">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gray-100">
              <FolderOpen size={15} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{currentParentLabel}</p>
              <p className="text-xs text-gray-400 truncate"><PathDisplay path={currentParentPath}/></p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">בחירת קטגורית יעד</p>
          <small className="text-gray-400 block mb-3">
            שימו לב! התוכן תחת אותה קטגוריה יעבור איתה למיקום הנבחר
          </small>

          <div ref={searchRef} className="relative">
            <div
              className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2.5 transition-colors
                ${searching ? "border-gray-200 bg-gray-50" : searchFocused ? "border-slate-700" : "border-gray-200"}`}
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-slate-500 rounded-full animate-spin shrink-0" />
              ) : (
                <Search size={16} className="text-gray-400 shrink-0" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="חיפוש קטגוריה..."
                className="flex-1 outline-none text-sm text-gray-700 bg-transparent text-right placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDestinationCategoryPath("");
                    setSelectedDestCategory(null);
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {searchFocused && searchQuery.trim() && (
              <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-slate-700 rounded-full animate-spin" />
                    מחפש...
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3 text-center">לא נמצאו קטגוריות</p>
                ) : (
                  searchResults.map((cat) => {
                    const isCurrentParent = cat.categoryPath === currentParentPath;
                    const isSelected = destinationCategoryPath === cat.categoryPath;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          setDestinationCategoryPath(cat.categoryPath);
                          setSelectedDestCategory(cat);
                          setSearchQuery(cat.categoryName);
                          setSearchFocused(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-right hover:bg-gray-50 transition-colors
                          ${isSelected ? "bg-slate-50" : ""}
                          ${isCurrentParent ? "opacity-60" : ""}`}
                      >
                        {cat.categoryImage ? (
                          <img
                            src={cat.categoryImage}
                            alt={cat.categoryName}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <FolderOpen size={13} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {cat.categoryName}
                            {isCurrentParent && (
                              <span className="mr-1.5 text-xs text-amber-500">(מיקום נוכחי)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate"><PathDisplay path={cat.categoryPath}/></p>
                        </div>
                        {isSelected && <Check size={14} className="text-slate-700 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {selectedDestCategory && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-slate-50 border-2 border-slate-700 rounded-lg">
              {selectedDestCategory.categoryImage ? (
                <img
                  src={selectedDestCategory.categoryImage}
                  alt={selectedDestCategory.categoryName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <FolderOpen size={13} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {selectedDestCategory.categoryName}
                </p>
                <p className="text-xs text-gray-400 truncate">{selectedDestCategory.categoryPath}</p>
              </div>
              <Check size={16} className="text-slate-700 shrink-0" />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleMove}
            disabled={moving || !canMove}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all text-white shadow-sm
              ${moving || !canMove
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-md"
              }`}
          >
            {moving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                מעביר...
              </>
            ) : (
              <>
                <MoveRight size={16} />
                העבר
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={moving}
            className="flex-1 p-3 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveCategoryModal;