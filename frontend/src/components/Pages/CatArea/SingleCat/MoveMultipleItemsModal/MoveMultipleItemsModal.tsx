import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesService } from "./../../../../../services/CategoryService";
import { ProductsService } from "./../../../../../services/ProductService";
import { MoveRight, ChevronLeft, Package, Folder } from "lucide-react";
import { CategoryDTO } from "./../../../../../components/models/category.models";
import { DisplayItem } from "./../../../../../components/models/item.models";

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
  const [allCategories, setAllCategories] = useState<CategoryDTO[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [destinationCategoryPath, setDestinationCategoryPath] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState<Record<string, CategoryDTO[]>>(
    {}
  );
  const [loadingSubcats, setLoadingSubcats] = useState<Set<string>>(new Set());

  const products = selectedItems.filter((item) => item.type === "product");
  const categories = selectedItems.filter((item) => item.type === "category");

  const getCurrentPaths = (): Set<string> => {
    const paths = new Set<string>();
    
    products.forEach((product) => {
      product.path.forEach((fullPath) => {
        const parts = fullPath.split("/");
        parts.pop(); 
        const categoryPath = parts.join("/");
        if (categoryPath) {
          paths.add(categoryPath);
        }
      });
    });
    
    categories.forEach((category) => {
      const categoryPath = category.path[0];
      const parts = categoryPath.split("/");
      parts.pop(); 
      const parentPath = parts.join("/");
      if (parentPath) {
        paths.add(parentPath);
      }
    });
    
    return paths;
  };

  const currentPaths = getCurrentPaths();

  useEffect(() => {
    if (isOpen) {
      loadAllCategoriesRecursively();
      setDestinationCategoryPath("");
      setExpandedCategories(new Set());
    }
  }, [isOpen]);

  const loadAllCategoriesRecursively = async () => {
    try {
      setLoading(true);
      const mainCategories = await categoriesService.getCategories();

      const selectedCategoryIds = categories.map((cat) => cat.id);
      const selectedCategoryPaths = categories.map((cat) => cat.path[0]);

      const filteredCategories = mainCategories.filter((cat) => {
        if (selectedCategoryIds.includes(cat._id)) return false;
        
        for (const selectedPath of selectedCategoryPaths) {
          if (cat.categoryPath.startsWith(selectedPath + "/")) return false;
        }
        
        return true;
      });

      setAllCategories(filteredCategories);

      await Promise.all(
        filteredCategories.map((cat) =>
          loadAllSubcategoriesRecursively(cat.categoryPath)
        )
      );
    } catch (error) {
      toast.error("שגיאה בטעינת קטגוריות");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubcategoriesRecursively = async (
    categoryPath: string
  ): Promise<void> => {
    if (subcategoriesCache[categoryPath]) {
      return;
    }

    try {
      const subcats = await categoriesService.getDirectChildren(categoryPath);

      const selectedCategoryIds = categories.map((cat) => cat.id);
      const selectedCategoryPaths = categories.map((cat) => cat.path[0]);

      const filteredSubcats = subcats.filter((cat) => {
        if (selectedCategoryIds.includes(cat._id)) return false;
        
        for (const selectedPath of selectedCategoryPaths) {
          if (cat.categoryPath.startsWith(selectedPath + "/")) return false;
        }
        
        return true;
      });

      setSubcategoriesCache((prev) => ({
        ...prev,
        [categoryPath]: filteredSubcats,
      }));

      await Promise.all(
        filteredSubcats.map((subcat) =>
          loadAllSubcategoriesRecursively(subcat.categoryPath)
        )
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

  const renderCategory = (cat: CategoryDTO, level: number = 0) => {
    const subcats = subcategoriesCache[cat.categoryPath] || [];
    const hasSubcats = subcats.length > 0;
    const isExpanded = expandedCategories.has(cat.categoryPath);
    const isLoading = loadingSubcats.has(cat.categoryPath);
    
    const isCurrentPath = currentPaths.has(cat.categoryPath);

    return (
      <div key={cat._id} style={{ marginRight: `${level * 20}px` }}>
        <label
          className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all mb-2 ${
            destinationCategoryPath === cat.categoryPath
              ? "border-slate-700 bg-slate-50"
              : isCurrentPath
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

          <input
            type="radio"
            name="destination"
            value={cat.categoryPath}
            checked={destinationCategoryPath === cat.categoryPath}
            onChange={(e) => setDestinationCategoryPath(e.target.value)}
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
              <p className="font-medium">
                {cat.categoryName}
                {isCurrentPath && (
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
          <div className="mr-4">
            {subcats.map((subcat) => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleMove = async () => {
    if (!destinationCategoryPath) {
      toast.error("אנא בחר קטגוריית יעד");
      return;
    }

    try {
      setLoading(true);

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
        toast.warning(
          `${successCount} פריטים הועברו בהצלחה, ${failCount} נכשלו`
        );
        if (errors.length > 0) {
          console.error("Move errors:", errors);
        }
        onSuccess();
        onClose();
      } else {
        toast.error("כל הפריטים נכשלו בהעברה");
        if (errors.length > 0) {
          console.error("Move errors:", errors);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "שגיאה בהעברת הפריטים";
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
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="bg-white p-8 rounded-xl w-[600px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
          העבר פריטים מרובים
        </h4>

        <div className="text-right mb-6">
          <p className="text-gray-700 mb-3 font-medium">
            מעביר {selectedItems.length} פריטים:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {products.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <Package size={16} />
                  מוצרים ({products.length}):
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mr-6">
                  {products.map((item) => (
                    <li key={item.id} className="truncate">
                      • {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {categories.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Folder size={16} />
                  קטגוריות ({categories.length}):
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mr-6">
                  {categories.map((item) => (
                    <li key={item.id} className="truncate">
                      • {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="text-right mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            בחר קטגוריית יעד:
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
                allCategories.map((cat) => renderCategory(cat, 0))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleMove}
            disabled={loading || !destinationCategoryPath}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${
              loading || !destinationCategoryPath
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-lg"
            }`}
          >
            <MoveRight size={18} />
            {loading ? "מעביר..." : `העבר ${selectedItems.length} פריטים`}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveMultipleItemsModal;