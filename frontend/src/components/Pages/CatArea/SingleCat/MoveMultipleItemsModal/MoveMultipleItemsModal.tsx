import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { categoriesService } from "./../../../../../services/CategoryService";
import { ProductsService } from "./../../../../../services/ProductService";
import { MoveRight, Search, X, FolderOpen, Check, Package, Folder, ChevronDown } from "lucide-react";
import { CategoryDTO } from "./../../../../../components/models/category.models";
import { DisplayItem } from "./../../../../../components/models/item.models";
import { PathDisplay } from "../../../../../components/Pages/SharedComponents/PathDisplay/PathDisplay";

interface MoveMultipleItemsModalProps {
  isOpen: boolean;
  selectedItems: DisplayItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const MoveMultipleItemsModal: React.FC<MoveMultipleItemsModalProps> = ({
  isOpen,
  selectedItems,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CategoryDTO[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [destinationCategoryPath, setDestinationCategoryPath] = useState<string>("");
  const [selectedDestCategory, setSelectedDestCategory] = useState<CategoryDTO | null>(null);
  const [itemsOpen, setItemsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searching, setSearching] = useState(false);
  const [moving, setMoving] = useState(false);

  const products = selectedItems.filter((item) => item.type === "product");
  const categories = selectedItems.filter((item) => item.type === "category");

  const getCurrentPaths = (): Set<string> => {
    const paths = new Set<string>();
    products.forEach((product) => {
      product.path.forEach((fullPath) => {
        const parts = fullPath.split("/");
        parts.pop();
        const categoryPath = parts.join("/");
        if (categoryPath) paths.add(categoryPath);
      });
    });
    categories.forEach((category) => {
      const categoryPath = category.path[0];
      const parts = categoryPath.split("/");
      parts.pop();
      const parentPath = parts.join("/");
      if (parentPath) paths.add(parentPath);
    });
    return paths;
  };

  const currentPaths = getCurrentPaths();

  const productExistsPaths = (): Set<string> => {
    const paths = new Set<string>();
    products.forEach((product) => {
      product.path.forEach((fullPath) => {
        const parts = fullPath.split("/");
        parts.pop();
        const categoryPath = parts.join("/");
        if (categoryPath) paths.add(categoryPath);
      });
    });
    return paths;
  };

  const existingProductPaths = productExistsPaths();
  const selectedCategoryIds = categories.map((cat) => cat.id);
  const selectedCategoryPaths = categories.map((cat) => cat.path[0]);

  useEffect(() => {
    if (isOpen) {
      setDestinationCategoryPath("");
      setSelectedDestCategory(null);
      setSearchQuery("");
      setSearchResults([]);
      setItemsOpen(false);
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
        // Filter out selected categories and their descendants
        setSearchResults(
          results.filter((cat) => {
            if (selectedCategoryIds.includes(cat._id)) return false;
            for (const selectedPath of selectedCategoryPaths) {
              if (cat.categoryPath.startsWith(selectedPath + "/")) return false;
            }
            return true;
          })
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

    try {
      setMoving(true);

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const product of products) {
        try {
          await ProductsService.moveProduct(product.id, [destinationCategoryPath]);
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push(`${product.name}: ${error.message || "שגיאה לא ידועה"}`);
          console.error(`Error moving product ${product.name}:`, error);
        }
      }

      for (const category of categories) {
        try {
          await categoriesService.moveCategory(category.id, destinationCategoryPath);
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push(`${category.name}: ${error.message || "שגיאה לא ידועה"}`);
          console.error(`Error moving category ${category.name}:`, error);
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} פריטים הועברו בהצלחה!`);
        onSuccess();
        onClose();
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`${successCount} פריטים הועברו בהצלחה, ${failCount} נכשלו`);
        if (errors.length > 0) console.error("Move errors:", errors);
        onSuccess();
        onClose();
      } else {
        toast.error("כל הפריטים נכשלו בהעברה");
        if (errors.length > 0) console.error("Move errors:", errors);
      }
    } catch (error: any) {
      toast.error(error.message || "שגיאה בהעברת הפריטים");
      console.error(error);
    } finally {
      setMoving(false);
    }
  };

  if (!isOpen) return null;

  const canMove = !!destinationCategoryPath;

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
          העבר פריטים מרובים
        </h4>
        <p className="text-center text-gray-500 text-sm mb-6">
          <strong className="text-slate-700">{selectedItems.length} פריטים נבחרו</strong>
        </p>

        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setItemsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Package size={14} className="text-emerald-500" />
                  <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium">
                    {products.length} מוצרים
                  </span>
                </div>
              )}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Folder size={14} className="text-blue-500" />
                  <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                    {categories.length} קטגוריות
                  </span>
                </div>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${itemsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {itemsOpen && (
            <div className="flex flex-col divide-y divide-gray-100">
              {products.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                    <Package size={15} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0 relative group">
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-400 truncate">
                      {item.path.map((p, index) => (
                        <span key={p}>
                          <PathDisplay path={p} />
                          {index < item.path.length - 1 && ", "}
                        </span>
                      ))}
                    </p>

                    <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded-md px-3 py-2 top-full mt-1 right-0 z-50 shadow-lg">
                      {item.path.map((p, index) => (
                        <span key={`tooltip-${p}`}>
                          <PathDisplay path={p} />
                          {index < item.path.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {categories.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
                    <Folder size={15} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      <PathDisplay path={item.path[0]} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">בחר קטגוריית יעד</p>

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
                    const isCurrentPath = currentPaths.has(cat.categoryPath);
                    const hasProductHere = existingProductPaths.has(cat.categoryPath);
                    const isSelected = destinationCategoryPath === cat.categoryPath;
                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          if (isCurrentPath) return;
                          setDestinationCategoryPath(cat.categoryPath);
                          setSelectedDestCategory(cat);
                          setSearchQuery(cat.categoryName);
                          setSearchFocused(false);
                        }}
                        disabled={isCurrentPath}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-right transition-colors
                          ${isCurrentPath ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"}
                          ${isSelected ? "bg-slate-50" : ""}`}
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
                            {isCurrentPath && (
                              <span className="mr-1.5 text-xs text-amber-500">(כבר קיים)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            <PathDisplay path={cat.categoryPath} />
                          </p>
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
                העבר {selectedItems.length} פריטים
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

export default MoveMultipleItemsModal;