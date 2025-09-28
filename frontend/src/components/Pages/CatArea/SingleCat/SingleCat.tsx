import React, { FC, useState } from "react";
import "./SingleCat.css";

import canoneos2000d from "../../../../assets/canon-eos2000d.png";
import canoneos4000d from "../../../../assets/canon-eos4000d.png";
import canoneos250d from "../../../../assets/canon-eos250d.png";
import canoneosr10 from "../../../../assets/canon-eosr10.png";
import canoneosr50 from "../../../../assets/canon-eosr50.png";
import canoneosr100 from "../../../../assets/canon-eosr100.png";
import { Trash, Heart } from "lucide-react";

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
    favorite: false,
  },
  {
    id: 3,
    name: "מצלמה דיגיטלית Canon EOS 250D DSLR",
    lens: "EF-S 18-55mm f/3.5-5.6 III",
    color: "צבע שחור",
    imageUrl: canoneos250d,
    favorite: false,
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
    favorite: false,
  },
];

const SingleCat: FC = () => {
  const [cameras, setCameras] = useState<CameraProduct[]>(initialCameraData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<CameraProduct | null>(
    null
  );

  // 🖤 Toggle favorite
  const toggleFavorite = (id: number) => {
    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, favorite: !cam.favorite } : cam
      )
    );
  };

  const handleDelete = (product: CameraProduct) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setCameras(cameras.filter((camera) => camera.id !== productToDelete.id));
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const closeAllModals = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  return (
    <div className="product-page-container">
      <header className="page-header">
        <h1 className="category-title">קטגוריה: צילום</h1>
        <div className="filters-and-controls">
          <span className="filter-label">סך הכל פריטים: {cameras.length}</span>
        </div>
      </header>

      <main className="product-grid">
        {cameras.map((camera) => (
          <div key={camera.id} className="product-card relative">
            {/* Delete button */}
            <div className="overlay">
              <button
                className="delete-btn"
                onClick={() => handleDelete(camera)}
              >
                <Trash size={25} />
              </button>
            </div>

            {/* Favorite toggle button */}
            <button
              onClick={() => toggleFavorite(camera.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              <Heart
                size={22}
                strokeWidth={2}
                className={
                  camera.favorite
                    ? "fill-red-500 text-red-500"
                    : "text-white"
                }
              />
            </button>

            <div className="product-image-wrapper">
              <img
                src={camera.imageUrl}
                alt={camera.name}
                className="product-image"
              />
            </div>
            <div className="product-details">
              <h2 className="product-name">{camera.name}</h2>
              <p className="product-info">
                <strong>עדשה:</strong> {camera.lens}
              </p>
              <p className="product-info">
                <strong>צבע:</strong> {camera.color}
              </p>
            </div>
          </div>
        ))}
      </main>

      {showDeleteModal && productToDelete && (
        <div className="modal" onClick={closeAllModals}>
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>מחיקת מוצר</h4>
            <p>
              האם אתה בטוח שברצונך למחוק את המוצר "{productToDelete.name}"?
            </p>
            <small>לא יהיה ניתן לבטל פעולה זו</small>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="delete-confirm-btn">
                מחק
              </button>
              <button onClick={closeAllModals}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleCat;
