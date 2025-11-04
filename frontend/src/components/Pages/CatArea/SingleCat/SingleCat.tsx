import React, { FC, useState, ChangeEvent, useEffect } from "react";
import canoneos2000d from "../../../../assets/canon-eos2000d.png";
import canoneos4000d from "../../../../assets/canon-eos4000d.png";
import canoneos250d from "../../../../assets/canon-eos250d.png";
import canoneosr10 from "../../../../assets/canon-eosr10.png";
import canoneosr50 from "../../../../assets/canon-eosr50.png";
import canoneosr100 from "../../../../assets/canon-eosr100.png";
import { Heart, Pen, Trash, MoveRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";

export interface CameraProduct {
  id: number;
  name: string;
  lens: string;
  color: string;
  imageUrl: string;
  favorite: boolean;
}

export const initialCameraData: CameraProduct[] = [
  {
    id: 1,
    name: "מצלמה דיגיטלית Canon EOS 250D DSLR",
    lens: "EF-S 18-55mm f/4-5.6 IS",
    color: "צבע שחור",
    imageUrl: canoneos2000d,
    favorite: true,
  },
  {
    id: 2,
    name: "מצלמה דיגיטלית Canon EOS 4000D DSLR",
    lens: "EF-S 18-55mm f/3.5-5.6 III",
    color: "צבע שחור",
    imageUrl: canoneos4000d,
    favorite: true,
  },
  {
    id: 3,
    name: "מצלמה דיגיטלית Canon EOS 250D DSLR",
    lens: "EF-S 18-55mm f/3.5-5.6 III",
    color: "צבע שחור",
    imageUrl: canoneos250d,
    favorite: true,
  },
  {
    id: 4,
    name: "מצלמה דיגיטלית ללא מראה Canon EOS R100",
    lens: "RF-S 18-45mm F4.5-6.3 IS",
    color: "צבע שחור",
    imageUrl: canoneosr100,
    favorite: true,
  },
  {
    id: 5,
    name: "מצלמה דיגיטלית ללא מראה Canon EOS R10",
    lens: "RF-S 18-45mm F4.5-6.3 IS",
    color: "צבע שחור",
    imageUrl: canoneosr10,
    favorite: false,
  },
  {
    id: 6,
    name: "מצלמה דיגיטלית ללא מראה Canon EOS R50",
    lens: "RF-S 18-45mm F4.5-6.3 IS",
    color: "צבע שחור",
    imageUrl: canoneosr50,
    favorite: true,
  },
];

const SingleCat: FC = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [cameras, setCameras] = useState<CameraProduct[]>(initialCameraData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductLens, setNewProductLens] = useState("");
  const [newProductColor, setNewProductColor] = useState("");
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<CameraProduct | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const path: string[] = ["categories", "single-cat"];
  const { role } = useUser();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product`);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = (id: number) => {
    const cam = cameras.find((c) => c.id === id);
    if (!cam) return;

    if (cam.favorite) {
      toast.info(`${cam.name} הוסר מהמועדפים`);
    } else {
      toast.success(`${cam.name} נוסף למועדפים`);
    }

    setCameras((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  const handleDelete = (product: CameraProduct) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete)
      setCameras(cameras.filter((cam) => cam.id !== productToDelete.id));
    setShowDeleteModal(false);
    setProductToDelete(null);
    toast.success(`המוצר "${productToDelete?.name}" נמחק בהצלחה!`);
  };


  const handleSave = () => {
    if (newProductName && newProductImage) {
      const newProduct: CameraProduct = {
        id: Date.now(),
        name: newProductName,
        lens: newProductLens,
        color: newProductColor,
        imageUrl: newProductImage,
        favorite: false,
      };
      setCameras([newProduct, ...cameras]);
    }
    setShowAddCatModal(false);
    setNewProductName("");
    setNewProductImage(null);
    toast.success(`המוצר "${newProductName}" נוסף בהצלחה!`);
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setShowAddCatModal(false);
    setShowDeleteAllModal(false);
    setShowMoveModal(false);
  };

  const handleManagePermissions = () => {
    navigate("/permissions");
  };

  // Selection mode functions
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedProducts([]);
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === cameras.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(cameras.map((cam) => cam.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) {
      toast.error("אנא בחר לפחות מוצר אחד למחיקה");
      return;
    }
    setShowDeleteAllModal(true);
  };

  const confirmDeleteSelected = () => {
    setCameras((prev) =>
      prev.filter((cam) => !selectedProducts.includes(cam.id))
    );
    toast.success(`${selectedProducts.length} מוצרים נמחקו בהצלחה!`);
    setSelectedProducts([]);
    setIsSelectionMode(false);
    setShowDeleteAllModal(false);
  };

  const handleMoveSelected = () => {
    if (selectedProducts.length === 0) {
      toast.error("אנא בחר לפחות מוצר אחד להעברה");
      return;
    }
    setShowMoveModal(true);
  };

  const confirmMove = (destination: string) => {
    // מסיר את המוצרים שנבחרו מהמערך
    setCameras((prev) =>
      prev.filter((cam) => !selectedProducts.includes(cam.id))
    );
    toast.success(
      `${selectedProducts.length} מוצרים הועברו בהצלחה לקטגוריה: ${destination}`
    );
    setSelectedProducts([]);
    setIsSelectionMode(false);
    setShowMoveModal(false);
  };

  return (
    <div className="max-w-290 mx-auto rtl mt-28 mr-4">
      <Breadcrumbs path={path} />
      <header className="flex flex-col items-start mb-10">
        <h1 className="text-[48px] font-light font-alef text-[#0D305B] border-b-4 border-gray-400 pb-1 mb-5 tracking-tight">
          קטגוריה: צילום
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-base">סך הכל פריטים: {cameras.length}</span>
        </div>
      </header>

      {/* Selection toolbar */}
      {role === "admin" && cameras.length !== 0 && (
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
                onClick={selectAllProducts}
                className="text-base underline text-gray-700 hover:text-[#0D305B] transition-colors"
              >
                {selectedProducts.length === cameras.length
                  ? "בטל בחירת הכל"
                  : "בחר הכל"}
              </button>

              {selectedProducts.length > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleDeleteSelected}
                    className="text-base underline text-red-600 hover:text-red-700 transition-colors"
                  >
                    מחק ({selectedProducts.length})
                  </button>

                  <span className="text-gray-400">|</span>
                  <button
                    onClick={handleMoveSelected}
                    className="text-base underline text-gray-700 hover:text-[#0D305B] transition-colors"
                  >
                    העבר ({selectedProducts.length})
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

      {/* Product Grid */}
      <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-14">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className={`flex flex-col items-center p-5 text-center border-b-2 relative transition-all duration-300 hover:-translate-y-1 ${
              selectedProducts.includes(camera.id)
                ? "border-[#0D305B] ring-2 ring-[#0D305B] ring-opacity-30"
                : "border-gray-200"
            }`}
          >
            {/* Selection checkbox */}
            {isSelectionMode && role === "admin" && (
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(camera.id)}
                  onChange={() => toggleProductSelection(camera.id)}
                  className="w-6 h-6 cursor-pointer accent-[#0D305B]"
                />
              </div>
            )}

            {/* Delete button */}
            {role === "admin" && !isSelectionMode && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 pointer-events-none">
                <button
                  onClick={() => handleDelete(camera)}
                  className="absolute top-1 left-1 opacity-1 transform translate-x-3 scale-90 transition-all duration-300 ease-in-out pointer-events-auto h-8 w-8 rounded-full bg-[#e5e7eb] text-gray-800 flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white hover:scale-110"
                >
                  <Trash size={20} />
                </button>
              </div>
            )}

            {/* Favorite */}
            {!isSelectionMode && (
              <button
                onClick={() => toggleFavorite(camera.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <Heart
                  size={22}
                  strokeWidth={2}
                  className={
                    camera.favorite ? "fill-red-500 text-red-500" : "text-white"
                  }
                />
              </button>
            )}

            {/* Product image */}
            <div
              className="h-[140px] w-full flex justify-center items-center p-5"
              onClick={() => !isSelectionMode && handleClick()}
            >
              <img
                src={camera.imageUrl}
                alt={camera.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Product details */}
            <div className="w-full text-center pt-4 border-t border-gray-200">
              <h2 className="text-[1.1rem] text-[#0D305B] mb-2">
                {camera.name}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                <strong className="text-gray-800">עדשה:</strong> {camera.lens}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong className="text-gray-800">צבע:</strong> {camera.color}
              </p>

              {/* Manage permissions button - only for admin*/}
              {role === "admin" && !isSelectionMode && (
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={handleManagePermissions}
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

      {/* Add product button */}
      {role === "admin" && !isSelectionMode && (
        <div
          className="fixed bottom-10 right-10 w-12 h-12 bg-[#0D305B] flex items-center justify-center rounded-full cursor-pointer hover:bg-[#1e3a5f] transition-colors"
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

      {/* Add modal */}
      {role === "admin" && showAddCatModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">הוסף מוצר חדש</h4>
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
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleSave}
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
      {role === "admin" && showDeleteModal && productToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">מחיקת מוצר</h4>
            <p className="mb-1">
              האם אתה בטוח שברצונך למחוק את המוצר "{productToDelete.name}"?
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
      {role === "admin" && showDeleteAllModal && isSelectionMode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">מחיקת מוצרים נבחרים</h4>
            <p className="mb-1">
              האם אתה בטוח שברצונך למחוק {selectedProducts.length} מוצרים?
            </p>
            <small className="text-red-600 font-medium block">
              אזהרה: פעולה זו תמחק את כל המוצרים הנבחרים ולא ניתן יהיה לשחזר
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
      {role === "admin" && showMoveModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">
              העבר {selectedProducts.length} מוצרים לקטגוריה אחרת
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
