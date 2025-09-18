import React, { FC, useState, ChangeEvent } from "react";
import "./Categories.css";
import headphones from "../../../../assets/headphones.png";
import audio from "../../../../assets/audio.png";
import camera from "../../../../assets/camera.png";
import video from "../../../../assets/video.png";

interface CategoriesProps {}

const Categories: FC<CategoriesProps> = () => {
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState<string | null>(null);

  // handle file upload
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

  const handleSave = () => {
    console.log("New category:", newCatName, newCatImage);
    // later: push to categories list
    setShowAddCatModal(false);
    setNewCatName("");
    setNewCatImage(null);
  };

  return (
    <div className="Categories">
      <div className="categories-header">
        <h2 className="categories-title">קטגוריות</h2>
      </div>

      <div className="categories-grid">
        <div className="category-item">
          <div className="category-icon">
            <img src={headphones} alt="headphones" className="category-image" />
          </div>
          <span className="category-label">שמע</span>
        </div>

        <div className="category-item">
          <div className="category-icon">
            <img src={audio} alt="microphone" className="category-image" />
          </div>
          <span className="category-label">הקלטה</span>
        </div>

        <div className="category-item">
          <div className="category-icon">
            <img src={video} alt="video camera" className="category-image" />
          </div>
          <span className="category-label">וידאו</span>
        </div>

        <div className="category-item active">
          <div className="category-icon">
            <img src={camera} alt="camera" className="category-image" />
          </div>
          <span className="category-label">צילום</span>
        </div>
      </div>

      <div className="add-icon" onClick={() => setShowAddCatModal(true)}>
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
        <div className="modal" onClick={() => setShowAddCatModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>הוסף קטגוריה חדשה</h4>

            <input
              type="text"
              placeholder="שם קטגוריה"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {newCatImage && (
              <img
                src={newCatImage}
                alt="preview"
                style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }}
              />
            )}

            <div className="modal-actions">
              <button onClick={handleSave}>שמור</button>
              <button onClick={() => setShowAddCatModal(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
