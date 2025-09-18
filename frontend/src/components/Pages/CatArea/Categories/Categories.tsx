import React, { FC, useState, ChangeEvent } from "react";
import "./Categories.css";
import headphones from "../../../../assets/headphones.png";
import audio from "../../../../assets/audio.png";
import camera from "../../../../assets/camera.png";
import video from "../../../../assets/video.png";
import { Pen } from "lucide-react";
import { Trash } from "lucide-react";

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
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "שמיעה", image: headphones },
    { id: 2, name: "הקלטה", image: audio },
    { id: 3, name: "וידיאו", image: video },
    { id: 4, name: "צילום", image: camera }
  ]);

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

  // handle file upload for edit modal
  const handleEditImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (categoryToEdit) {
          setCategoryToEdit({
            ...categoryToEdit,
            image: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newCatName && newCatImage) {
      const newCategory: Category = {
        id: Date.now(), // Simple ID generation
        name: newCatName,
        image: newCatImage
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
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
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
    <div className="Categories">
      <div className="categories-header">
        <h2 className="categories-title">קטגוריות</h2>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className={`category-item ${category.isActive ? 'active' : ''}`}>
            <div className="overlay">
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(category)}
              >
                <Trash size={25} />
              </button>
              <span className="category-label">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEdit(category)}
                >
                  <Pen size={25} />
                </button>
              </span>
            </div>
            <div className="category-icon">
              <img src={category.image} alt={category.name} className="category-image" />
            </div>
            <span className="category-label">{category.name}</span>
          </div>
        ))}
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
        <div className="modal" onClick={closeAllModals}>
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
              <button onClick={closeAllModals}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && categoryToDelete && (
        <div className="modal" onClick={closeAllModals}>
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>מחיקת קטגוריה</h4>
            <p>האם אתה בטוח שברצונך למחוק את הקטגוריה "{categoryToDelete.name}"?</p>
            <p>פעולה זו לא ניתנת לביטול.</p>

            <div className="modal-actions">
              <button onClick={confirmDelete} className="delete-confirm-btn">מחק</button>
              <button onClick={closeAllModals}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && categoryToEdit && (
        <div className="modal-edit" onClick={closeAllModals}>
          <div
            className="modal-content-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>עריכת קטגוריה</h4>

            <input
              type="text"
              placeholder="שם קטגוריה"
              value={categoryToEdit.name}
              onChange={(e) => setCategoryToEdit({
                ...categoryToEdit,
                name: e.target.value
              })}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleEditImageUpload}
            />

            <img
              className="edit-image"
              src={categoryToEdit.image}
              alt="preview"
              style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "8px" }}
            />

            <div className="modal-actions">
              <button onClick={handleEditSave}>שמור</button>
              <button onClick={closeAllModals}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;