/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useState, useEffect } from "react";
import {
  Pen,
  Trash,
  Lock,
  Heart,
  PackageCheck,
  FolderInput,
  Copy,
} from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddCategoryModal from "./AddCategoryModal/AddCategoryModal/AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal/EditCategoryModal/EditCategoryModal";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";
import { categoriesService } from "../../../../services/CategoryService";
import { AddCategoryResult } from "../../../models/category.models";
import { userService } from "../../../../services/UserService";
import { Spinner } from "../../../ui/spinner";
import { ProductsService } from "../../../../services/ProductService";
import { DisplayItem } from "../../../../components/models/item.models";
import { ProductDto } from "../../../../components/models/product.models";
import { handleEntityRouteError } from "../../../../lib/routing/handleEntityRouteError";
import MoveMultipleItemsModal from "../SingleCat/MoveMultipleItemsModal/MoveMultipleItemsModal";
import DuplicateProductModal from "../../ProductArea/DuplicateProductModal/DuplicateProductModal";
import { usePath } from "../../../../context/PathContext";
import ImagePreviewHover from "../../ProductArea/ImageCarousel/ImageCarousel/ImagePreviewHover";
import { recycleBinService } from "../../../../services/RecycleBinService";
import { useDebouncedFavorite } from "../../../../hooks/useDebouncedFavorite";
import { truncateDisplay } from "../../../../lib/utils";

interface CategoriesProps {}

export interface Category {
  _id: string;
  categoryName: string;
  categoryPath: string;
  categoryImage: string;
}

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

type CategoryEditPayload = Category & { imageFile?: File };
type FilterType = "all" | "categories" | "products";

