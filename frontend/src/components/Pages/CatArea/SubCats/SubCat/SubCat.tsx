import React, { FC, useState, ChangeEvent } from "react";
import { Trash, Pen, Lock, Heart } from "lucide-react"; // Assuming you use lucide-react or similar for icons
import { useNavigate } from "react-router-dom"; // Assuming you use react-router-dom for navigation
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
interface Category {
  id: number;
  name: string;
  image: string;
  type: "prodparent" | "catparent" | null;
  favorite?: boolean;
}

interface SubCatProps {
  SubCatName: string;
  initialCategories: Category[];
}

const useCategoryManagement = (initialCategories: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToType, setCategoryToType] = useState<Category | null>(null);
  const [categoryToAdd, setShowAddCatModal] = useState<Category | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");

  const closeAllModals = () => {
    setCategoryToDelete(null);
    setCategoryToEdit(null);
    setCategoryToType(null);
    setShowAddCatModal(null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCatImage(URL.createObjectURL(file));
    }
  };

  const handleEditImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && categoryToEdit) {
      const imageUrl = URL.createObjectURL(file);
      setCategoryToEdit({ ...categoryToEdit, image: imageUrl });
    }
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id)
      );
      closeAllModals();
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
  };

  const handleEditSave = () => {
    if (categoryToEdit) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryToEdit.id ? categoryToEdit : cat))
      );
      closeAllModals();
    }
  };

  const handleSave = () => {
    if (newCatName && newCatImage) {
      const newCategory: Category = {
        id: Date.now(),
        name: newCatName,
        image: newCatImage,
        type: null,
        favorite: false,
      };
      setCategories([...categories, newCategory]);
      setNewCatName("");
      setNewCatImage("");
    }
  };

  return {
    categories,
    setCategories,
    categoryToDelete,
    categoryToEdit,
    setCategoryToEdit,
    categoryToType,
    setCategoryToType,
    newCatName,
    setNewCatName,
    newCatImage,
    handleImageUpload,
    handleEditImageUpload,
    closeAllModals,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditSave,
    handleSave,
  };
};

