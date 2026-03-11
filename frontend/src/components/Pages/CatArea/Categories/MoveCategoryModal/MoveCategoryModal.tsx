import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../../services/CategoryService";
import { Category } from "../Categories";
import { MoveRight, ChevronLeft, Search } from "lucide-react";

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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedParentPath, setSelectedParentPath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState<
    Record<string, Category[]>
  >({});
  const [loadingSubcats, setLoadingSubcats] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getCurrentParentPath = (): string => {
    const parts = category.categoryPath.split("/");
    parts.pop();
    return parts.join("/");
  };

  const currentParentPath = getCurrentParentPath();

  useEffect(() => {
    if (isOpen) {
      loadAllCategoriesRecursively();
      setSelectedParentPath("");
      setExpandedCategories(new Set());
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setExpandedCategories(new Set());
      return;
    }
    const q = searchQuery.toLowerCase();
    const pathsToExpand = new Set<string>();

    const collectMatchingPaths = (cats: Category[]) => {
      for (const cat of cats) {
        const childrenMatch = checkDescendantsMatch(cat.categoryPath, q);
        if (childrenMatch) pathsToExpand.add(cat.categoryPath);
        const subcats = subcategoriesCache[cat.categoryPath] || [];
        if (subcats.length > 0) collectMatchingPaths(subcats);
      }
    };

    collectMatchingPaths(allCategories);
    setExpandedCategories(pathsToExpand);
  }, [searchQuery, subcategoriesCache, allCategories]);

  const checkDescendantsMatch = (categoryPath: string, q: string): boolean => {
    const subcats = subcategoriesCache[categoryPath] || [];
    for (const subcat of subcats) {
      if (subcat.categoryName.toLowerCase().includes(q)) return true;
      if (checkDescendantsMatch(subcat.categoryPath, q)) return true;
    }
    return false;
  };

  const matchesSearch = (cat: Category): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (cat.categoryName.toLowerCase().includes(q)) return true;
    return checkDescendantsMatch(cat.categoryPath, q);
  };

  const loadAllCategoriesRecursively = async () => {
    try {
      setLoading(true);
      const mainCategories = await categoriesService.getCategories();

      const filteredCategories = mainCategories.filter((cat) => {
        if (cat._id === category._id) return false;
        if (cat.categoryPath.startsWith(category.categoryPath + "/"))
          return false;
        return true;
      });

      setAllCategories(filteredCategories);

      await Promise.all(
        filteredCategories.map((cat) =>
          loadAllSubcategoriesRecursively(cat.categoryPath),
        ),
      );
    } catch (error) {
      toast.error("שגיאה בטעינת קטגוריות");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubcategoriesRecursively = async (
    categoryPath: string,
    showToastOnFail: boolean = false,
  ): Promise<void> => {
    if (subcategoriesCache[categoryPath]) {
      return;
    }

    try {
      const subcats = await categoriesService.getDirectChildren(categoryPath);

      const filteredSubcats = subcats.filter((cat) => {
        if (cat._id === category._id) return false;
        if (cat.categoryPath.startsWith(category.categoryPath + "/"))
          return false;
        return true;
      });

      setSubcategoriesCache((prev) => ({
        ...prev,
        [categoryPath]: filteredSubcats,
      }));

      await Promise.all(
        filteredSubcats.map((subcat) =>
          loadAllSubcategoriesRecursively(subcat.categoryPath),
        ),
      );
    } catch (error) {
      if (showToastOnFail)
        toast.error("שגיאה בטעינת תתי-קטגוריות");
      console.error("Error loading subcategories:", error);
    }
  };

  const toggleCategory = async (categoryPath: string) => {
    const newExpanded = new Set(expandedCategories);

    if (newExpanded.has(categoryPath)) {
      newExpanded.delete(categoryPath);
    } else {
      newExpanded.add(categoryPath);

      if (!subcategoriesCache[categoryPath]) {
        setLoadingSubcats((prev) => new Set(prev).add(categoryPath));
        await loadAllSubcategoriesRecursively(categoryPath, true);
        setLoadingSubcats((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryPath);
          return newSet;
        });
      }
    }

    setExpandedCategories(newExpanded);
  };

  const renderCategory = (cat: Category, level: number = 0) => {
    if (!matchesSearch(cat)) return null;

    const subcats = subcategoriesCache[cat.categoryPath] || [];
    const hasSubcats = subcats.length > 0;
    const isExpanded = expandedCategories.has(cat.categoryPath);
    const isLoading = loadingSubcats.has(cat.categoryPath);
    const isCurrentParent = cat.categoryPath === currentParentPath;
    const nameMatch = searchQuery.trim() && cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={cat._id} style={{ paddingRight: `${level * 20}px` }}>
        <label
          className={`flex items-center gap-2 p-3 border-2 rounded-lg ${isCurrentParent ? "" : "cursor-pointer hover:bg-gray-50"
            } transition-all mb-0 ${selectedParentPath === cat.categoryPath
              ? "border-slate-700 bg-slate-50"
              : isCurrentParent
                ? "border-amber-400 bg-amber-50"
                : "border-gray-200"
            }`}
        >
          {hasSubcats && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCategory(cat.categoryPath);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-slate-700 rounded-full animate-spin" />
              ) : (
                <ChevronLeft
                  size={16}
                  className={`transition-transform ${isExpanded ? "-rotate-90" : ""}`}
                />
              )}
            </button>
          )}

          {!isCurrentParent && (
            <input
              type="radio"
              name="destination"
              value={cat.categoryPath}
              checked={selectedParentPath === cat.categoryPath}
              onChange={(e) => setSelectedParentPath(e.target.value)}
              className="w-4 h-4"
              disabled={loading}
            />
          )}

          <div className="flex items-center gap-2 flex-1">
            {cat.categoryImage && (
              <img
                src={cat.categoryImage}
                alt={cat.categoryName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="text-right">
              <p className="font-medium">
                {nameMatch ? (
                  <span>
                    {cat.categoryName.split(new RegExp(`(${searchQuery})`, "gi")).map((part, i) =>
                      part.toLowerCase() === searchQuery.toLowerCase()
                        ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
                        : part
                    )}
                  </span>
                ) : (
                  cat.categoryName
                )}
                {isCurrentParent && (
                  <span className="mr-2 text-xs text-amber-600 font-semibold">
                    (קיים כאן)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">{cat.categoryPath}</p>
            </div>
          </div>
        </label>

        {isExpanded && hasSubcats && (
          <div className="mt-1">
            {subcats.map((subcat) => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleMove = async () => {
    if (!selectedParentPath) {
      toast.error("נא לבחור קטגוריית יעד");
      return;
    }

    try {
      setLoading(true);
      await categoriesService.moveCategory(category._id, selectedParentPath);
      toast.success(`${category.categoryName} הועבר בהצלחה!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "שגיאה בהעברת הפריט");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300 p-4"
    >
      <div
        className="bg-white rounded-xl w-[600px] max-w-[95%] max-h-[90vh] shadow-2xl text-center relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 p-8 pb-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            aria-label="סגור"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
            העבר תת-קטגוריה
          </h4>

          <div className="text-right mb-6">
            <p className="text-gray-700 mb-2">
              מעביר: <strong>{category.categoryName}</strong>
            </p>
            <p className="text-sm text-gray-500">
              נתיב נוכחי: {category.categoryPath}
            </p>
          </div>

          <div className="text-right mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              נא לבחור קטגוריית יעד (קטגוריה ראשית או תת-קטגוריה):
            </label>
            <small>שימו לב! התוכן תחת אותה קטגוריה יעבור איתה למיקום הנבחר</small>

            <div className="relative mt-2 mb-2">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש קטגוריה..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 text-right"
                dir="rtl"
              />
            </div>

            {loading && allCategories.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-slate-700 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto overflow-x-hidden border border-gray-200 rounded-lg p-2">
                {allCategories.length === 0 ? (
                  <p className="text-gray-500 p-4">אין קטגוריות זמינות</p>
                ) : (
                  allCategories.map((cat) => (
                    <div key={cat._id} className="mb-3">
                      {renderCategory(cat)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4 rounded-b-xl flex justify-between gap-3">
          <button
            onClick={handleMove}
            disabled={loading || !selectedParentPath}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${loading || !selectedParentPath
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-lg"
              }`}
          >
            <MoveRight size={18} />
            {loading ? "מעביר..." : "העבר"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveCategoryModal;