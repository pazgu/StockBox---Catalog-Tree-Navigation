import React, { FC, useState, ChangeEvent, useEffect } from "react";
import { Heart, Pen, Trash } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";
import {
  ProductsService,
  ProductDto,
} from "../../../../services/ProductService";
import {
  categoriesService,
  CategoryDTO,
} from "../../../../services/CategoryService";
import { FilePlus2Icon } from "lucide-react";
interface DisplayItem {
  id: string;
  name: string;
  image: string;
  type: "product" | "category";
  path: string;
  favorite?: boolean;
  description?: string;
  customFields?: any;
}

const SingleCat: FC = () => {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<CategoryDTO | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"product" | "category">("product");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductLens, setNewProductLens] = useState("");
  const [newProductColor, setNewProductColor] = useState("");
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<string | null>(null);

  const location = useLocation();
  const params = useParams();
  const { role } = useUser();
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

    return "/categories/photography/cameras";
  };

  const categoryPath = getCategoryPathFromUrl();

  const pathParts = categoryPath
    .replace("/categories/", "")
    .split("/")
    .filter(Boolean);
  const breadcrumbPath = ["categories", ...pathParts];

  useEffect(() => {
    loadAllContent();
  }, [categoryPath]);

  const loadAllContent = async () => {
    try {
      setLoading(true);

      let subCategories: CategoryDTO[] = [];
      try {
        subCategories = await categoriesService.getDirectChildren(categoryPath);
      } catch (error) {
        subCategories = [];
      }
      let products: ProductDto[] = [];
      try {
        products = await ProductsService.getProductsByPath(categoryPath);
      } catch (error) {
        products = [];
      }
      const categoryItems: DisplayItem[] = subCategories.map(
        (cat: CategoryDTO) => ({
          id: cat._id,
          name: cat.categoryName,
          image: cat.categoryImage,
          type: "category",
          path: cat.categoryPath,
          favorite: false,
        })
      );
      const productItems: DisplayItem[] = products.map((prod: ProductDto) => ({
        id: prod._id!,
        name: prod.productName,
        image: prod.productImage,
        type: "product",
        path: prod.productPath,
        favorite: prod.customFields?.favorite || false,
        description: prod.productDescription,
        customFields: prod.customFields,
      }));
      setItems([...categoryItems, ...productItems]);
    } catch (error) {
      toast.error("שגיאה בטעינת התוכן");
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: DisplayItem) => {
    if (isSelectionMode) return;
    if (item.type === "category") {
      navigate(item.path);
    } else {
      navigate(`/product`);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (modalType === "product") {
          setNewProductImage(reader.result as string);
        } else {
          setNewCategoryImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.favorite) {
      toast.info(`${item.name} הוסר מהמועדפים`);
    } else {
      toast.success(`${item.name} נוסף למועדפים`);
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i))
    );
  };

  const handleDelete = (item: DisplayItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "category") {
        await categoriesService.deleteCategory(itemToDelete.id);
      } else {
      }
      setItems(items.filter((item) => item.id !== itemToDelete.id));
      toast.success(
        `${itemToDelete.type === "category" ? "הקטגוריה" : "המוצר"} "${
          itemToDelete.name
        }" נמחק בהצלחה!`
      );
    } catch (error) {
      toast.error("שגיאה במחיקה");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProductName || !newProductImage) {
      toast.error("אנא מלא את כל השדות החובה");
      return;
    }

    try {
      const productSlug = newProductName.toLowerCase().replace(/\s+/g, "-");
      const fullProductPath = `${categoryPath}/${productSlug}`;

      const newProduct: Omit<ProductDto, "_id" | "createdAt" | "updatedAt"> = {
        productName: newProductName,
        productImage: newProductImage,
        productDescription: newProductLens,
        productPath: fullProductPath,
        customFields: {
          lens: newProductLens,
          color: newProductColor,
          favorite: false,
        },
      };

      const createdProduct = await ProductsService.createProduct(newProduct);

      const newItem: DisplayItem = {
        id: createdProduct._id!,
        name: createdProduct.productName,
        image: createdProduct.productImage,
        type: "product",
        path: createdProduct.productPath,
        favorite: false,
        customFields: createdProduct.customFields,
      };

      setItems([...items, newItem]);
      toast.success(`המוצר "${newProductName}" נוסף בהצלחה!`);
      closeAllModals();
      resetForm();
    } catch (error) {
      toast.error("שגיאה בהוספת המוצר");
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName || !newCategoryImage) {
      toast.error("אנא מלא את כל השדות החובה");
      return;
    }
    try {
      const newCategoryPath = `${categoryPath}/${newCategoryName
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

      const newCategory = await categoriesService.createCategory({
        categoryName: newCategoryName,
        categoryPath: newCategoryPath,
        categoryImage: newCategoryImage,
      });
      const newItem: DisplayItem = {
        id: newCategory._id,
        name: newCategory.categoryName,
        image: newCategory.categoryImage,
        type: "category",
        path: newCategory.categoryPath,
        favorite: false,
      };
      setItems([...items, newItem]);
      toast.success(`הקטגוריה "${newCategoryName}" נוספה בהצלחה!`);
      closeAllModals();
      resetForm();
    } catch (error) {
      toast.error("שגיאה בהוספת קטגוריה");
    }
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setShowAddModal(false);
    setShowDeleteAllModal(false);
    setShowMoveModal(false);
  };

  const resetForm = () => {
    setNewProductName("");
    setNewProductLens("");
    setNewProductColor("");
    setNewProductImage(null);
    setNewCategoryName("");
    setNewCategoryImage(null);
  };

  const handleManagePermissions = () => {
    navigate("/permissions");
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
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
      `${selectedItems.length} פריטים הועברו בהצלחה לקטגוריה: ${destination}`
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
        <div className="text-xs text-gray-400 mt-2">
          Path: {categoryPath} | Info: {categoryInfo?.categoryName || "לא נמצא"}
        </div>
      </header>

      {role === "editor" && items.length !== 0 && (
        <div className="mb-6">
          {!isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="text-base text-gray-700 hover:text-[#0D305B] underline transition-colors"
            >
              בחירה מרובה
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={selectAllItems}
                className="text-base underline text-gray-700 hover:text-[#0D305B] transition-colors"
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
                    className="text-base underline text-red-600 hover:text-red-700 transition-colors"
                  >
                    מחק ({selectedItems.length})
                  </button>

                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleMoveSelected}
                    className="text-base underline text-gray-700 hover:text-[#0D305B] transition-colors"
                  >
                    העבר ({selectedItems.length})
                  </button>
                </>
              )}

              <span className="text-gray-400">|</span>
              <button
                onClick={toggleSelectionMode}
                className="text-base underline text-gray-700 hover:text-[#0D305B] transition-colors"
              >
                ביטול
              </button>
            </div>
          )}
        </div>
      )}

      <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-14">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center p-5 text-center border-b-2 relative transition-all duration-300 hover:-translate-y-1 ${
              selectedItems.includes(item.id)
                ? "border-[#0D305B] ring-2 ring-[#0D305B] ring-opacity-30"
                : "border-gray-200"
            } ${!isSelectionMode ? "cursor-pointer" : ""}`}
            onClick={() => !isSelectionMode && handleItemClick(item)}
          >
            <div
              className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full ${
                item.type === "category"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}
            >
              {item.type === "category" ? "📁 קטגוריה" : "📦 מוצר"}
            </div>
            {/* Selection checkbox */}
            {isSelectionMode && role === "editor" && (
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="w-6 h-6 cursor-pointer accent-[#0D305B]"
                />
              </div>
            )}

            {/* Delete button */}
            {role === "editor" && !isSelectionMode && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  className="absolute top-1 left-1 opacity-1 transform translate-x-3 scale-90 transition-all duration-300 ease-in-out pointer-events-auto h-8 w-8 rounded-full bg-[#e5e7eb] text-gray-800 flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white hover:scale-110"
                >
                  <Trash size={20} />
                </button>
              </div>
            )}

            {!isSelectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <Heart
                  size={22}
                  strokeWidth={2}
                  className={
                    item.favorite ? "fill-red-500 text-red-500" : "text-white"
                  }
                />
              </button>
            )}

            <div className="h-[140px] w-full flex justify-center items-center p-5">
              <img
                src={item.image}
                alt={item.name}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105 ${
                  item.type === "category" ? "rounded-full" : ""
                }`}
              />
            </div>

            <div className="w-full text-center pt-4 border-t border-gray-200">
              <h2 className="text-[1.1rem] text-[#0D305B] mb-2">{item.name}</h2>
              {item.type === "product" && item.customFields && (
                <>
                  {item.customFields.lens && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong className="text-gray-800">עדשה:</strong>{" "}
                      {item.customFields.lens}
                    </p>
                  )}
                  {item.customFields.color && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong className="text-gray-800">צבע:</strong>{" "}
                      {item.customFields.color}
                    </p>
                  )}
                </>
              )}

              {/* Manage permissions button - only for editor*/}
              {role === "editor" && !isSelectionMode && (
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManagePermissions();
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-[#0D305B] px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:bg-[#16447A] hover:shadow-lg hover:-translate-y-0.5 focus:ring-2 focus:ring-[#0D305B]/40"
                  >
                    <Pen size={16} className="text-white" />
                    ניהול הרשאות
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {role === "editor" && !isSelectionMode && (
        <div className="fixed bottom-10 left-10 flex flex-col-reverse gap-3 group">
          {/* Main FAB button */}
          <button
            className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 z-10"
            title="הוסף"
          >
            <span className="text-3xl font-light transition-transform duration-300 group-hover:rotate-45">+</span>
          </button>

          {/* Add Product button - appears on hover */}
          <button
            onClick={() => {
              setModalType("product");
              setShowAddModal(true);
            }}
            className="w-14 h-14 bg-stockblue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-stockblue/90 transition-all duration-300 ease-in-out scale-0 group-hover:scale-100 -translate-y-14 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto relative"
            title="הוסף מוצר"
          >
            <FilePlus2Icon size={24} />
            <span className="absolute left-16 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              הוסף מוצר
            </span>
          </button>

          {/* Add Category button - appears on hover */}
          <button
            onClick={() => {
              setModalType("category");
              setShowAddModal(true);
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

      {role === "editor" && showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">
              {modalType === "product"
                ? "הוסף מוצר חדש"
                : "הוסף תת-קטגוריה חדשה"}
            </h4>
            {modalType === "product" ? (
              <>
                <input
                  type="text"
                  placeholder="שם מוצר"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="תיאור מוצר"
                  value={newProductLens}
                  onChange={(e) => setNewProductLens(e.target.value)}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="צבע"
                  value={newProductColor}
                  onChange={(e) => setNewProductColor(e.target.value)}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full mb-3"
                />
                {newProductImage && (
                  <img
                    src={newProductImage}
                    alt="preview"
                    className="w-40 mt-2 rounded mr-28"
                  />
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="שם תת-קטגוריה"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full mb-3"
                />
                {newCategoryImage && (
                  <img
                    src={newCategoryImage}
                    alt="preview"
                    className="w-40 h-40 mt-2 rounded-full mx-auto object-cover"
                  />
                )}
              </>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={
                  modalType === "product"
                    ? handleSaveProduct
                    : handleSaveCategory
                }
                className="bg-[#0D305B] text-white px-4 py-2 rounded hover:bg-[#1e3a5f] transition-colors"
              >
                שמור
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

      {/* Delete modal */}
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
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                מחק
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

      {/* Delete selected modal */}
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
                מחק הכל
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

      {/* Move modal */}
      {role === "editor" && showMoveModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">
              העבר {selectedItems.length} פריטים לקטגוריה אחרת
            </h4>
            <p className="mb-4 text-gray-600">בחר קטגוריית יעד:</p>
            <div className="space-y-3">
              <button
                onClick={() => confirmMove("מחשבים")}
                className="w-full p-3 text-right border-2 border-gray-200 rounded-lg hover:border-[#0D305B] hover:bg-blue-50 transition-all"
              >
                מחשבים
              </button>
              <button
                onClick={() => confirmMove("אביזרים")}
                className="w-full p-3 text-right border-2 border-gray-200 rounded-lg hover:border-[#0D305B] hover:bg-blue-50 transition-all"
              >
                אביזרים
              </button>
              <button
                onClick={() => confirmMove("אלקטרוניקה")}
                className="w-full p-3 text-right border-2 border-gray-200 rounded-lg hover:border-[#0D305B] hover:bg-blue-50 transition-all"
              >
                אלקטרוניקה
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
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
    </div>
  );
};

export default SingleCat;
