import React, { FC, useState} from "react";
import {
  Pen,
  Trash,
  Lock,
  Heart,
} from "lucide-react";
import headphones from "../../../../assets/headphones.png";
import audio from "../../../../assets/audio.png";
import camera from "../../../../assets/camera.png";
import video from "../../../../assets/video.png";
import { useUser } from "../../../../context/UserContext";
import {useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddCategoryModal,{AddCategoryResult} from "./AddCategoryModal/AddCategoryModal/AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal/EditCategoryModal/EditCategoryModal";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";

interface CategoriesProps {}

export interface Category {
  id: number;
  name: string;
  image: string;
  type?: "catparent" | "prodparent" | null;
  children?: Category[];
  isActive?: boolean;
  favorite?: boolean;
}

export const initialCategories: Category[] = [
  {
    id: 1,
    name: "שמיעה",
    image: headphones,
    type: "prodparent",
    favorite: true,
  },
  { id: 2, name: "הקלטה", image: audio, type: "prodparent", favorite: false },
  { id: 3, name: "וידיאו", image: video, type: "prodparent", favorite: true },
  {
    id: 4,
    name: "צילום",
    image: camera,
    type: "prodparent",
    favorite: false,
  },
];



export const Categories: FC<CategoriesProps> = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToType, setCategoryToType] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const { role } = useUser();
  const navigate = useNavigate();
  const path: string[] = ["categories"];

  // cropper state
const [isCropperOpen, setIsCropperOpen] = useState(false);
const [rawImage, setRawImage] = useState<HTMLImageElement | null>(null);
const [zoom, setZoom] = useState(1);            // 1..4
const [offset, setOffset] = useState({ x: 0, y: 0 }); // pan (px)
const [isPanning, setIsPanning] = useState(false);
const cropBoxSize = 256; // px visible crop square

// EDIT cropper state
const [isEditCropperOpen, setIsEditCropperOpen] = useState(false);
const [editRawImage, setEditRawImage] = useState<HTMLImageElement | null>(null);
const [editZoom, setEditZoom] = useState(1);
const [editOffset, setEditOffset] = useState({ x: 0, y: 0 });
const [isEditPanning, setIsEditPanning] = useState(false);


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
    toast.success(`הקטגוריה "${categoryToDelete?.name}" נמחקה בהצלחה!`);
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  

  const closeAllModals = () => {
  setShowAddCatModal(false);
  setShowDeleteModal(false);
  setShowEditModal(false);
  setNewCatName("");
  setNewCatImage(null);
  setCategoryToDelete(null);
  setCategoryToEdit(null);

  // cropper resets
  setRawImage(null);
  setIsCropperOpen(false);
  setZoom(1);
  setOffset({ x: 0, y: 0 });
  setIsPanning(false);
  setIsEditCropperOpen(false);
  setEditRawImage(null);
  setEditZoom(1);
  setEditOffset({ x: 0, y: 0 });
  setIsEditPanning(false);

};


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

      <div className="w-full flex justify-center flex-wrap gap-10 my-12">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] relative group"
          >
            <div className="flex items-center justify-center relative">
              <div
                onClick={() => {
                  if (category.type === null) {
                    setCategoryToType(category);
                  } else if (category.type === "prodparent") {
                    navigate("/categories/single-cat");
                  } else if (category.type === "catparent") {
                    navigate(`/subcat/${encodeURIComponent(category.name)}`);
                  }
                }}
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

                {role === "admin" && (
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
                      {/* Tooltip */}
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
                )}
              </div>
            </div>
            <span className="text-base text-slate-700 font-medium mt-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>
      {role === "admin" && (
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

      {role === "admin" && (
        <>
          {" "}
             <AddCategoryModal
  isOpen={showAddCatModal}
  onClose={() => setShowAddCatModal(false)}
  onSave={({ name, image }: AddCategoryResult) => {
    const newCategory = {
      id: Date.now(),
      name,
      image,
      type: null,
      favorite: false,
    };
    setCategories((prev) => [...prev, newCategory]);
    setShowAddCatModal(false);
    toast.success(`הקטגוריה "${name}" נוספה בהצלחה!`);
  }}
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
                  האם ברצונך למחוק את הקטגוריה "{categoryToDelete.name}"?
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
    setIsEditCropperOpen(false);
    setEditRawImage(null);
    setEditZoom(1);
    setEditOffset({ x: 0, y: 0 });
    setIsEditPanning(false);
  }}
  onSave={(updated) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setShowEditModal(false);
    setCategoryToEdit(null);
    toast.success(`הקטגוריה "${updated.name}" עודכנה בהצלחה!`);
  }}
/>
)}
        </>
      )}



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
              מה ברצונך שהקטגוריה {categoryToType?.name} תכיל?{" "}
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
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-64"
              >
                מוצרים בודדים{" "}
              </button>

              <button
                onClick={() => {
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === categoryToType.id
                        ? { ...cat, type: "catparent" }
                        : cat
                    )
                  );

                  setCategoryToType(null);
                }}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all w-64 shadow-md hover:shadow-lg"
              >
                תתי-קטגוריות{" "}
              </button>

              <button
                onClick={() => setCategoryToType(null)}
                className="p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all w-32"
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
