import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../services/CategoryService";
import { ProductsService } from "../../../../services/ProductService";
import { MoveRight, Search, X, FolderOpen, Check, ChevronDown } from "lucide-react";
import { Category } from "../../CatArea/Categories/Categories";
import { PathDisplay } from "../../SharedComponents/PathDisplay/PathDisplay";

interface MoveProductModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  currentPaths: Array<string>;
  currentCategoryPath?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveProductModal: React.FC<MoveProductModalProps> = ({
  isOpen,
  productId,
  productName,
  currentPaths,
  currentCategoryPath,
  onClose,
  onSuccess,
}) => {
  const [sourceCategoryPath, setSourceCategoryPath] = useState<string>("");
  const [destinationCategoryPath, setDestinationCategoryPath] = useState<string>("");
  const [selectedDestCategory, setSelectedDestCategory] = useState<Category | null>(null);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searching, setSearching] = useState(false);
  const [moving, setMoving] = useState(false);

  const parentPath = (path: string) => {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  };

  const currentCategoryPaths = currentPaths.map(parentPath);
  const editingFromPath = currentCategoryPath;

  useEffect(() => {
    if (isOpen) {
      if (currentCategoryPaths.length === 1) {
        setSourceCategoryPath(currentCategoryPaths[0]);
      } else if (editingFromPath) {
        setSourceCategoryPath(editingFromPath);
      } else {
        setSourceCategoryPath("");
      }
      setDestinationCategoryPath("");
      setSelectedDestCategory(null);
      setSearchQuery("");
      setSearchResults([]);
      setLocationsOpen(false);
    }
  }, [isOpen, currentPaths]);

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
        setSearchResults(results);
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
    if (currentCategoryPaths.length === 1) {
      if (!destinationCategoryPath) {
        toast.error("נא לבחור קטגוריית יעד");
        return;
      }
      if (destinationCategoryPath === currentCategoryPaths[0]) {
        toast.error("הקטגוריה היעד זהה לנוכחית");
        return;
      }
      try {
        setMoving(true);
        await ProductsService.moveProduct(productId, [destinationCategoryPath]);
        toast.success(`${productName} הועבר בהצלחה!`);
        onSuccess();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "שגיאה בהעברת הפריט");
      } finally {
        setMoving(false);
      }
    } else {
      if (!sourceCategoryPath) {
        toast.error("נא לבחור מאיזו קטגוריה להעביר");
        return;
      }
      if (!destinationCategoryPath) {
        toast.error("נא לבחור קטגוריית יעד");
        return;
      }
      if (sourceCategoryPath === destinationCategoryPath) {
        toast.error("הקטגוריה היעד זהה למקור");
        return;
      }
      try {
        setMoving(true);
        const newPaths = currentCategoryPaths
          .filter((path) => path !== sourceCategoryPath)
          .concat(destinationCategoryPath);
        await ProductsService.moveProduct(productId, newPaths);
        toast.success(
          `${productName} הועבר מ-${sourceCategoryPath.split("/").pop()} ל-${destinationCategoryPath.split("/").pop()}!`
        );
        onSuccess();
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "שגיאה בהעברת הפריט");
      } finally {
        setMoving(false);
      }
    }
  };

  if (!isOpen) return null;

  const needsSourceSelection = currentCategoryPaths.length > 1;
  const canMove = needsSourceSelection
    ? sourceCategoryPath && destinationCategoryPath && sourceCategoryPath !== destinationCategoryPath
    : destinationCategoryPath && destinationCategoryPath !== currentCategoryPaths[0];

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
          העבר מוצר
        </h4>
        <p className="text-center text-gray-500 text-sm mb-6">
          <strong className="text-slate-700">{productName}</strong>
        </p>

        {(needsSourceSelection || sourceCategoryPath) && (
          <div className={`mb-3 flex items-start gap-2.5 px-4 py-3 rounded-lg border text-right
            ${sourceCategoryPath ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-300"}`}>
            <div className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold
              ${sourceCategoryPath ? "bg-emerald-500" : "bg-amber-400"}`}>
              {sourceCategoryPath ? "✓" : "!"}
            </div>
            <div className="flex-1 min-w-0">
              {sourceCategoryPath ? (
                <>
                  <p className="text-xs font-semibold text-emerald-700">מעביר מתוך:</p>
                  <p className="text-sm font-bold text-emerald-800 truncate">
                    <PathDisplay path={sourceCategoryPath?.split("/").pop() || ""} />
                  </p>
                  <p className="text-[11px] text-emerald-600 truncate"><PathDisplay path={sourceCategoryPath} /></p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-amber-700">נדרשת בחירה</p>
                  <p className="text-sm text-amber-700">
                    המוצר קיים במספר מיקומים — פתח את הרשימה ובחר מאיזו קטגוריה להעביר
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setLocationsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">מיקומים קיימים</span>
              <span className="text-xs bg-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                {currentPaths.length}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${locationsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {locationsOpen && (
            <div className="flex flex-col divide-y divide-gray-100">
              {currentCategoryPaths.map((path, i) => {
                const label = path.split("/").pop() || path;
                const isSource = sourceCategoryPath === path;
                return (
                  <button
                    key={i}
                    onClick={() => needsSourceSelection && setSourceCategoryPath(path)}
                    className={`flex items-center gap-3 px-4 py-3 text-right transition-all w-full
                      ${needsSourceSelection ? "cursor-pointer" : "cursor-default"}
                      ${isSource ? "bg-slate-300" : needsSourceSelection ? "hover:bg-gray-50 bg-white" : "bg-white"}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                      ${isSource ? "bg-white/20" : "bg-gray-100"}`}>
                      <FolderOpen size={15} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
                      <p className="text-xs text-gray-400 truncate">
                        <PathDisplay path={path} />
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSource ? (
                        <span className="text-[10px] font-bold text-gray-700 bg-white/20 px-2 py-0.5 rounded-full">
                          נבחר
                        </span>
                      ) : needsSourceSelection && (
                        <span className="text-[10px] text-gray-400">לחץ לבחירה</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">בחר קטגוריית יעד</p>

          <div ref={searchRef} className="relative">
            <div className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2.5 transition-colors
              ${searching ? "border-gray-200 bg-gray-50" : searchFocused ? "border-slate-700" : "border-gray-200"}`}>
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
                placeholder="חפש קטגוריה..."
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
                    const alreadyHere = currentCategoryPaths.includes(cat.categoryPath);
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
                          ${alreadyHere ? "opacity-60" : ""}`}
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
                            {alreadyHere && (
                              <span className="mr-1.5 text-xs text-amber-500">(קיים כאן)</span>
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

export default MoveProductModal;