export const Categories: FC<CategoriesProps> = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showMoveToRecycleBinModal, setShowMoveToRecycleBinModal] =
    useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToMoveToRecycleBin, setCategoryToMoveToRecycleBin] =
    useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role, id } = useUser();
  const navigate = useNavigate();
  const path: string[] = ["categories"];
  const [isMovingToRecycleBin, setIsMovingToRecycleBin] = useState(false);
  const [moveStrategyLoading, setMoveStrategyLoading] = useState<
    "cascade" | "move_up" | null
  >(null);
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { setPreviousPath } = usePath();
  const location = useLocation();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveSelectedItems, setMoveSelectedItems] = useState<DisplayItem[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateProductId, setDuplicateProductId] = useState("");
  const [duplicateProductName, setDuplicateProductName] = useState("");
  const [duplicateCurrentPaths, setDuplicateCurrentPaths] = useState<string[]>(
    [],
  );
  const [hasDescendantsForMove, setHasDescendantsForMove] = useState<
    boolean | null
  >(null);
  const [productToMoveToRecycleBin, setProductToMoveToRecycleBin] =
    useState<DisplayItem | null>(null);

  const openDuplicateForProduct = (item: DisplayItem) => {
    setDuplicateProductId(item.id);
    setDuplicateProductName(item.name);
    setDuplicateCurrentPaths(item.path);
    setShowDuplicateModal(true);
  };

  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicateProductId("");
    setDuplicateProductName("");
    setDuplicateCurrentPaths([]);
  };

  const openMoveForItem = (item: DisplayItem) => {
    setMoveSelectedItems([item]);
    setShowMoveModal(true);
  };

  const closeMoveModal = () => {
    setShowMoveModal(false);
    setMoveSelectedItems([]);
  };

  useEffect(() => {
    if (role !== undefined) {
      if (role) {
        loadCategoriesAndFavorites();
      } else {
        setIsLoading(false);
      }
    }
  }, [role, id]);

  const loadCategoriesAndFavorites = async () => {
    try {
      setIsLoading(true);

      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData);

      let products: ProductDto[] = [];
      try {
        products = await ProductsService.getProductsByPath("/categories");
      } catch (err) {
        if (handleEntityRouteError(err, navigate)) return;
        console.error(err);
        toast.error("שגיאה בטעינת מוצרים");
        products = [];
      }

      let userFavorites: { id: string; type: string }[] = [];
      if (id) {
        try {
          const favs = await userService.getFavorites();
          userFavorites = favs.map((f: any) => ({
            id: f.id.toString(),
            type: f.type,
          }));
        } catch (error) {
          toast.error("שגיאה בטעינת מועדפים");
          console.error("Error loading favorites:", error);
        }
      }

      const favCategoryIds = new Set(
        userFavorites.filter((f) => f.type === "category").map((f) => f.id),
      );
      const favProductIds = new Set(
        userFavorites.filter((f) => f.type === "product").map((f) => f.id),
      );

      const categoryItems: DisplayItem[] = categoriesData.map((cat: any) => ({
        id: cat._id,
        name: cat.categoryName,
        images: cat.categoryImage,
        type: "category",
        path: [cat.categoryPath],
        favorite: favCategoryIds.has(cat._id.toString()),
      }));

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
        favorite: favProductIds.has(prod._id!.toString()),
      }));

      setItems([...categoryItems, ...productItems]);
    } catch (error) {
      toast.error("שגיאה בטעינת קטגוריות");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (
    itemId: string,
    itemName: string,
    itemType: "category" | "product",
  ) => {
    if (!id) {
      toast.error("יש להתחבר כדי להוסיף למועדפים");
      return;
    }

    const wasFavorite = items.find((x) => x.id === itemId)?.favorite ?? false;

    try {
      setItems((prev) =>
        prev.map((x) =>
          x.id === itemId ? { ...x, favorite: !wasFavorite } : x,
        ),
      );

      await userService.toggleFavorite(itemId, itemType);

      if (!wasFavorite) toast.success(`${itemName} נוספה למועדפים`);
      else toast.info(`${itemName} הוסרה מהמועדפים`);
    } catch (error) {
      toast.error("שגיאה בעדכון המועדפים");

      setItems((prev) =>
        prev.map((x) =>
          x.id === itemId ? { ...x, favorite: wasFavorite } : x,
        ),
      );
    }
  };

  const debouncedToggleFavorite = useDebouncedFavorite(items, setItems, 500);

  const handleMoveToRecycleBin = async (category: Category) => {
    setCategoryToMoveToRecycleBin(category);

    try {
      const hasDesc = await categoriesService.hasDescendants(category._id);
      setHasDescendantsForMove(hasDesc);
    } catch (e) {
      setHasDescendantsForMove(true);
    }

    setShowMoveToRecycleBinModal(true);
  };
  const handleMoveProductToRecycleBin = async (product: DisplayItem) => {
    setProductToMoveToRecycleBin(product);
    setHasDescendantsForMove(false);
    setShowMoveToRecycleBinModal(true);
  };

  const confirmMoveToRecycleBin = async (strategy: "cascade" | "move_up") => {
    try {
      setIsMovingToRecycleBin(true);
      setMoveStrategyLoading(strategy);

      await new Promise((r) => setTimeout(r, 800));

      if (categoryToMoveToRecycleBin) {
        await recycleBinService.moveCategoryToRecycleBin(
          categoryToMoveToRecycleBin._id,
          strategy,
        );

        toast.success(
          strategy === "cascade"
            ? `הקטגוריה "${categoryToMoveToRecycleBin.categoryName}" הועברה לסל המיחזור!`
            : `הקטגוריה "${categoryToMoveToRecycleBin.categoryName}" הועברה לסל המיחזור והתכנים הועברו שכבה אחת למעלה!`,
        );
      } else if (productToMoveToRecycleBin) {
        await recycleBinService.moveProductToRecycleBin(
          productToMoveToRecycleBin.id,
        );

        toast.success(
          `המוצר "${productToMoveToRecycleBin.name}" הועבר לסל המיחזור!`,
        );
      }
      await loadCategoriesAndFavorites();

      setShowMoveToRecycleBinModal(false);
      setCategoryToMoveToRecycleBin(null);
      setProductToMoveToRecycleBin(null);
    } catch (error) {
      toast.error("שגיאה בהעברה לסל המיחזור");
      console.error("Error moving to recycle bin:", error);
    } finally {
      setIsMovingToRecycleBin(false);
      setMoveStrategyLoading(null);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const closeAllModals = () => {
    setShowAddCatModal(false);
    setShowMoveToRecycleBinModal(false);
    setHasDescendantsForMove(null);
    setShowEditModal(false);
    setCategoryToMoveToRecycleBin(null);
    setCategoryToEdit(null);
    setProductToMoveToRecycleBin(null);
  };

  const handleAddCategory = async ({ name, imageFile }: AddCategoryResult) => {
    try {
      const categoryPath = `/categories/${name
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

      const newCategory = await categoriesService.createCategory({
        categoryName: name,
        categoryPath,
        imageFile,
      });

      setCategories((prev) => [...prev, newCategory]);
      setShowAddCatModal(false);
      toast.success(`הקטגוריה "${name}" נוספה בהצלחה!`);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message || error?.response?.data?.error;

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        toast.error(serverMessage);
      } else {
        toast.error("שגיאה בהוספת קטגוריה");
      }

      console.error("Error creating category:", error);
    }
  };

  const handleSaveEdit = async (updatedCategory: CategoryEditPayload) => {
    const original = categories.find((c) => c._id === updatedCategory._id);

    if (!original) return;

    const noChanges =
      original.categoryName.trim() === updatedCategory.categoryName.trim() &&
      !updatedCategory.imageFile;

    if (noChanges) {
      toast.info("לא בוצעו שינויים");
      return;
    }

    try {
      const result = await categoriesService.updateCategory(
        updatedCategory._id,
        {
          categoryName: updatedCategory.categoryName,
          categoryPath: updatedCategory.categoryPath,
          imageFile: updatedCategory.imageFile,
        },
      );

      setCategories((prev) =>
        prev.map((c) => (c._id === result._id ? result : c)),
      );

      setShowEditModal(false);
      setCategoryToEdit(null);
      toast.success(`הקטגוריה "${result.categoryName}" עודכנה בהצלחה!`);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("שגיאה בעדכון הקטגוריה");
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">טוען קטגוריות...</div>
      </div>
    );
  }
  if (!role) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">
          יש להתחבר כדי לצפות בקטגוריות
        </div>
      </div>
    );
  }

  const categoryItems = items.filter((x) => x.type === "category");
  const productItems = items.filter((x) => x.type === "product");
  const showCategories =
    activeFilter === "all" || activeFilter === "categories";
  const hasProducts = productItems.length > 0;
  const showProducts =
    (activeFilter === "all" || activeFilter === "products") && hasProducts;

  return (
    <div
      className="mt-12 p-4 font-system direction-rtl text-right overflow-x-hidden"
      style={{ direction: "rtl" }}
    >
      <Breadcrumbs path={path} />

      {/* Filter Buttons */}
      {hasProducts ? (
        <div className="flex justify-center gap-3 mb-8 flex-wrap mt-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "all"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            הכל
          </button>

          <button
            onClick={() => setActiveFilter("categories")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "categories"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            קטגוריות
          </button>

          <button
            onClick={() => setActiveFilter("products")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "products"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            מוצרים
          </button>
        </div>
      ) : (
        <div className="text-right mt-8 mb-6">
          <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
            קטגוריות
          </h2>
        </div>
      )}

      {items.length === 0 ? (
        <div className="w-full h-40 flex justify-center items-center my-12 text-slate-500">
          <p className="text-lg">אין פריטים להצגה</p>
        </div>
      ) : (
        <>
          {showCategories && categoryItems.length > 0 && (
            <div className="mx-auto flex justify-center flex-wrap gap-10 my-12 px-4 sm:px-8">
              {categoryItems.map((item) => {
                const category = categories.find((c) => c._id === item.id);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] relative group"
                  >
                    <div className="flex items-center justify-center relative">
                      <div
                        onClick={() => navigate(item.path[0])}
                        className="relative"
                      >
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              debouncedToggleFavorite(
                                item.id,
                                item.name,
                                "category",
                              );
                            }}
                            className="peer p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors relative"
                          >
                            <Heart
                              size={22}
                              strokeWidth={2}
                              className={
                                item.favorite
                                  ? "fill-red-500 text-red-500"
                                  : "text-white"
                              }
                            />
                          </button>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                            {item.favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
                          </span>
                        </div>

                        <img
                          src={
                            typeof item.images === "string"
                              ? item.images
                              : item.images?.[0]
                          }
                          alt={item.name}
                          className="w-44 h-44 object-cover rounded-full mt-2 "
                        />

                        {role === "editor" && category && (
                          <div className="w-60 absolute inset-0 flex mr-16 gap-3 mb-4">
                            <div className="relative pointer-events-auto">
                              <button
                                className="peer -mt-1.5 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMoveToRecycleBin(category);
                                }}
                              >
                                <Trash size={18} />
                              </button>
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                                העברה לסל מיחזור
                              </span>
                            </div>

                            <div className="relative pointer-events-auto">
                              <button
                                className="peer opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl mt-2.1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(category);
                                }}
                              >
                                <Pen size={18} />
                              </button>
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                                עריכת קטגוריה
                              </span>
                            </div>

                            <div className="relative pointer-events-auto">
                              <button
                                className="peer mt-8 -mr-2.5 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setPreviousPath(location.pathname);
                                  navigate(
                                    `/permissions/category/${category._id}`,
                                  );
                                }}
                              >
                                <Lock size={18} />
                              </button>
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                                ניהול הרשאות
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative group/tooltip flex justify-center mt-2">
                      <span
                        className="text-base text-slate-700 font-medium w-44 line-clamp-2 text-center"
                        style={{
                          overflowWrap: "anywhere",
                          direction: /[\u0590-\u05FF]/.test(item.name)
                            ? "rtl"
                            : "ltr",
                        }}
                      >
                        {truncateDisplay(item.name)}
                      </span>
                      {item.name.length > 18 && (
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md">
                          {item.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showProducts && productItems.length > 0 && (
            <div className={activeFilter === "products" ? "mt-6" : "mt-16"}>
              {activeFilter === "all" && (
                <h3 className="text-3xl font-light text-slate-700 mb-6 tracking-tight">
                  מוצרים
                </h3>
              )}

              <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-24 my-12">
                {productItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center p-5 text-center border-b-2 relative transition-all duration-300 hover:-translate-y-1 border-gray-200 cursor-pointer"
                      onClick={() => {
                        setPreviousPath(location.pathname);
                        navigate(`/products/${item.id}`);
                      }}
                    >
                      <div className="absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full">
                        <div className="flex flex-col items-center text-green-700">
                          <PackageCheck />
                          <span>מוצר</span>
                        </div>
                      </div>

                      <div className="absolute right-3 top-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            debouncedToggleFavorite(
                              item.id,
                              item.name,
                              "product",
                            );
                          }}
                          className="peer h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-200"
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

                      {role === "editor" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openMoveForItem(item);
                            }}
                            className="absolute group bottom-3 right-3 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-blue-500 hover:scale-110"
                          >
                            <span className="absolute -bottom-8 -left-1 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                              העברה לקטגוריה אחרת
                            </span>
                            <FolderInput size={18} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDuplicateForProduct(item);
                            }}
                            className="group absolute bottom-3 right-12 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-purple-500 hover:scale-110"
                          >
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
                              שכפול לקטגוריות נוספות
                            </span>
                            <Copy size={18} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveProductToRecycleBin(item);
                            }}
                            className="absolute group bottom-3 left-3 transition-all duration-200 h-9 w-9 text-gray-700 flex items-center justify-center hover:text-orange-500 hover:scale-110"
                          >
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                              העברה לסל מיחזור
                            </span>
                            <Trash size={18} />
                          </button>
                        </>
                      )}

                      <div className="h-36 w-full flex justify-center items-center p-5 rounded-none mr-2">
                        {hasImage(item.images) ? (
                          <div className="h-full w-full flex justify-center items-center">
                            <ImagePreviewHover
                              images={item.images}
                              alt={item.name}
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <NoImageCard label="אין תמונה למוצר" />
                        )}
                      </div>

                      <div className="w-full text-center pt-4 border-t border-gray-200">
                        <div className="relative group/name max-w-xs">
                          <div
                            className="relative group/name max-w-xs"
                            onMouseEnter={(e) => {
                              const h2 = e.currentTarget.querySelector("h2");
                              if (h2 && h2.scrollWidth > h2.clientWidth) {
                                e.currentTarget.setAttribute(
                                  "data-truncated",
                                  "true",
                                );
                              }
                            }}
                          >
                            <h2
                              className="text-[1.1rem] text-[#0D305B] mb-2"
                              title={item.name}
                            >
                              {truncateDisplay(item.name)}
                            </h2>
                            <span className="absolute top-full mt-1 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/name:[div[data-truncated='true']_&]:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-normal break-words max-w-xs">
                              {item.name}
                            </span>
                          </div>
                        </div>
                        {role === "editor" && (
                          <div className="mt-2 flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviousPath(location.pathname);
                                navigate(`/permissions/product/${item.id}`);
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
                  );
                })}
              </main>
            </div>
          )}
        </>
      )}

      <MoveMultipleItemsModal
        isOpen={showMoveModal}
        selectedItems={moveSelectedItems}
        onClose={closeMoveModal}
        onSuccess={loadCategoriesAndFavorites}
      />

      <DuplicateProductModal
        isOpen={showDuplicateModal}
        productId={duplicateProductId}
        productName={duplicateProductName}
        currentPaths={duplicateCurrentPaths}
        onClose={closeDuplicateModal}
        onSuccess={loadCategoriesAndFavorites}
      />
      {role === "editor" && (
        <div
          className="fixed bottom-8 right-8 w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-slate-600 group z-50 shadow-lg"
          onClick={() => setShowAddCatModal(true)}
        >
          <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl">
            הוספת קטגוריה חדשה
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      )}

      {role === "editor" && (
        <>
          <AddCategoryModal
            isOpen={showAddCatModal}
            onClose={() => setShowAddCatModal(false)}
            onSave={handleAddCategory}
          />

          {showMoveToRecycleBinModal &&
            (categoryToMoveToRecycleBin || productToMoveToRecycleBin) && (
              <div
                className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
                onClick={closeAllModals}
              >
                <div
                  className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-xl text-center transform translate-y-[-2px] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
                    העברה לסל מיחזור
                  </h4>

                  <p className="text-slate-700 mb-3">
                    {categoryToMoveToRecycleBin ? (
                      <>
                        האם ברצונך להעביר את הקטגוריה "
                        <span className="break-words inline-block max-w-full">
                          {categoryToMoveToRecycleBin.categoryName}
                        </span>
                        " לסל המיחזור?
                      </>
                    ) : (
                      <>
                        האם ברצונך להעביר את המוצר "
                        <span className="break-words inline-block max-w-full">
                          {productToMoveToRecycleBin?.name}
                        </span>
                        " לסל המיחזור?
                      </>
                    )}
                  </p>

                  <div className="flex flex-col gap-3 mt-5">
                    {hasDescendantsForMove && categoryToMoveToRecycleBin ? (
                      <>
                        <button
                          onClick={() => confirmMoveToRecycleBin("cascade")}
                          disabled={isMovingToRecycleBin}
                          className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md
${isMovingToRecycleBin ? "bg-orange-400 cursor-not-allowed text-white" : "bg-orange-600 text-white hover:bg-orange-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"}`}
                        >
                          {isMovingToRecycleBin &&
                          moveStrategyLoading === "cascade" ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner className="size-4 text-white" />
                              מעביר לסל...
                            </span>
                          ) : (
                            "העבר הכל לסל (כולל כל הצאצאים)"
                          )}
                        </button>

                        <button
                          onClick={() => confirmMoveToRecycleBin("move_up")}
                          disabled={isMovingToRecycleBin}
                          className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md
${isMovingToRecycleBin ? "bg-blue-200 cursor-not-allowed text-blue-900" : "bg-blue-100 text-blue-900 hover:bg-blue-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"}`}
                        >
                          {isMovingToRecycleBin &&
                          moveStrategyLoading === "move_up" ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner className="size-4 text-blue-900" />
                              מעביר לסל...
                            </span>
                          ) : (
                            "העבר רק קטגוריה (העבר צאצאים למעלה)"
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => confirmMoveToRecycleBin("cascade")}
                          disabled={isMovingToRecycleBin}
                          className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md
${isMovingToRecycleBin ? "bg-orange-400 cursor-not-allowed text-white" : "bg-orange-600 text-white hover:bg-orange-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"}`}
                        >
                          {isMovingToRecycleBin ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner className="size-4 text-white" />
                              מעביר לסל...
                            </span>
                          ) : (
                            "העברה לסל מיחזור"
                          )}
                        </button>
                      </>
                    )}

                    <button
                      onClick={closeAllModals}
                      disabled={isMovingToRecycleBin}
                      className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200
${isMovingToRecycleBin ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"}`}
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            )}

          {showEditModal && categoryToEdit && (
            <EditCategoryModal
              isOpen={showEditModal && !!categoryToEdit}
              category={categoryToEdit as Category}
              onClose={() => {
                setShowEditModal(false);
                setCategoryToEdit(null);
              }}
              onSave={handleSaveEdit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Categories;
