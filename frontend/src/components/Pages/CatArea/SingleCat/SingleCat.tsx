import React, { FC, useState, ChangeEvent } from 'react';
import canoneos2000d from '../../../../assets/canon-eos2000d.png';
import canoneos4000d from '../../../../assets/canon-eos4000d.png';
import canoneos250d from '../../../../assets/canon-eos250d.png';
import canoneosr10 from '../../../../assets/canon-eosr10.png';
import canoneosr50 from '../../../../assets/canon-eosr50.png';
import canoneosr100 from '../../../../assets/canon-eosr100.png';
import { Heart, Pen, Trash } from 'lucide-react';

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
  const [newProductName, setNewProductName] = useState("");
  const [newProductLens, setNewProductLens] = useState("");
  const [newProductColor, setNewProductColor] = useState("");
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<CameraProduct | null>(
    null
  );

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = (id: number) =>
    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, favorite: !cam.favorite } : cam
      )
    );

  const handleDelete = (product: CameraProduct) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete)
      setCameras(cameras.filter((cam) => cam.id !== productToDelete.id));
    setShowDeleteModal(false);
    setProductToDelete(null);
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
      setCameras([...cameras, newProduct]);
    }
    setShowAddCatModal(false);
    setNewProductName("");
    setNewProductImage(null);
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-5 rtl">
      {/* Header */}
      <header className="flex flex-col items-start mt-[150px] mb-10">
        <h1 className="text-[48px] font-light font-alef text-[#0D305B] border-b-4 border-gray-400 pb-1 mb-5 tracking-tight">
          קטגוריה: צילום
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-base">סך הכל פריטים: {cameras.length}</span>
        </div>
      </header>

      {/* Product Grid */}
      <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-14">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="flex flex-col items-center p-5 text-center border-b-2 border-gray-200 relative transition-transform duration-300 hover:-translate-y-1"
          >
            {/* Delete overlay button */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] pointer-events-none">
              <button
                onClick={() => handleDelete(camera)}
                className="absolute top-1 right-[90px] opacity-0 transform translate-x-3 scale-90 transition-all duration-300 ease-in-out pointer-events-auto h-8 w-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white hover:scale-110"
              >
                <Trash size={20} />
              </button>
            </div>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(camera.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <Heart
                size={22}
                strokeWidth={2}
                className={camera.favorite ? "fill-red-500 text-red-500" : "text-white"}
              />
            </button>

            {/* Product image */}
            <div className="h-[140px] w-full flex justify-center items-center p-5">
              <img
                src={camera.imageUrl}
                alt={camera.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Product details */}
            <div className="w-full text-center pt-4 border-t border-gray-200">
              <h2 className="text-[1.1rem] text-[#0D305B] mb-2">{camera.name}</h2>
              <p className="text-sm text-gray-600 mb-1">
                <strong className="text-gray-800">עדשה:</strong> {camera.lens}
              </p>
              <p className="text-sm text-gray-600">
                <strong className="text-gray-800">צבע:</strong> {camera.color}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Add product button */}
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

      {/* Add modal */}
      {showAddCatModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-4">הוסף קטגוריה חדשה</h4>
            <input
              type="text"
              placeholder="שם מוצר"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="עדשת מוצר"
              value={newProductLens}
              onChange={(e) => setNewProductLens(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="צבע מוצר"
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
                className="w-full mt-2 rounded"
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
      {showDeleteModal && productToDelete && (
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
            <small className="text-gray-500">
              לא יהיה ניתן לבטל פעולה זו
            </small>
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
    </div>
  );
};

export default SingleCat;
