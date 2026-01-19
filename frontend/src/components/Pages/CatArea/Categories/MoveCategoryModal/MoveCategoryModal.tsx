import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../../services/CategoryService";
import { Category } from "../Categories";
import { MoveRight, ChevronLeft } from "lucide-react";

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedParentPath, setSelectedParentPath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState<Record<string, Category[]>>({});
  const [loadingSubcats, setLoadingSubcats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadAllCategoriesRecursively();
      setSelectedParentPath("");
      setExpandedCategories(new Set());
    }
  }, [isOpen]);

  const loadAllCategoriesRecursively = async () => {
    try {
      setLoading(true);
      const mainCategories = await categoriesService.getCategories();
      
      const filteredCategories = mainCategories.filter((cat) => {
        if (cat._id === category._id) return false;
        if (cat.categoryPath.startsWith(category.categoryPath + "/")) return false;
        return true;
      });

      setAllCategories(filteredCategories);

      await Promise.all(
        filteredCategories.map(cat => loadAllSubcategoriesRecursively(cat.categoryPath))
      );
    } catch (error) {
      toast.error("שגיאה בטעינת קטגוריות");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubcategoriesRecursively = async (categoryPath: string): Promise<void> => {
    if (subcategoriesCache[categoryPath]) {
      return;
    }

    try {
      const subcats = await categoriesService.getDirectChildren(categoryPath);
      
      const filteredSubcats = subcats.filter((cat) => {
        if (cat._id === category._id) return false;
        if (cat.categoryPath.startsWith(category.categoryPath + "/")) return false;
        return true;
      });

      setSubcategoriesCache((prev) => ({
        ...prev,
        [categoryPath]: filteredSubcats,
      }));

      await Promise.all(
        filteredSubcats.map(subcat => loadAllSubcategoriesRecursively(subcat.categoryPath))
      );
    } catch (error) {
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
        setLoadingSubcats(prev => new Set(prev).add(categoryPath));
        await loadAllSubcategoriesRecursively(categoryPath);
        setLoadingSubcats(prev => {
          const newSet = new Set(prev);
          newSet.delete(categoryPath);
          return newSet;
        });
      }
    }
    
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (cat: Category, level: number = 0) => {
    const subcats = subcategoriesCache[cat.categoryPath] || [];
    const hasSubcats = subcats.length > 0;
    const isExpanded = expandedCategories.has(cat.categoryPath);
    const isLoading = loadingSubcats.has(cat.categoryPath);

    return (
      <div key={cat._id} style={{ marginRight: `${level * 20}px` }}>
        <label
          className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all mb-2 ${
            selectedParentPath === cat.categoryPath ? "border-slate-700 bg-slate-50" : "border-gray-200"
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
          
          <input
            type="radio"
            name="destination"
            value={cat.categoryPath}
            checked={selectedParentPath === cat.categoryPath}
            onChange={(e) => setSelectedParentPath(e.target.value)}
            className="w-4 h-4"
            disabled={loading}
          />
          
          <div className="flex items-center gap-2 flex-1">
            {cat.categoryImage && (
              <img
                src={cat.categoryImage}
                alt={cat.categoryName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="text-right">
              <p className="font-medium">{cat.categoryName}</p>
              <p className="text-xs text-gray-500">{cat.categoryPath}</p>
            </div>
          </div>
        </label>

        {isExpanded && hasSubcats && (
          <div className="mr-4">
            {subcats.map((subcat) => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleMove = async () => {
    if (!selectedParentPath) {
      toast.error("אנא בחר קטגוריית יעד");
      return;
    }

    try {
      setLoading(true);
      await categoriesService.moveCategory(category._id, selectedParentPath);
      toast.success(`${category.categoryName} הועבר בהצלחה!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "שגיאה בהעברת תת-הקטגוריה";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
          העבר תת-קטגוריה
        </h4>

        <div className="text-right mb-6">
          <p className="text-gray-700 mb-2">
            מעביר: <strong>{category.categoryName}</strong>
          </p>
          <p className="text-sm text-gray-500">נתיב נוכחי: {category.categoryPath}</p>
        </div>

        <div className="text-right mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            בחר קטגוריית יעד (קטגוריה ראשית או תת-קטגוריה):
          </label>

          {loading && allCategories.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {allCategories.length === 0 ? (
                <p className="text-gray-500 p-4">אין קטגוריות זמינות</p>
              ) : (
                allCategories.map((cat) => renderCategory(cat))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleMove}
            disabled={loading || !selectedParentPath}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${
              loading || !selectedParentPath
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