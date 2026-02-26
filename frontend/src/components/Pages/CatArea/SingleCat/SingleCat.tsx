/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useState, ChangeEvent, useEffect } from "react";
import {
  Heart,
  Lock,
  Trash,
  Pen,
  PackageCheck,
  Boxes,
  FolderInput,
  Copy,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";
import { ProductsService } from "../../../../services/ProductService";
import { categoriesService } from "../../../../services/CategoryService";
import { FilePlus2Icon } from "lucide-react";
import { CategoryDTO } from "../../../../components/models/category.models";
import { DisplayItem } from "../../../../components/models/item.models";
import { ProductDto } from "../../../../components/models/product.models";
import MoveProductModal from "../../ProductArea/MoveProductModal/MoveProductModal";
import MoveCategoryModal from "../../CatArea/Categories/MoveCategoryModal/MoveCategoryModal";
import EditCategoryModal from "../../CatArea/Categories/EditCategoryModal/EditCategoryModal/EditCategoryModal";
import { userService } from "../../../../services/UserService";
import { Spinner } from "../../../../components/ui/spinner";
import { recycleBinService } from "../../../../services/RecycleBinService";
import AddProductModal from "./AddProductModal/AddProductModal";
import AddSubCategoryModal from "./AddSubCategoryModal/AddSubCategoryModal";
import { handleEntityRouteError } from "../../../../lib/routing/handleEntityRouteError";
import SmartDeleteModal from "../../ProductArea/SmartDeleteModal/SmartDeleteModal";
import DuplicateProductModal from "../../ProductArea/DuplicateProductModal/DuplicateProductModal";
import MoveMultipleItemsModal from "./MoveMultipleItemsModal/MoveMultipleItemsModal";
import { usePath } from "../../../../context/PathContext";
import ImagePreviewHover from "../../ProductArea/ImageCarousel/ImageCarousel/ImagePreviewHover";
import { useDebouncedFavorite } from "../../../../hooks/useDebouncedFavorite";
import { truncateDisplay } from "../../../../lib/utils";
import { environment } from "../../../../environments/environment";

const hasImage = (images: any): boolean => {
  if (!images) return false;
  if (typeof images === "string") return images.trim().length > 0;
  if (Array.isArray(images)) return images.length > 0 && !!images[0];

  return false;
};

const NoImageCard: React.FC<{ label?: string }> = ({ label = "אין תמונה" }) => {
  return (
    <div className="h-full w-[75%] mx-auto flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-white/40">
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
};

const SingleCat: FC = () => {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<CategoryDTO | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [showMoveToRecycleBinModal, setShowMoveToRecycleBinModal] =
    useState(false);
  const [showCategoryMoveChoice, setShowCategoryMoveChoice] = useState(false);
  const [categoryMoveStrategyLoading, setCategoryMoveStrategyLoading] =
    useState<"cascade" | "move_up" | null>(null);
  const [showSmartDeleteModal, setShowSmartDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showMoveMultipleModal, setShowMoveMultipleModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayItem | null>(null);
  const [itemToMove, setItemToMove] = useState<DisplayItem | null>(null);
  const [itemToDuplicate, setItemToDuplicate] = useState<DisplayItem | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<DisplayItem | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isMovingToRecycleBin, setIsMovingToRecycleBin] = useState(false);
  const [hasDescendantsForMove, setHasDescendantsForMove] = useState<
    boolean | null
  >(null);
  const [showFabButtons, setShowFabButtons] = useState(false);

  const location = useLocation();
  const params = useParams();
  const { role, user, id } = useUser();
  const navigate = useNavigate();
  const { setPreviousPath } = usePath();

  const getCategoryPathFromUrl = () => {
    const wildcardPath = params["*"];
    if (wildcardPath) {
      return `/categories/${decodeURIComponent(wildcardPath)}`;
    }

    const pathParts = location.pathname.split("/").filter(Boolean);
    const categoryIndex = pathParts.indexOf("categories");
    if (categoryIndex !== -1 && categoryIndex < pathParts.length - 1) {
      const encodedParts = pathParts.slice(categoryIndex + 1);
      const decodedParts = encodedParts.map((part) => decodeURIComponent(part));
      return `/categories/${decodedParts.join("/")}`;
    }

    return "";
  };
  const categoryPath = getCategoryPathFromUrl();

  const breadcrumbPathParts = categoryPath
    .replace("/categories/", "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " "));
  const categoryPathSegments = categoryPath
    .replace("/categories/", "")
    .split("/")
    .filter(Boolean);

  const breadcrumbPath = ["categories", ...categoryPathSegments];

  useEffect(() => {
    loadAllContent();
  }, [categoryPath, id]);

  useEffect(() => {
    setPreviousPath(categoryPath);
  }, [categoryPath, setPreviousPath]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showFabButtons) {
      timer = setTimeout(() => {
        setShowFabButtons(false);
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showFabButtons]);

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedItems([]);
  }, [categoryPath]);

  const loadAllContent = async () => {
    try {
      setLoading(true);

      try {
        const currentCategory =
          await categoriesService.getCategoryByPath(categoryPath);
        setCategoryInfo(currentCategory);
      } catch (err) {
        console.error("Error fetching category info:", err);
        setCategoryInfo(null);
      }

      let subCategories: CategoryDTO[] = [];
      try {
        subCategories = await categoriesService.getDirectChildren(categoryPath);
      } catch (err) {
        if (handleEntityRouteError(err, navigate)) return;
        console.error(err);
        toast.error("שגיאה בטעינת תתי-קטגוריות");
        subCategories = [];
      }

      let products: ProductDto[] = [];
      try {
        products = await ProductsService.getProductsByPath(categoryPath);
      } catch (err) {
        if (handleEntityRouteError(err, navigate)) {
          setLoading(false);
          return;
        }

        console.error(err);
        toast.error("שגיאה בטעינת מוצרים");
        products = [];
      }

      let userFavorites: string[] = [];
      if (id) {
        try {
          const favorites = await userService.getFavorites();
          userFavorites = favorites.map((fav: any) => fav.id.toString());
        } catch (err) {}
      }

      const categoryItems: DisplayItem[] = subCategories.map(
        (cat: CategoryDTO) => ({
          id: cat._id,
          name: cat.categoryName,
          images: cat.categoryImage,
          type: "category",
          path: [cat.categoryPath],
          favorite: userFavorites.includes(cat._id),
        }),
      );

      const productItems: DisplayItem[] = products.map((prod: ProductDto) => ({
        id: prod._id!,
        name: prod.productName,
        images: prod.productImages || [],
        type: "product",
        path: Array.isArray(prod.productPath)
          ? prod.productPath
          : [prod.productPath],
        description: prod.productDescription,
        customFields: prod.customFields,
        favorite: userFavorites.includes(prod._id!),
      }));

      setItems([...categoryItems, ...productItems]);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בטעינת התוכן");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: DisplayItem) => {
    setItemToEdit(item);
    setShowEditModal(true);
  };

  const handleEditSuccess = async (updatedCategory: any) => {
    try {
      const result = await categoriesService.updateCategory(
        updatedCategory._id,
        {
          categoryName: updatedCategory.categoryName,
          categoryPath: updatedCategory.categoryPath,
          imageFile: updatedCategory.imageFile,
        },
      );
      await loadAllContent();
      setShowEditModal(false);
      setItemToEdit(null);
      toast.success(`הקטגוריה "${result.categoryName}" עודכנה בהצלחה!`);
    } catch (error) {
      toast.error("שגיאה בעדכון הקטגוריה");
    }
  };

  const handleItemClick = (item: DisplayItem) => {
    if (isSelectionMode) return;

    const path = item.path[0];
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    if (item.type === "category") {
      navigate(cleanPath);
    } else {
      navigate(`/products/${item.id}`);
    }
  };

  const toggleFavorite = useDebouncedFavorite(items, setItems, 500);

  const handleMoveToRecycleBin = (item: DisplayItem) => {
    setItemToDelete(item);

    if (item.type === "product" && item.path.length > 1) {
      setShowSmartDeleteModal(true);
      return;
    }

    if (item.type === "category") {
      (async () => {
        try {
          const hasDesc = await categoriesService.hasDescendants(item.id);
          setHasDescendantsForMove(hasDesc);

          if (hasDesc) {
            setShowCategoryMoveChoice(true);
          } else {
            setShowMoveToRecycleBinModal(true);
          }
        } catch (e) {
          setHasDescendantsForMove(true);
          setShowCategoryMoveChoice(true);
        }
      })();

      return;
    }
    setShowMoveToRecycleBinModal(true);
  };

  const confirmMoveToRecycleBin = async () => {
    if (!itemToDelete) return;

    try {
      setIsMovingToRecycleBin(true);

      if (itemToDelete.type === "category") {
        await recycleBinService.moveCategoryToRecycleBin(
          itemToDelete.id,
          "cascade",
        );
        toast.success(`הקטגוריה "${itemToDelete.name}" הועברה לסל המיחזור!`);
      } else {
        await recycleBinService.moveProductToRecycleBin(itemToDelete.id);
        toast.success(`המוצר "${itemToDelete.name}" הועבר לסל המיחזור!`);
      }

      await loadAllContent();
    } catch (error) {
      toast.error("שגיאה בהעברה לסל המיחזור");
    } finally {
      setIsMovingToRecycleBin(false);
      setShowMoveToRecycleBinModal(false);
      setItemToDelete(null);
    }
  };

  const handleRemoveFromCurrent = async () => {
    if (!itemToDelete) return;
    try {
      setIsMovingToRecycleBin(true);

      await recycleBinService.moveProductToRecycleBin(
        itemToDelete.id,
        categoryPath,
      );

      toast.success(`המוצר "${itemToDelete.name}" הוסר מקטגוריה זו!`);
      setItems(items.filter((item) => item.id !== itemToDelete.id));
    } catch (error) {
      toast.error("שגיאה בהסרה מקטגוריה זו");
    } finally {
      setIsMovingToRecycleBin(false);
      setShowSmartDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleMoveAllToRecycleBin = async () => {
    if (!itemToDelete) return;
    try {
      setIsMovingToRecycleBin(true);

      await recycleBinService.moveProductToRecycleBin(itemToDelete.id);

      toast.success(`המוצר "${itemToDelete.name}" הועבר לסל המיחזור!`);
      setItems(items.filter((item) => item.id !== itemToDelete.id));
    } catch (error) {
      toast.error("שגיאה בהעברה לסל המיחזור");
    } finally {
      setIsMovingToRecycleBin(false);
      setShowSmartDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleRemoveFromSpecificPaths = async (paths: string[]) => {
    if (!itemToDelete) return;
    try {
      setIsMovingToRecycleBin(true);
      await ProductsService.deleteFromSpecificPaths(itemToDelete.id, paths);

      const stillInCurrentCategory = paths.every(
        (path) => !path.startsWith(categoryPath),
      );

      if (!stillInCurrentCategory) {
        setItems(items.filter((item) => item.id !== itemToDelete.id));
      }

      toast.success(
        `המוצר "${itemToDelete.name}" הוסר מ-${paths.length} מיקום${paths.length > 1 ? "ים" : ""}!`,
      );
    } catch (error) {
      toast.error("שגיאה בהסרה מהמיקומים הנבחרים");
    } finally {
      setIsMovingToRecycleBin(false);
      setShowSmartDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleMove = (item: DisplayItem) => {
    setItemToMove(item);
    setShowMoveModal(true);
  };

  const handleMoveSuccess = async () => {
    await loadAllContent();
    setShowMoveModal(false);
    setItemToMove(null);
  };

  const confirmCategoryMove = async (strategy: "cascade" | "move_up") => {
    if (!itemToDelete) return;

    try {
      setIsMovingToRecycleBin(true);
      setCategoryMoveStrategyLoading(strategy);

      await recycleBinService.moveCategoryToRecycleBin(
        itemToDelete.id,
        strategy,
      );

      await loadAllContent();

      toast.success(
        strategy === "cascade"
          ? `הקטגוריה "${itemToDelete.name}" הועברה לסל המיחזור!`
          : `הקטגוריה "${itemToDelete.name}" הועברה לסל המיחזור והתכנים הועברו שכבה אחת למעלה!`,
      );
    } catch (error) {
      toast.error("שגיאה בהעברת הקטגוריה לסל המיחזור");
    } finally {
      setIsMovingToRecycleBin(false);
      setCategoryMoveStrategyLoading(null);
      setShowCategoryMoveChoice(false);
      setHasDescendantsForMove(null);
      setItemToDelete(null);
    }
  };

  const handleDuplicate = (item: DisplayItem) => {
    setItemToDuplicate(item);
    setShowDuplicateModal(true);
  };

  const handleDuplicateSuccess = async () => {
    await loadAllContent();
    setShowDuplicateModal(false);
    setItemToDuplicate(null);
  };

  const handleSaveProduct = async (data: {
    name: string;
    description: string;
    imageFile?: File;
    allowAll: boolean;
  }) => {
    try {
      const productPathString = categoryPath;
      const createdProduct = await ProductsService.createProduct({
        productName: data.name,
        productPath: productPathString,
        productDescription: data.description,
        customFields: {},
        imageFile: data.imageFile,
        allowAll: data.allowAll,
      });

      const newItem: DisplayItem = {
        id: createdProduct._id!,
        name: createdProduct.productName,
        images: createdProduct.productImages || [],
        type: "product",
        path: createdProduct.productPath,
        favorite: false,
        description: createdProduct.productDescription,
      };

      setItems((prev) => [...prev, newItem]);
      toast.success(`המוצר "${data.name}" נוצר בהצלחה!`);
      setShowAddProductModal(false);
    } catch (error: any) {
      console.error("Save Error:", error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        toast.error(serverMessage);
      } else {
        toast.error("שגיאה בהוספת המוצר");
      }
    }
  };

  const handleSaveCategory = async (data: {
    name: string;
    imageFile?: File;
    allowAll: boolean;
  }) => {
    try {
      const newCategoryPath =
        `${categoryPath}/${data.name.trim().toLowerCase().replace(/\s+/g, "-")}`.normalize(
          "NFC",
        );
      const newCategory = await categoriesService.createCategory({
        categoryName: data.name,
        categoryPath: newCategoryPath,
        imageFile: data.imageFile,
        allowAll: data.allowAll,
      });

      const newItem: DisplayItem = {
        id: newCategory._id,
        name: newCategory.categoryName,
        images: newCategory.categoryImage,
        type: "category",
        path: [newCategory.categoryPath],
        favorite: false,
      };
      setItems([...items, newItem]);
      toast.success(`הקטגוריה "${data.name}" נוצרה בהצלחה!`);
      setShowAddSubCategoryModal(false);
    } catch (error) {
      const serverMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error;

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        toast.error(serverMessage);
      } else {
        toast.error("שגיאה בהוספת קטגוריה");
      }
    }
  };

  const closeAllModals = () => {
    setShowMoveToRecycleBinModal(false);
    setShowSmartDeleteModal(false);
    setItemToDelete(null);
    setShowAddProductModal(false);
    setShowAddSubCategoryModal(false);
    setShowDeleteAllModal(false);
    setShowMoveModal(false);
    setItemToMove(null);
    setShowDuplicateModal(false);
    setItemToDuplicate(null);
    setShowEditModal(false);
    setItemToEdit(null);
    setShowMoveMultipleModal(false);
    setShowCategoryMoveChoice(false);
  };

  const handleManagePermissions = (id: string, type: string) => {
    setPreviousPath(location.pathname);
    navigate(`/permissions/${type}/${id}`);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const handleMoveSelectedToRecycleBin = () => {
    if (selectedItems.length === 0) {
      toast.error("נא לבחור לפחות פריט אחד להעברה לסל מיחזור");
      return;
    }
    setShowDeleteAllModal(true);
  };

  const confirmMoveSelectedToRecycleBin = () => {
    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    toast.success(`${selectedItems.length} פריטים הועברו לסל המיחזור בהצלחה!`);
    setSelectedItems([]);
    setIsSelectionMode(false);
    setShowDeleteAllModal(false);
  };

  const handleMoveSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("נא לבחור לפחות פריט אחד להעברה");
      return;
    }
    setShowMoveMultipleModal(true);
  };

  const handleMoveMultipleSuccess = async () => {
    await loadAllContent();
    setSelectedItems([]);
    setIsSelectionMode(false);
    setShowMoveMultipleModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-290 mx-auto rtl mt-28 mr-4 flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  const selectedItemsData = items.filter((item) =>
    selectedItems.includes(item.id),
  );

  return (
    <div className="max-w-290 mx-auto rtl mt-28 mr-4">
      <Breadcrumbs path={breadcrumbPath} />
      <header className="flex items-center gap-6 mb-10">
        {/* Category Image */}
        {categoryInfo && (
          <img
            src={categoryInfo.categoryImage || "/assets/images/placeholder.png"}
            alt={categoryInfo.categoryName}
            className="w-32 h-32 rounded-full object-cover mt-0 border-0 ring-0 outline-none bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/images/placeholder.png";
            }}
          />
        )}

        {/* Category Title and Stats */}
        <div className="flex flex-col">
          <h1 className="text-[48px] font-light font-alef text-[#0D305B] border-b-4 border-gray-400 pb-1 mb-3 tracking-tight whitespace-normal break-words">
            {" "}
            {categoryInfo
              ? categoryInfo.categoryName
              : breadcrumbPathParts[breadcrumbPathParts.length - 1] ||
                "קטגוריה"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-base">סך הכל פריטים: {items.length}</span>
            <span className="text-gray-400">|</span>
            <span className="text-base">
              קטגוריות: {items.filter((i) => i.type === "category").length}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-base">
              מוצרים: {items.filter((i) => i.type === "product").length}
            </span>
          </div>
        </div>
      </header>

      {role === "editor" && items.length !== 0 && (
        <div className="mb-6">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="flex items-center gap-2 text-sm font-medium text-[#0D305B] border border-[#0D305B] px-4 py-2 rounded hover:bg-[#0D305B] hover:text-white transition-all duration-200 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="4" height="4" rx="1" />
                <rect x="3" y="13" width="4" height="4" rx="1" />
                <line x1="10" y1="7" x2="21" y2="7" />
                <line x1="10" y1="15" x2="21" y2="15" />
              </svg>
              בחירה מרובה
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={selectAllItems}
                className="text-base hover:underline text-gray-700 hover:text-[#0D305B] transition-colors"
              >
                {selectedItems.length === items.length
                  ? "בטל בחירת הכל"
                  : "בחר הכל"}
              </button>
              {selectedItems.length > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleMoveSelectedToRecycleBin}
                    className="text-base hover:underline text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    העברה לסל מיחזור ({selectedItems.length})
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleMoveSelected}
                    className="text-base hover:underline text-gray-700 hover:text-[#0D305B] transition-colors"
                  >
                    העבר ({selectedItems.length})
                  </button>
                </>
              )}
              <span className="text-gray-400">|</span>
              <button
                onClick={toggleSelectionMode}
                className="text-base hover:underline text-gray-700 hover:text-[#0D305B] transition-colors"
              >
                ביטול
              </button>
            </div>
          )}
        </div>
      )}

      <main className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-16">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center p-4 text-center border-b-2 relative transition-all duration-300 hover:-translate-y-1 w-80 ${
              selectedItems.includes(item.id)
                ? "bg-[#0D305B]/10"
                : "border-gray-200"
            } ${!isSelectionMode ? "cursor-pointer" : ""}`}
          >
            <div
              className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium ${
                item.type === "category" ? " text-blue-700" : " text-green-700"
              }`}
            >
              {item.type === "category" ? (
                <>
                  <div className="flex flex-col items-center ">
                    <Boxes />
                    <span>קטגוריה</span>
                  </div>
                </>
              ) : (
                <>
                  <PackageCheck />
                  <span>מוצר</span>
                </>
              )}
            </div>

            {isSelectionMode && role === "editor" && (
              <div className="absolute top-3 right-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="w-6 h-6 cursor-pointer accent-[#0D305B]"
                />
              </div>
            )}

            {role === "editor" && !isSelectionMode && (
              <>
                {item.type === "product" && (
                  <div className="absolute bottom-5 right-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(item);
                      }}
                      className="peer group-hover:opacity-100 h-9 w-9 text-gray-700 flex items-center hover:text-purple-500"
                    >
                      <Copy size={18} />
                    </button>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                      שכפול לקטגוריות נוספות
                    </span>
                  </div>
                )}
                <div className="absolute bottom-5 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(item);
                    }}
                    className="peer group-hover:opacity-100 h-9 w-9 text-gray-700 flex items-center hover:text-blue-500"
                  >
                    <FolderInput size={18} />
                  </button>

                  <span className="absolute -bottom-8 -left-1 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    העברה לקטגוריה אחרת
                  </span>
                </div>
                <div className="absolute bottom-5 left-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToRecycleBin(item);
                    }}
                    className="peer group-hover:opacity-100 h-9 w-9 text-gray-700 flex items-center hover:text-orange-500"
                  >
                    <Trash size={18} />
                  </button>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    העברה לסל מיחזור
                  </span>
                </div>
                {item.type === "category" && (
                  <div className="absolute bottom-5 left-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="peer group-hover:opacity-100 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-green-500"
                    >
                      <Pen size={18} />
                    </button>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                      עריכת קטגוריה
                    </span>
                  </div>
                )}
              </>
            )}

            {!isSelectionMode && (
              <div className="absolute right-3 top-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleFavorite(item.id, item.name, item.type);
                  }}
                  className="peer transition-all duration-200 h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 cursor-pointer"
                >
                  <Heart
                    size={22}
                    strokeWidth={2}
                    className={`pointer-events-none ${item.favorite ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                  />
                </button>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                  {item.favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
                </span>
              </div>
            )}
            <div
              className="h-[140px] w-full flex justify-center items-center p-2 cursor-pointer"
              onClick={() => {
                if (item.type === "product") {
                  setPreviousPath(location.pathname);
                  navigate(`/products/${item.id}`);
                } else {
                  navigate(encodeURI(item.path[0]));
                }
              }}
            >
              {item.type === "category" ? (
                <img
                  src={
                    typeof item.images === "string" && item.images.trim()
                      ? item.images
                      : "/assets/images/placeholder.png"
                  }
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/assets/images/placeholder.png";
                  }}
                />
              ) : hasImage(item.images) ? (
                <div className="h-full w-full flex justify-center items-center">
                  <ImagePreviewHover
                    images={item.images}
                    alt={item.name}
                    className="w-full h-full"
                  />
                </div>
             ) : (
  <img
    src={environment.DEFAULT_PRODUCT_IMAGE_URL}
    alt={item.name}
    className="max-h-full max-w-full object-contain"
    onError={(e) => {
      (e.currentTarget as HTMLImageElement).src =
        environment.DEFAULT_PRODUCT_IMAGE_URL;
    }}
  />
)}
            </div>

            <div className="w-full text-center pt-4 border-t border-gray-200">
              <div className="relative group/tooltip flex justify-center">
                <h2
                  className="text-[1.1rem] text-[#0D305B] mb-2 w-full line-clamp-2"
                  style={{
                    overflowWrap: "anywhere",
                    direction: /[\u0590-\u05FF]/.test(item.name)
                      ? "rtl"
                      : "ltr",
                  }}
                >
                  {truncateDisplay(item.name)}
                </h2>
                {item.name.length > 18 && (
                  <span className="absolute -top-6 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    {item.name}
                  </span>
                )}
              </div>

              {role === "editor" && !isSelectionMode && (
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManagePermissions(item.id, item.type);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-[#0D305B] px-4 py-2 shadow-md transition-all duration-300 hover:bg-[#16447A] hover:shadow-lg focus:ring-2 focus:ring-[#0D305B]/40 border-none rounded"
                  >
                    <Lock size={16} className="text-white" />
                    ניהול הרשאות
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {role === "editor" && !isSelectionMode && (
        <div className="fixed bottom-10 left-4 flex flex-col-reverse gap-3">
          {/* Main Trigger Button - with its own hover group */}
          <div className="group">
            <div className="relative group/main">
              <button className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 z-10">
                <span className="text-3xl font-light p-7">+</span>
              </button>
              <span className="absolute top-1/2 -translate-y-1/2 left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/main:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                הוסף
              </span>
            </div>

            {/* Popup buttons container */}
            <div className="absolute bottom-full left-0 mb-3 flex flex-col-reverse gap-3 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
              {/* Product Button */}
              <div className="relative group/product">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300"
                >
                  <FilePlus2Icon size={24} />
                </button>
                <span className="absolute top-1/2 -translate-y-1/2 left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/product:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                  הוסף מוצר
                </span>
              </div>

              {/* Sub-Category Button */}
              <div className="relative group/subcat">
                <button
                  onClick={() => setShowAddSubCategoryModal(true)}
                  className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300"
                >
                  <svg
                    color="white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2zm-10-8v6m-3-3h6" />
                  </svg>
                </button>
                <span className="absolute top-1/2 -translate-y-1/2 left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/subcat:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                  הוסף תת-קטגוריה
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {role === "editor" && (
        <>
          <AddProductModal
            isOpen={showAddProductModal}
            onClose={() => setShowAddProductModal(false)}
            onSave={handleSaveProduct}
          />
          <AddSubCategoryModal
            isOpen={showAddSubCategoryModal}
            onClose={() => setShowAddSubCategoryModal(false)}
            onSave={handleSaveCategory}
          />
        </>
      )}

      {role === "editor" && showMoveToRecycleBinModal && itemToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 w-full max-w-md rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">העברה לסל מיחזור</h4>
            <p className="mb-1">
              האם ברצונך להעביר את{" "}
              {itemToDelete.type === "category" ? "הקטגוריה" : "המוצר"} "
              {itemToDelete.name}" לסל המיחזור?
            </p>
            <small className="text-blue-600">
              ניתן יהיה לשחזר את הפריט מסל המיחזור
            </small>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={confirmMoveToRecycleBin}
                disabled={isMovingToRecycleBin}
                className={`bg-orange-600 text-white px-4 py-2 rounded transition-colors
    ${isMovingToRecycleBin ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"}`}
              >
                {isMovingToRecycleBin ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4 text-white" />
                    מעביר לסל...
                  </span>
                ) : (
                  "העברה לסל מיחזור"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isMovingToRecycleBin}
                className={`bg-gray-300 px-4 py-2 rounded transition-colors
    ${isMovingToRecycleBin ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-400"}`}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "editor" && showCategoryMoveChoice && itemToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">העברה לסל מיחזור</h4>

            <p className="mb-2">
              מה ברצונך לעשות עם התוכן שבתוך "{itemToDelete.name}"?
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => confirmCategoryMove("cascade")}
                disabled={isMovingToRecycleBin}
                className={`bg-orange-600 text-white px-4 py-2 rounded transition-colors
            ${isMovingToRecycleBin ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"}`}
              >
                {isMovingToRecycleBin &&
                categoryMoveStrategyLoading === "cascade" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-white" />
                    מעביר לסל...
                  </span>
                ) : (
                  "העבר הכל לסל (כולל תכנים)"
                )}
              </button>

              <button
                onClick={() => confirmCategoryMove("move_up")}
                disabled={isMovingToRecycleBin}
                className={`bg-blue-100 text-blue-900 px-4 py-2 rounded transition-colors
    ${isMovingToRecycleBin ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-200"}`}
              >
                {isMovingToRecycleBin &&
                categoryMoveStrategyLoading === "move_up" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-blue-900" />
                    מעביר לסל...
                  </span>
                ) : (
                  "העבר רק קטגוריה (העבר תכנים למעלה)"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isMovingToRecycleBin}
                className={`bg-gray-300 px-4 py-2 rounded transition-colors
            ${isMovingToRecycleBin ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-400"}`}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "editor" && showSmartDeleteModal && itemToDelete && (
        <SmartDeleteModal
          isOpen={showSmartDeleteModal}
          itemName={itemToDelete.name}
          currentPaths={itemToDelete.path}
          currentCategoryPath={categoryPath}
          onClose={closeAllModals}
          onDeleteFromCurrent={handleRemoveFromCurrent}
          onDeleteFromAll={handleMoveAllToRecycleBin}
          onDeleteSelected={handleRemoveFromSpecificPaths}
          isDeleting={isMovingToRecycleBin}
        />
      )}

      {role === "editor" && showDeleteAllModal && isSelectionMode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">
              העברת פריטים לסל מיחזור
            </h4>
            <p className="mb-1">
              האם ברצונך להעביר {selectedItems.length} פריטים לסל המיחזור?
            </p>
            <small className="text-blue-600 font-medium block">
              הפריטים הנבחרים יועברו לסל המיחזור וניתן יהיה לשחזר אותם
            </small>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={confirmMoveSelectedToRecycleBin}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                העברה לסל מיחזור
              </button>
              <button
                onClick={closeAllModals}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {showMoveModal && itemToMove && (
        <>
          {itemToMove.type === "product" ? (
            <MoveProductModal
              isOpen={showMoveModal}
              productId={itemToMove.id}
              productName={itemToMove.name}
              currentPaths={
                Array.isArray(itemToMove.path)
                  ? itemToMove.path
                  : [itemToMove.path || categoryPath]
              }
              currentCategoryPath={categoryPath} 
              onClose={() => {
                setShowMoveModal(false);
                setItemToMove(null);
              }}
              onSuccess={handleMoveSuccess}
            />
          ) : (
            <MoveCategoryModal
              isOpen={showMoveModal}
              category={{
                _id: itemToMove.id,
                categoryName: itemToMove.name,
                categoryPath: itemToMove.path[0],
                categoryImage:
                  itemToMove.images[0] || "/assets/images/placeholder.png",
              }}
              onClose={() => {
                setShowMoveModal(false);
                setItemToMove(null);
              }}
              onSuccess={handleMoveSuccess}
            />
          )}
        </>
      )}

      {showMoveMultipleModal && (
        <MoveMultipleItemsModal
          isOpen={showMoveMultipleModal}
          selectedItems={selectedItemsData}
          onClose={() => setShowMoveMultipleModal(false)}
          onSuccess={handleMoveMultipleSuccess}
        />
      )}

      {showDuplicateModal && itemToDuplicate && (
        <DuplicateProductModal
          isOpen={showDuplicateModal}
          productId={itemToDuplicate.id}
          productName={itemToDuplicate.name}
          currentPaths={
            Array.isArray(itemToDuplicate.path)
              ? itemToDuplicate.path
              : [itemToDuplicate.path || categoryPath]
          }
          onClose={() => {
            setShowDuplicateModal(false);
            setItemToDuplicate(null);
          }}
          onSuccess={handleDuplicateSuccess}
        />
      )}

      {showEditModal && itemToEdit && itemToEdit.type === "category" && (
        <EditCategoryModal
          isOpen={showEditModal}
          category={{
            _id: itemToEdit.id,
            categoryName: itemToEdit.name,
            categoryPath: itemToEdit.path[0],
            categoryImage: Array.isArray(itemToEdit.images)
              ? itemToEdit.images[0]
              : itemToEdit.images,
          }}
          onClose={() => {
            setShowEditModal(false);
            setItemToEdit(null);
          }}
          onSave={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default SingleCat;
