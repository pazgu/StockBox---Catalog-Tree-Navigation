import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../services/CategoryService";
import { ProductsService } from "../../../../services/ProductService";
import { Copy, ChevronLeft } from "lucide-react";
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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategoryPaths, setSelectedCategoryPaths] = useState<
    Set<string>
  >(new Set());
  const [loading, setLoading] = useState(false);
  const [showPaths, setShowPaths] = React.useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState<
    Record<string, Category[]>
  >({});
  const [loadingSubcats, setLoadingSubcats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadAllCategoriesRecursively();
      setSelectedCategoryPaths(new Set());
      setExpandedCategories(new Set());
    }
  }, [isOpen, currentPaths]);

  const loadAllCategoriesRecursively = async () => {
    try {
      setLoading(true);
      const mainCategories = await categoriesService.getCategories();
      setAllCategories(mainCategories);

      await Promise.all(
        mainCategories.map((cat) =>
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
  ): Promise<void> => {
    if (subcategoriesCache[categoryPath]) {
      return;
    }

    try {
      const subcats = await categoriesService.getDirectChildren(categoryPath);

      setSubcategoriesCache((prev) => ({
        ...prev,
        [categoryPath]: subcats,
      }));

      await Promise.all(
        subcats.map((subcat) =>
          loadAllSubcategoriesRecursively(subcat.categoryPath),
        ),
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
        setLoadingSubcats((prev) => new Set(prev).add(categoryPath));
        await loadAllSubcategoriesRecursively(categoryPath);
        setLoadingSubcats((prev) => {
          const newSet = new Set(prev);
          newSet.delete(categoryPath);
          return newSet;
        });
      }
    }

    setExpandedCategories(newExpanded);
  };

  const handleCheckboxChange = (categoryPath: string, checked: boolean) => {
    const newSelected = new Set(selectedCategoryPaths);

    if (checked) {
      newSelected.add(categoryPath);
    } else {
      newSelected.delete(categoryPath);
    }

    setSelectedCategoryPaths(newSelected);
  };

  const renderCategory = (cat: Category, level: number = 0) => {
    const subcats = subcategoriesCache[cat.categoryPath] || [];
    const hasSubcats = subcats.length > 0;
    const isExpanded = expandedCategories.has(cat.categoryPath);
    const isLoading = loadingSubcats.has(cat.categoryPath);
    const isSelected = selectedCategoryPaths.has(cat.categoryPath);
    const productName = currentPaths[0]?.split("/").pop();
    const isCurrentPath = productName
      ? currentPaths.includes(`${cat.categoryPath}/${productName}`)
      : false;

    return (
      <div key={cat._id} style={{ marginRight: `${level * 20}px` }}>
        <label
          className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all mb-2 ${
            isSelected
              ? "border-blue-600 bg-blue-50"
              : isCurrentPath
                ? "border-orange-400 bg-orange-50 opacity-60"
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
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <ChevronLeft
                  size={16}
                  className={`transition-transform ${isExpanded ? "-rotate-90" : ""}`}
                />
              )}
            </button>
          )}

          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) =>
              handleCheckboxChange(cat.categoryPath, e.target.checked)
            }
            className="w-4 h-4"
            disabled={loading || isCurrentPath}
          />

          <div className="flex items-center gap-2 flex-1 text-right">
            {cat.categoryImage && (
              <img
                src={cat.categoryImage}
                alt={cat.categoryName}
                className="w-7 h-7 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">
                {cat.categoryName}
                {isCurrentPath && (
                  <span className="mr-2 text-xs text-orange-600 font-normal">
                    (כבר קיים)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400"> <PathDisplay path={cat.categoryPath} />           
              </p>
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

  const handleDuplicate = async () => {
    if (selectedCategoryPaths.size === 0) {
      toast.error("נא לבחור לפחות קטגוריית יעד אחת");
      return;
    }

    const pathsArray = Array.from(selectedCategoryPaths);

    try {
      setLoading(true);
      await ProductsService.duplicateProduct(productId, pathsArray);
      toast.success(
        `${productName} שוכפל בהצלחה ל-${pathsArray.length} ${pathsArray.length === 1 ? "קטגוריה" : "קטגוריות"} נוספות!`,
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "שגיאה בשכפול הפריט";
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
        className="bg-white p-8 rounded-xl w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight text-center">
          שכפול מוצר
        </h4>

        <div className="text-right mb-6">
          <p className="text-gray-700 mb-2">
            משכפל: <strong>{productName}</strong>
          </p>
          <p className="text-sm text-gray-500">
            המוצר יישאר במיקומים הקיימים וגם יתווסף לקטגוריות שתבחר
          </p>
        </div>

        <div className="text-right mb-6">
          <div className="relative inline-block text-right">
            <div
              onClick={() => setShowPaths(!showPaths)}
              className="text-xs text-slate-500 cursor-pointer hover:underline"
            >
              מיקומים קיימים ({currentPaths.length}) ▼
            </div>

            {showPaths && (
              <ul className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 min-w-[200px] z-50">
                {currentPaths.map((path, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-gray-600 py-1 border-b last:border-0 truncate"
                    dir="ltr"
                  >
                  <PathDisplay path={path} />           
                   
                  </li>
                ))}
              </ul>
            )}
          </div>
          {loading && allCategories.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {allCategories.length === 0 ? (
                <p className="text-gray-500 p-4 text-center">
                  אין קטגוריות זמינות
                </p>
              ) : (
                allCategories.map((cat) => renderCategory(cat))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={handleDuplicate}
            disabled={loading || selectedCategoryPaths.size === 0}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${
              loading || selectedCategoryPaths.size === 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-lg"
            }`}
          >
            <Copy size={18} />
            {loading ? "משכפל..." : "שכפל"}
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

export default DuplicateProductModal;