const SubCat: FC<SubCatProps> = ({ initialCategories = [] }) => {
  const navigate = useNavigate();
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  const { subcatName } = useParams();
  const {
    categories,
    setCategories,
    categoryToDelete,
    categoryToEdit,
    setCategoryToEdit,
    categoryToType,
    setCategoryToType,
    newCatName,
    setNewCatName,
    newCatImage,
    handleImageUpload,
    handleEditImageUpload,
    closeAllModals,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditSave,
    handleSave,
  } = useCategoryManagement(initialCategories);

  const showDeleteModal = !!categoryToDelete;
  const showEditModal = !!categoryToEdit;
  const noCats = categories.length === 0;

  // Function to handle category click logic
  const handleCategoryClick = (category: Category) => {
    console.log("function triggered");
    if (category.type === null) {
      setCategoryToType(category);
    } else if (category.type === "prodparent") {
      navigate("/categories/single-cat");
    } else if (category.type === "catparent") {
      navigate(`/subcat/${category.name}`);
      console.log("nane:", category.name);
    }
  };

  const toggleFavorite = (id: number) => {
    const cam = categories.find((c) => c.id === id);
    if (!cam) return;

    if (cam.favorite) {
      toast.info(`${cam.name} הוסר מהמועדפים`);
    } else {
      toast.success(`${cam.name} נוסף למועדפים`);
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  return (
    <div
      className="p-4 font-system direction-rtl text-right"
      style={{ direction: "rtl" }}
    >
      <div className="mt-20 text-right">
        <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
          קטגוריה {subcatName}
        </h2>
      </div>

      <div className="w-full flex justify-center flex-wrap gap-10 my-12">
        {noCats && <h3>לא נמצאו קטגורית</h3>}
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center transition-transform duration-200 hover:translate-y-[-2px] relative"
          >
            <div className="w-full flex justify-center flex-wrap gap-10 my-12">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center transition-transform duration-200 hover:translate-y-[-2px]"
                >
                  {/* Image container */}
                  <div
                    className="relative group cursor-pointer "
                    onClick={() => handleCategoryClick(category)}
                  >
                    {
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(category.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                      >
                        <Heart
                          size={22}
                          strokeWidth={2}
                          className={
                            category.favorite
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }
                        />
                      </button>
                    }
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-44 h-44 object-cover rounded-full shadow-md mt-2"
                    />

                    {/* Overlay buttons (shown on hover) */}
                    <div className="-ml-10 absolute inset-0 flex justify-end items-start gap-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {/* Delete Button */}
                      <div className="relative pointer-events-auto">
                        <button
                          className="-mt-4 peer h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white"
                          onClick={(e) => {
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
                      <div className="relative pointer-events-auto">
                        <button
                          className="peer mr-2 h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white"
                          onClick={(e) => {
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
                      <div className="relative pointer-events-auto ">
                        <button
                          className="mt-8 ml-2 peer h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/permissions");
                          }}
                        >
                          <Lock size={18} />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          ניהול הרשאות
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Name */}
                  <span className="text-base text-slate-700 font-medium mt-2">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Floating Action Button (FAB) */}
      {
        <div
          className="fixed bottom-8 right-8 w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-slate-600 shadow-xl"
          onClick={() => setShowAddCatModal(true)}
        >
          {/* Plus Icon */}
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
      }

      {
        <>
          {/* Add Category Modal */}
          {showAddCatModal && (
            <div
              className="fixed inset-0 bg-slate-600 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300"
              onClick={closeAllModals}
            >
              <div
                className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-2xl text-center transform translate-y-[-2px]"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
                  הוסף קטגוריה חדשה
                </h4>

                <input
                  type="text"
                  placeholder="שם קטגוריה"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg mb-5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full mb-5"
                />

                {newCatImage && (
                  <img
                    src={newCatImage}
                    alt="preview"
                    className="max-w-full mt-2.5 rounded-lg mb-4 h-40 object-cover mx-auto"
                  />
                )}

                <div className="flex justify-between gap-3 ">
                  <button
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-blue-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                    onClick={() => {
                      handleSave();
                      setShowAddCatModal(false);
                    }}
                  >
                    שמור
                  </button>

                  <button
                    onClick={() => {
                      closeAllModals();
                      setShowAddCatModal(false);
                    }}
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
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
                  האם את/ה בטוח/ה שברצונך למחוק את הקטגוריה "
                  <strong className="font-bold">{categoryToDelete.name}</strong>
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

          {/* Edit Category Modal */}
          {showEditModal && categoryToEdit && (
            <div
              className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300"
              onClick={closeAllModals}
            >
              <div
                className="bg-white p-8 rounded-xl w-72 max-w-[90%] shadow-2xl text-center transform translate-y-[-2px] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
                  עריכת קטגוריה
                </h4>

                <input
                  type="text"
                  placeholder="שם קטגוריה"
                  value={categoryToEdit.name}
                  onChange={(e) =>
                    setCategoryToEdit({
                      ...categoryToEdit,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-lg my-2.5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="w-full my-2.5"
                />

                <img
                  src={categoryToEdit.image}
                  alt="preview"
                  className="w-44 h-44 object-cover rounded-lg mt-2.5 mb-5 mx-auto"
                />

                {/* Permissions Link */}
                <Link to="/permissions">
                  <small className="text-gray-500 underline cursor-pointer text-slate-700 mt-2.5 inline-block">
                    לניהול הרשאות
                  </small>
                </Link>

                <div className="flex justify-between gap-3 w-full mt-5">
                  <button
                    onClick={handleEditSave}
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0 disabled:opacity-50"
                    disabled={!categoryToEdit.name}
                  >
                    שמור
                  </button>

                  <button
                    onClick={closeAllModals}
                    className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      }

      {/* Set Category Type Modal */}
      {categoryToType && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setCategoryToType(null)}
        >
          <div
            className="bg-white rounded-xl p-6 shadow-2xl w-80 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-semibold text-slate-700 mb-4">
              בחר סוג קטגוריה
            </h4>
            <p className="text-gray-600 mb-6">
              מה ברצונך שהקטגוריה{" "}
              <strong className="font-medium">{categoryToType.name}</strong>{" "}
              תכיל?
            </p>

            <div className="flex flex-col gap-3 justify-center items-center">
              <button
                onClick={() => {
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === categoryToType.id
                        ? { ...cat, type: "prodparent" }
                        : cat
                    )
                  );
                  setCategoryToType(null);
                }}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-64 shadow-md hover:shadow-lg"
              >
                מוצרים בודדים
              </button>

              <button
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-64 shadow-md hover:shadow-lg"
                onClick={() => {
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === categoryToType?.id
                        ? { ...cat, type: "catparent" }
                        : cat
                    )
                  );
                  setCategoryToType(null);
                }}
              >
                תתי-קטגוריות
              </button>

              <button
                onClick={() => {
                  setCategoryToType(null);
                  closeAllModals();
                }}
                className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all w-32 mt-2"
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

export default SubCat;
