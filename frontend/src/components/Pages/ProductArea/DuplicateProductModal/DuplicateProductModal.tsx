import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../services/CategoryService";
import { ProductsService } from "../../../../services/ProductService";
import { Copy, Search, X, FolderOpen, Check, ChevronDown } from "lucide-react";
import { PathDisplay } from "../../SharedComponents/PathDisplay/PathDisplay";

interface Category {
  _id: string;
  categoryName: string;
  categoryPath: string;
  categoryImage: string;
}

interface DuplicateProductModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  currentPaths: Array<string>;
  onClose: () => void;
  onSuccess: () => void;
}

const DuplicateProductModal: React.FC<DuplicateProductModalProps> = ({
  isOpen,
  productId,
  productName,
  currentPaths,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategoryPaths, setSelectedCategoryPaths] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searching, setSearching] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
  const productSlug = slugify(productName);

  const isCurrentPath = (categoryPath: string) =>
    currentPaths.some((p) => p === `${categoryPath}/${productSlug}`);

  const currentCategoryPaths = currentPaths.map((p) => {
    const parts = p.split("/");
    parts.pop();
    return parts.join("/");
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryPaths(new Set());
      setSelectedCategories([]);
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

  const toggleSelection = (cat: Category) => {
    if (isCurrentPath(cat.categoryPath)) return;
    const next = new Set(selectedCategoryPaths);
    const nextList = [...selectedCategories];
    if (next.has(cat.categoryPath)) {
      next.delete(cat.categoryPath);
      const idx = nextList.findIndex((c) => c.categoryPath === cat.categoryPath);
      if (idx !== -1) nextList.splice(idx, 1);
    } else {
      next.add(cat.categoryPath);
      nextList.push(cat);
    }
    setSelectedCategoryPaths(next);
    setSelectedCategories(nextList);
  };

  const removeSelection = (categoryPath: string) => {
    const next = new Set(selectedCategoryPaths);
    next.delete(categoryPath);
    setSelectedCategoryPaths(next);
    setSelectedCategories((prev) => prev.filter((c) => c.categoryPath !== categoryPath));
  };

  const handleDuplicate = async () => {
    if (selectedCategoryPaths.size === 0) {
      toast.error("נא לבחור לפחות קטגוריית יעד אחת");
      return;
    }
    const pathsArray = Array.from(selectedCategoryPaths);
    try {
      setDuplicating(true);
      await ProductsService.duplicateProduct(productId, pathsArray);
      toast.success(
        `${productName} שוכפל בהצלחה ל-${pathsArray.length} ${pathsArray.length === 1 ? "קטגוריה" : "קטגוריות"} נוספות!`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "שגיאה בשכפול הפריט");
      console.error(error);
    } finally {
      setDuplicating(false);
    }
  };

  if (!isOpen) return null;

  const canDuplicate = selectedCategoryPaths.size > 0;

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
          שכפול מוצר
        </h4>
        <p className="text-center text-gray-500 text-sm mb-6">
          <strong className="text-slate-700">{productName}</strong>
        </p>

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
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gray-100">
                      <FolderOpen size={15} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
                      <p className="text-xs text-gray-400 truncate">
                        <PathDisplay path={path} />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-1">בחר קטגוריות יעד</p>
          <p className="text-xs text-gray-400 mb-3">
            המוצר יישאר במיקומים הקיימים וגם יתווסף לקטגוריות שתבחר
          </p>

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
                placeholder="חפש קטגוריה..."
                className="flex-1 outline-none text-sm text-gray-700 bg-transparent text-right placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
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
                    const alreadyHere = isCurrentPath(cat.categoryPath);
                    const isChecked = selectedCategoryPaths.has(cat.categoryPath);
                    return (
                      <button
                        key={cat._id}
                        onClick={() => !alreadyHere && toggleSelection(cat)}
                        disabled={alreadyHere}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-right transition-colors
                          ${alreadyHere ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50 cursor-pointer"}
                          ${isChecked ? "bg-slate-50" : ""}`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                            ${alreadyHere
                              ? "border-gray-300 bg-gray-100"
                              : isChecked
                                ? "border-slate-700 bg-slate-700"
                                : "border-gray-300"
                            }`}
                        >
                          {(isChecked || alreadyHere) && (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          )}
                        </div>
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
                              <span className="mr-1.5 text-xs text-amber-500">(כבר קיים)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{cat.categoryPath}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {selectedCategories.length > 0 && (
            <div className="mt-3 border-2 border-slate-700 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">קטגוריות נבחרות</span>
                <span className="text-xs bg-slate-700 text-white rounded-full px-2 py-0.5 font-medium">
                  {selectedCategories.length}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {selectedCategories.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-2 px-3 py-2 bg-white">
                    {cat.categoryImage ? (
                      <img
                        src={cat.categoryImage}
                        alt={cat.categoryName}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <FolderOpen size={11} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{cat.categoryName}</p>
                      <p className="text-xs text-gray-400 truncate">{cat.categoryPath}</p>
                    </div>
                    <button
                      onClick={() => removeSelection(cat.categoryPath)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDuplicate}
            disabled={duplicating || !canDuplicate}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all text-white shadow-sm
              ${duplicating || !canDuplicate
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-md"
              }`}
          >
            {duplicating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                משכפל...
              </>
            ) : (
              <>
                <Copy size={16} />
                שכפל{selectedCategoryPaths.size > 0 ? ` ל-${selectedCategoryPaths.size} קטגוריות` : ""}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={duplicating}
            className="flex-1 p-3 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateProductModal;