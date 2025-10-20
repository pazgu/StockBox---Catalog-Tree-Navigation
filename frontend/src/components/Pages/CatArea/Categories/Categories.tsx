import React, { FC, useState, ChangeEvent } from "react";
import { Pen, Trash, Lock, Headphones, Mic, Camera, Video } from "lucide-react";
import headphones from "../../../../assets/headphones.png";
import audio from "../../../../assets/audio.png";
import camera from "../../../../assets/camera.png";
import video from "../../../../assets/video.png";
import { Navigate, useNavigate } from "react-router-dom";

interface CategoriesProps {}

interface Category {
  id: number;
  name: string;
  image: string;
  isActive?: boolean;
}

const Categories: FC<CategoriesProps> = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "שמיעה", image: headphones },
    { id: 2, name: "הקלטה", image: audio },
    { id: 3, name: "וידיאו", image: video },
    { id: 4, name: "צילום", image: camera },
  ]);
  const navigate = useNavigate();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewCatImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (categoryToEdit) {
          setCategoryToEdit({
            ...categoryToEdit,
            image: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newCatName && newCatImage) {
      const newCategory: Category = {
        id: Date.now(),
        name: newCatName,
        image: newCatImage,
      };
      setCategories([...categories, newCategory]);
    }
    setShowAddCatModal(false);
    setNewCatName("");
    setNewCatImage(null);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
    }
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (categoryToEdit) {
      setCategories(
        categories.map((cat) =>
          cat.id === categoryToEdit.id ? categoryToEdit : cat
        )
      );
    }
    setShowEditModal(false);
    setCategoryToEdit(null);
  };

  const closeAllModals = () => {
    setShowAddCatModal(false);
    setShowDeleteModal(false);
    setShowEditModal(false);
    setNewCatName("");
    setNewCatImage(null);
    setCategoryToDelete(null);
    setCategoryToEdit(null);
  };

  return (
    <div
      className="p-4 font-system direction-rtl text-right"
      style={{ direction: "rtl" }}
    >
      <div className="mt-20 text-right">
        <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
          קטגוריות
        </h2>
      </div>

      <div className="w-full flex justify-center flex-wrap gap-10 my-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] relative group"
          >
            <a href="/single-cat">
              <div className="flex items-center justify-center relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-44 h-44 object-cover rounded-full shadow-md mt-2"
                />
                <div className="w-60 absolute inset-0 flex  mr-16 gap-3 mb-4">
                  <button
                    className="-mt-2 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl "
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(category);
                    }}
                  >
                    <Trash size={18} />
                  </button>

                  <button
                    className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm cursor-pointer flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl mt-2 "
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(category);
                    }}
                  >
                    <Pen size={18} />
                  </button>

                  <button
                    className="mt-8 -mr-2.5 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 ease-out h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-700 hover:bg-gray-600 hover:text-white hover:shadow-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/permissions");
                    }}
                    title="ניהול הרשאות"
                  >
                    <Lock size={18} />
                  </button>
                </div>
              </div>
            </a>
            <span className="text-base text-slate-700 font-medium mt-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>

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

      {showAddCatModal && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300"
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
                className="max-w-full mt-2.5 rounded-lg"
              />
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={handleSave}
                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
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

      {showDeleteModal && categoryToDelete && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-2xl text-center transform translate-y-[-2px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
              מחיקת קטגוריה
            </h4>
            <p className="text-slate-700 mb-3">
              האם אתה בטוח שברצונך למחוק את הקטגוריה "{categoryToDelete.name}"?
            </p>
            <small className="text-gray-500">לא יהיה ניתן לבטל פעולה זו</small>
            <div className="flex justify-between gap-3 mt-5">
              <button
                onClick={confirmDelete}
                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-red-600 text-white shadow-md hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
              >
                מחק
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
              className="w-42 h-44 object-cover rounded-lg mt-2.5 mb-5"
            />
            <a href="/permissions">
              <small className="text-gray-500 underline cursor-pointer text-slate-700 mt-2.5 inline-block">
                לניהול הרשאות
              </small>
            </a>

            <div className="flex justify-between gap-3 w-full mt-5">
              <button
                onClick={handleEditSave}
                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
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
    </div>
  );
};

export default Categories;
