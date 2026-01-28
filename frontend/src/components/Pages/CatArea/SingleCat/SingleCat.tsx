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

import AddProductModal from "./AddProductModal/AddProductModal";
import AddSubCategoryModal from "./AddSubCategoryModal/AddSubCategoryModal";
import { handleEntityRouteError } from "../../../../lib/routing/handleEntityRouteError";
import SmartDeleteModal from "../../ProductArea/SmartDeleteModal/SmartDeleteModal";
import DuplicateProductModal from "../../ProductArea/DuplicateProductModal/DuplicateProductModal";

const SingleCat: FC = () => {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<CategoryDTO | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSmartDeleteModal, setShowSmartDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
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
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const location = useLocation();
  const params = useParams();
  const { role, user, id } = useUser();
  const navigate = useNavigate();

  const getCategoryPathFromUrl = () => {
    const wildcardPath = params["*"];
    if (wildcardPath) {
      return `/categories/${wildcardPath}`;
    }

    const pathParts = location.pathname.split("/").filter(Boolean);
    const categoryIndex = pathParts.indexOf("categories");
    if (categoryIndex !== -1 && categoryIndex < pathParts.length - 1) {
      return `/categories/${pathParts.slice(categoryIndex + 1).join("/")}`;
    }

    return "";
  };

  const categoryPath = getCategoryPathFromUrl();

  const pathParts = categoryPath
    .replace("/categories/", "")
    .split("/")
    .filter(Boolean);
  const breadcrumbPath = ["categories", ...pathParts];

  useEffect(() => {
    loadAllContent();
  }, [categoryPath, id]);

  const loadAllContent = async () => {
    try {
      setLoading(true);

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
          image: cat.categoryImage,
          type: "category",
          path: [cat.categoryPath],
          favorite: userFavorites.includes(cat._id),
        }),
      );

      const productItems: DisplayItem[] = products.map((prod: ProductDto) => ({
        id: prod._id!,
        name: prod.productName,
        image: prod.productImages?.[0] ?? "/assets/images/placeholder.png",
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

  const toggleFavorite = async (
    itemId: string,
    name: string,
    type: "product" | "category",
  ) => {
    if (!id) {
      toast.error("יש להתחבר כדי להוסיף למועדפים");
      return;
    }
    const item = items.find((i) => i.id === itemId);
    const previousFavoriteStatus = item?.favorite || false;
    const newFavoriteStatus = !previousFavoriteStatus;
    try {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, favorite: newFavoriteStatus } : i,
        ),
      );
      await userService.toggleFavorite(itemId, type);
      if (newFavoriteStatus) {
        toast.success(`${name} נוסף למועדפים`);
      } else {
        toast.info(`${name} הוסר מהמועדפים`);
      }
    } catch (error) {
      toast.error("שגיאה בעדכון המועדפים");
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, favorite: previousFavoriteStatus } : i,
        ),
      );
    }
  };

  const handleDelete = (item: DisplayItem) => {
    setItemToDelete(item);

    // If it's a product with multiple locations, show smart delete modal
    if (item.type === "product" && item.path.length > 1) {
      setShowSmartDeleteModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeletingItem(true);
      if (itemToDelete.type === "category") {
        await categoriesService.deleteCategory(itemToDelete.id);
        toast.success(`הקטגוריה "${itemToDelete.name}" נמחקה בהצלחה!`);
      } else {
        // Delete from all categories (full delete)
        await ProductsService.deleteProduct(itemToDelete.id);
        toast.success(`המוצר "${itemToDelete.name}" נמחק מכל המיקומים!`);
      }
      setItems(items.filter((item) => item.id !== itemToDelete.id));
      toast.success(
        `${itemToDelete.type === "category" ? "הקטגוריה" : "המוצר"} "${itemToDelete.name
        }" נמחק בהצלחה!`,
      );
    } catch (error) {
      toast.error("שגיאה במחיקה");
    } finally {
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteFromCurrent = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeletingItem(true);
      await ProductsService.deleteProduct(itemToDelete.id, categoryPath);
      toast.success(`המוצר "${itemToDelete.name}" הוסר מקטגוריה זו!`);
      setItems(items.filter((item) => item.id !== itemToDelete.id));
    } catch (error) {
      toast.error("שגיאה במחיקה מקטגוריה זו");
    } finally {
      setIsDeletingItem(false);
      setShowSmartDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteFromAll = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeletingItem(true);
      await ProductsService.deleteProduct(itemToDelete.id);
      toast.success(`המוצר "${itemToDelete.name}" נמחק מכל המיקומים!`);
      setItems(items.filter((item) => item.id !== itemToDelete.id));
    } catch (error) {
      toast.error("שגיאה במחיקה מכל המיקומים");
    } finally {
      setIsDeletingItem(false);
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
    imageFile: File;
  }) => {
    try {
      const safeName =
        data.name.trim().toLowerCase().replace(/\s+/g, "-") || "product";
      const productPathString = `${categoryPath}/${safeName}`;
      const createdProduct = await ProductsService.createProduct({
        productName: data.name,
        productPath: productPathString,
        productDescription: data.description,
        customFields: {},
        imageFile: data.imageFile,
      });

      const newItem: DisplayItem = {
        id: createdProduct._id!,
        name: createdProduct.productName,
        image:
          createdProduct.productImages?.[0] ?? "/assets/images/placeholder.png",
        type: "product",
        path: createdProduct.productPath,
        favorite: false,
        description: createdProduct.productDescription,
      };

      setItems((prev) => [...prev, newItem]);
      toast.success(`המוצר "${data.name}" נוסף בהצלחה!`);
      setShowAddProductModal(false);
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.message || "שגיאה בהוספת המוצר");
    }
  };

  const handleSaveCategory = async (data: {
    name: string;
    imageFile: File;
  }) => {
    try {
      const newCategoryPath = `${categoryPath}/${data.name.toLowerCase().replace(/\s+/g, "-")}`;

      const newCategory = await categoriesService.createCategory({
        categoryName: data.name,
        categoryPath: newCategoryPath,
        imageFile: data.imageFile,
      });

      const newItem: DisplayItem = {
        id: newCategory._id,
        name: newCategory.categoryName,
        image: newCategory.categoryImage,
        type: "category",
        path: [newCategory.categoryPath],
        favorite: false,
      };
      setItems([...items, newItem]);
      toast.success(`הקטגוריה "${data.name}" נוספה בהצלחה!`);
      setShowAddSubCategoryModal(false);
    } catch (error) {
      toast.error("שגיאה בהוספת קטגוריה");
    }
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
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
  };

  const handleManagePermissions = (id: string, type: string) => {
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

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("אנא בחר לפחות פריט אחד למחיקה");
      return;
    }
    setShowDeleteAllModal(true);
  };

  const confirmDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    toast.success(`${selectedItems.length} פריטים נמחקו בהצלחה!`);
    setSelectedItems([]);
    setIsSelectionMode(false);
    setShowDeleteAllModal(false);
  };

  const handleMoveSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("אנא בחר לפחות פריט אחד להעברה");
      return;
    }
    setShowMoveModal(true);
  };

  const confirmMove = (destination: string) => {
    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    toast.success(
      `${selectedItems.length} פריטים הועברו בהצלחה לקטגוריה: ${destination}`,
    );
    setSelectedItems([]);
    setIsSelectionMode(false);
    setShowMoveModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-290 mx-auto rtl mt-28 mr-4 flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <div className="max-w-290 mx-auto rtl mt-28 mr-4">
      <Breadcrumbs path={breadcrumbPath} />
      <header className="flex flex-col items-start mb-10">
        <h1 className="text-[48px] font-light font-alef text-[#0D305B] border-b-4 border-gray-400 pb-1 mb-5 tracking-tight">
          {categoryInfo
            ? categoryInfo.categoryName
            : pathParts[pathParts.length - 1] || "קטגוריה"}
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
      </header>

      {role === "editor" && items.length !== 0 && (
        <div className="mb-6">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="text-base text-gray-700 hover:text-[#0D305B] hover:underline transition-colors"
            >
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
                    onClick={handleDeleteSelected}
                    className="text-base hover:underline text-red-600 hover:text-red-700 transition-colors"
                  >
                    מחיקת ({selectedItems.length})
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

      <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-24">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center p-5 text-center border-b-2 relative transition-all duration-300 hover:-translate-y-1 ${
              selectedItems.includes(item.id)
                ? "bg-[#0D305B]/10 rounded-sm"
                : "border-gray-200"
            } ${!isSelectionMode ? "cursor-pointer" : ""}`}
          >
            <div
              className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full ${
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
                  <button
                    title="שכפול לקטגוריות נוספות"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(item);
                    }}
                    className="absolute bottom-3 right-12 group-hover:opacity-100 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-purple-500 hover:scale-110"
                  >
                    <Copy size={18} />
                  </button>
                )}
                <button
                  title="העברה לקטגוריה אחרת"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(item);
                  }}
                  className="absolute bottom-3 right-3 group-hover:opacity-100 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-blue-500 hover:scale-110"
                >
                  <FolderInput size={18} />
                </button>
                <button
                  title="מחיקה"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  className="absolute bottom-3 left-3 group-hover:opacity-100 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-red-500 hover:scale-110"
                >
                  <Trash size={18} />
                </button>
                {item.type === "category" && (
                  <button
                    title="עריכת קטגוריה"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                    className="absolute bottom-3 left-12 group-hover:opacity-100 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-green-500 hover:scale-110"
                  >
                    <Pen size={18} />
                  </button>
                )}
              </>
            )}

            {!isSelectionMode && (
            <div className="absolute right-3 top-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id, item.name, item.type);
                }}
                className="peer group-hover:opacity-100 transition-all duration-200 h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110"
              >
                <Heart
                  size={22}
                  strokeWidth={2}
                  className={
                    item.favorite
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700"
                  }
                />
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                {item.favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
              </span>
            </div>
          )}
            <div
              className="h-[140px] w-full flex justify-center items-center p-5 cursor-pointer"
              onClick={() => {
                if (item.type === "product") {
                  navigate(`/products/${item.id}`);
                } else {
                  navigate(`${item.path}`);
                }
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105 ${
                  item.type === "category" ? "rounded-full" : ""
                }`}
              />
            </div>

            <div className="w-full text-center pt-4 border-t border-gray-200">
              <h2 className="text-[1.1rem] text-[#0D305B] mb-2">
                {item.name}
              </h2>

              {role === "editor" && !isSelectionMode && (
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManagePermissions(item.id, item.type);
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-[#0D305B] px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:bg-[#16447A] hover:shadow-lg focus:ring-2 focus:ring-[#0D305B]/40"
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
        <div className="fixed bottom-10 left-4 flex flex-col-reverse gap-3 group">
          <button
            className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 z-10"
            title="הוסף"
          >
            <span className="text-3xl font-light transition-transform duration-300 group-hover:rotate-45">
              +
            </span>
          </button>

          <button
            onClick={() => {
              setShowAddProductModal(true);
            }}
            className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100 -translate-y-14 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto relative"
            title="הוסף מוצר"
          >
            <FilePlus2Icon size={24} />
            <span className="absolute left-16 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              הוסף מוצר
            </span>
          </button>

          <button
            onClick={() => {
              setShowAddSubCategoryModal(true);
            }}
            className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100 -translate-y-14 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto relative"
            title="הוסף תת-קטגוריה"
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
            <span className="absolute left-16 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              הוסף תת-קטגוריה
            </span>
          </button>
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

      {role === "editor" && showDeleteModal && itemToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">
              מחיקת {itemToDelete.type === "category" ? "קטגוריה" : "מוצר"}
            </h4>
            <p className="mb-1">
              האם ברצונך למחוק את{" "}
              {itemToDelete.type === "category" ? "הקטגוריה" : "המוצר"} "
              {itemToDelete.name}"?
            </p>
            <small className="text-gray-500">לא יהיה ניתן לבטל פעולה זו</small>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={confirmDelete}
                disabled={isDeletingItem}
                className={`bg-red-600 text-white px-4 py-2 rounded transition-colors
    ${isDeletingItem ? "opacity-70 cursor-not-allowed" : "hover:bg-red-700"}`}
              >
                {isDeletingItem ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4 text-white" />
                    מוחק...
                  </span>
                ) : (
                  "מחיקה"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isDeletingItem}
                className={`bg-gray-300 px-4 py-2 rounded transition-colors
    ${isDeletingItem ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-400"}`}
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
          onDeleteFromCurrent={handleDeleteFromCurrent}
          onDeleteFromAll={handleDeleteFromAll}
          isDeleting={isDeletingItem}
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
            <h4 className="text-lg font-semibold mb-2">מחיקת פריטים נבחרים</h4>
            <p className="mb-1">
              האם ברצונך למחוק {selectedItems.length} פריטים?
            </p>
            <small className="text-red-600 font-medium block">
              אזהרה: פעולה זו תמחק את כל הפריטים הנבחרים ולא ניתן יהיה לשחזר
              אותם!
            </small>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={confirmDeleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
מחיקת הכל              </button>
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
                categoryImage: itemToMove.image,
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
            categoryImage: itemToEdit.image,
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