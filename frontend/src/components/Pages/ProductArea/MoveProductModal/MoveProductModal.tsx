import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesService } from "../../../../services/CategoryService";
import { ProductsService } from "../../../../services/ProductService";
import { MoveRight, ChevronLeft } from "lucide-react";
import { Category } from "../../CatArea/Categories/Categories";

interface MoveProductModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  currentPaths: Array<string>;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveProductModal: React.FC<MoveProductModalProps> = ({
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
  const [sourceCategoryPath, setSourceCategoryPath] = useState<string>("");
  const [destinationCategoryPath, setDestinationCategoryPath] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPaths, setShowPaths] = React.useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState<
    Record<string, Category[]>
  >({});
  const [loadingSubcats, setLoadingSubcats] = useState<Set<string>>(new Set());

  const currentCategoryPaths = currentPaths.map((p) => {
    const parts = p.split("/");
    parts.pop();
    return parts.join("/");
  });

  useEffect(() => {
    if (isOpen) {
      loadAllCategoriesRecursively();
      if (currentCategoryPaths.length === 1) {
        setSourceCategoryPath(currentCategoryPaths[0]);
      } else {
        setSourceCategoryPath("");
      }
      setDestinationCategoryPath("");
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

  const renderCategory = (
    cat: Category,
    level: number = 0,
    isSourceSelection: boolean = false,
  ) => {
    const subcats = subcategoriesCache[cat.categoryPath] || [];
    const hasSubcats = subcats.length > 0;
    const isExpanded = expandedCategories.has(cat.categoryPath);
    const isLoading = loadingSubcats.has(cat.categoryPath);
    const isCurrentPath = currentCategoryPaths.includes(cat.categoryPath);

    const productExistsHere = currentCategoryPaths.includes(cat.categoryPath);

    const isSelected = isSourceSelection
      ? sourceCategoryPath === cat.categoryPath
      : destinationCategoryPath === cat.categoryPath;

    if (isSourceSelection && !isCurrentPath) {
      return null;
    }

    return (
      <div key={cat._id} style={{ marginRight: `${level * 20}px` }}>
        <label
          className={`flex items-center gap-2 p-3 border-2 rounded-lg ${
            isCurrentPath && !isSourceSelection
              ? ""
              : "cursor-pointer hover:bg-gray-50"
          } transition-all mb-2 ${
            isSelected
              ? "border-slate-700 bg-slate-50"
              : productExistsHere && !isSourceSelection
                ? "border-amber-400 bg-amber-50"
                : "border-gray-200"
          }`}
        >
          {hasSubcats && !isSourceSelection && (
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

          {!(isCurrentPath && !isSourceSelection) && (
            <input
              type="radio"
              name={isSourceSelection ? "source" : "destination"}
              value={cat.categoryPath}
              checked={isSelected}
              onChange={(e) => {
                if (isSourceSelection) {
                  setSourceCategoryPath(e.target.value);
                } else {
                  setDestinationCategoryPath(e.target.value);
                }
              }}
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
                {cat.categoryName}
                {productExistsHere && !isSourceSelection && (
                  <span className="mr-2 text-xs text-amber-600 font-semibold">
                    (קיים כאן)
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">{cat.categoryPath}</p>
            </div>
          </div>
        </label>

        {isExpanded && hasSubcats && !isSourceSelection && (
          <div className="mr-4">
            {subcats.map((subcat) =>
              renderCategory(subcat, level + 1, isSourceSelection),
            )}
          </div>
        )}
      </div>
    );
  };

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
        setLoading(true);
        await ProductsService.moveProduct(productId, [destinationCategoryPath]);
        toast.success(`${productName} הועבר בהצלחה!`);
        onSuccess();
        onClose();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "שגיאה בהעברת הפריט";
        toast.error(errorMessage);
        console.error(error);
      } finally {
        setLoading(false);
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
        setLoading(true);

        const newPaths = currentCategoryPaths
          .filter((path) => path !== sourceCategoryPath)
          .concat(destinationCategoryPath);

        await ProductsService.moveProduct(productId, newPaths);
        toast.success(
          `${productName} הועבר מ-${sourceCategoryPath.split("/").pop()} ל-${destinationCategoryPath.split("/").pop()}!`,
        );
        onSuccess();
        onClose();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "שגיאה בהעברת הפריט";
        toast.error(errorMessage);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const needsSourceSelection = currentCategoryPaths.length > 1;
  const canMove = needsSourceSelection
    ? sourceCategoryPath &&
      destinationCategoryPath &&
      sourceCategoryPath !== destinationCategoryPath
    : destinationCategoryPath &&
      destinationCategoryPath !== currentCategoryPaths[0];

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300 p-4"
    >
      <div
        className="bg-white p-8 rounded-xl w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
          העבר מוצר
        </h4>

        <div className="text-right mb-6">
          <p className="text-gray-700 mb-2">
            מעביר: <strong>{productName}</strong>
          </p>
          <div className="relative inline-block text-right">
            <div
              onClick={() => setShowPaths(!showPaths)}
              className="text-sm text-gray-500 cursor-pointer hover:underline"
            >
              קיים ב-{currentPaths.length}{" "}
              {currentPaths.length === 1 ? "מיקום" : "מיקומים"}
            </div>

            {showPaths && (
              <ul className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 min-w-[200px] z-50">
                {currentPaths.map((path, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-gray-600 py-1 border-b last:border-0 truncate"
                    dir="ltr"
                  >
                    {path}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {needsSourceSelection && (
          <div className="text-right mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              1️⃣ מאיזו קטגוריה להעביר?
            </label>
            <div className="border border-gray-200 rounded-lg p-2 bg-blue-50">
              {allCategories.map((cat) => renderCategory(cat, 0, true))}
              {allCategories.map((cat) => {
                const subcats = subcategoriesCache[cat.categoryPath] || [];
                return subcats.map((subcat) => renderCategory(subcat, 1, true));
              })}
            </div>
          </div>
        )}

        <div className="text-right mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {needsSourceSelection ? "2️⃣ " : ""}בחר קטגוריית יעד:
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
                allCategories.map((cat) => renderCategory(cat, 0, false))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleMove}
            disabled={loading || !canMove}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${
              loading || !canMove
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

export default MoveProductModal;
