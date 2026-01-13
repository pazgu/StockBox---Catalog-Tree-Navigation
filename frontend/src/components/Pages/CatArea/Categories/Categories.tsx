/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useState, useEffect } from "react";
import {
  Pen,
  Trash,
  Lock,
  Heart,
} from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddCategoryModal from "./AddCategoryModal/AddCategoryModal/AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal/EditCategoryModal/EditCategoryModal";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";
import { categoriesService } from "../../../../services/CategoryService";
import { AddCategoryResult } from "../../../models/category.models";
import { userService } from "../../../../services/UserService";

interface CategoriesProps {}

export interface Category {
  _id: string;
  categoryName: string;
  categoryPath: string;
  categoryImage: string;
}

type CategoryEditPayload = Category & { imageFile?: File };

export const Categories: FC<CategoriesProps> = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { role, id } = useUser();
  const navigate = useNavigate();
  const path: string[] = ["categories"];

  useEffect(() => {
    fetchCategories();
    if (id) {
      loadFavorites();
    }
  }, [id]);
  const loadFavorites = async () => {
    if (!id) return;  
    try {
      const userFavorites = await userService.getFavorites(id);
      const favoritesMap: Record<string, boolean> = {};
      userFavorites.forEach((fav: any) => {
        if (fav.type === "category") {
          favoritesMap[fav.id.toString()] = true;
        }
      });
      setFavorites(favoritesMap);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("שגיאה בטעינת קטגוריות");
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (categoryId: string) => {
    if (!id) {
      toast.error("יש להתחבר כדי להוסיף למועדפים");
      return;
    }
    const cam = categories.find((c) => c._id === categoryId);
    if (!cam) return;

    try {
      const isFavorite = favorites[categoryId];
      setFavorites((prev) => ({ ...prev, [categoryId]: !isFavorite }));
      await userService.toggleFavorite(id, categoryId, "category");
      if (!isFavorite) {
        toast.success(`${cam.categoryName} נוסף למועדפים`);
      } else {
        toast.info(`${cam.categoryName} הוסר מהמועדפים`);
      }
    } catch (error) {
      toast.error("שגיאה בעדכון המועדפים");
      setFavorites((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));  // ← categoryId
    }
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesService.deleteCategory(categoryToDelete._id);

      setCategories(
        categories.filter((cat) => cat._id !== categoryToDelete._id)
      );

      toast.success(
        `הקטגוריה "${categoryToDelete.categoryName}" וכל התכנים שבה נמחקו בהצלחה!`
      );
    } catch (error) {
      toast.error("שגיאה במחיקת הקטגוריה");
      console.error("Error deleting category:", error);
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const closeAllModals = () => {
    setShowAddCatModal(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
    setCategoryToDelete(null);
    setCategoryToEdit(null);
  };

  const handleAddCategory = async ({ name, imageFile }: AddCategoryResult) => {
    const categoryPath = `/categories/${name.toLowerCase().replace(/\s+/g, "-")}`;

    const newCategory = await categoriesService.createCategory({
      categoryName: name,
      categoryPath,
      imageFile,
    });

    setCategories((prev) => [...prev, newCategory]);
    setShowAddCatModal(false);
    toast.success(`הקטגוריה "${name}" נוספה בהצלחה!`);
  };

  const handleSaveEdit = async (updatedCategory: CategoryEditPayload) => {
    try {
      const result = await categoriesService.updateCategory(
        updatedCategory._id,
        {
          categoryName: updatedCategory.categoryName,
          categoryPath: updatedCategory.categoryPath,
          imageFile: updatedCategory.imageFile,
        }
      );

      setCategories((prev) =>
        prev.map((c) => (c._id === result._id ? result : c))
      );

      setShowEditModal(false);
      setCategoryToEdit(null);
      toast.success(`הקטגוריה "${result.categoryName}" עודכנה בהצלחה!`);
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("שגיאה בעדכון הקטגוריה");
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(category.categoryPath);
  };

  if (isLoading) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">טוען קטגוריות...</div>
      </div>
    );
  }

  return (
    <div
      className="mt-12 p-4 font-system direction-rtl text-right"
      style={{ direction: "rtl" }}
    >
      <Breadcrumbs path={path} />

      <div className="text-right">
        <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
          קטגוריות
        </h2>
      </div>

      {categories.length === 0 ? (
        <div className="w-full h-40 flex justify-center items-center my-12 text-slate-500">
         {role === "editor" ? ( <p  className="text-lg">אין קטגוריות להצגה. הוסף קטגוריה חדשה!</p>
         ):
         (<p  className="text-lg">אין קטגוריות להצגה!</p>)}
         
        </div>
      ) : (
        <div className="w-full flex justify-center flex-wrap gap-10 my-12">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] relative group"
            >
              <div className="flex items-center justify-center relative">
                <div onClick={() => handleCategoryClick(category)}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(category._id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors z-10"
                  >
                    <Heart
                      size={22}
                      strokeWidth={2}
                      className={
                        favorites[category._id]
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }
                    />
                  </button>

                  <img
                    src={category.categoryImage}
                    alt={category.categoryName}
                    className="w-44 h-44 object-cover rounded-full shadow-md mt-2"
                  />

                  {role === "editor" && (
                    <div className="w-60 absolute inset-0 flex mr-16 gap-3 mb-4">
                      {/* Delete Button */}
                      <div className="relative">
                        <button
                          className="peer -mt-1.5 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(category);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          מחק קטגוריה
                        </span>
                      </div>

                      {/* Edit Button */}
                      <div className="relative">
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
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          ערוך קטגוריה
                        </span>
                      </div>

                      {/* Lock Button */}
                      <div className="relative">
                        <button
                          className="peer mt-8 -mr-2.5 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            navigate(`/permissions/category/${category._id}`);
                          }}
                        >
                          <Lock size={18} />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          ניהול הרשאות
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-base text-slate-700 font-medium mt-2">
                {category.categoryName}
              </span>
            </div>
          ))}
        </div>
      )}

      {role === "editor" && (
        <div
          className="fixed bottom-8 right-8 w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-slate-600"
          onClick={() => setShowAddCatModal(true)}
        >
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

          {showDeleteModal && categoryToDelete && (
            <div
              className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
              onClick={closeAllModals}
            >
              <div
                className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-xl text-center transform translate-y-[-2px]"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
                  מחיקת קטגוריה
                </h4>

                <p className="text-slate-700 mb-3">
                  האם ברצונך למחוק את הקטגוריה "{categoryToDelete.categoryName}
                  "?
                </p>
                <small className="text-gray-500">
                  לא ניתן לבטל פעולה זו לאחר מכן
                </small>

                <div className="flex justify-between gap-3 mt-5">
                  <button
                    onClick={closeAllModals}
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                  >
                    ביטול
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-red-600 text-white shadow-md hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                  >
                    מחק
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