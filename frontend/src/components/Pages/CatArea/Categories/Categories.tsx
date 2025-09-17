import React, { FC } from 'react';
import './Categories.css';
import headphones from '../../../../assets/headphones.png';
import audio from '../../../../assets/audio.png';
import camera from '../../../../assets/camera.png';
import video from '../../../../assets/video.png';

interface CategoriesProps {}

const Categories: FC<CategoriesProps> = () => (
  <div className="Categories">
    <div className="categories-header">
      <h2 className="categories-title">קטגוריות</h2>
      <p className="categories-subtitle">הפעלה קטגוריות חדשה +</p>
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
        <div className="selection-arrow"></div>
      </div>
    </div>
    
    <div className="add-category">
      <div className="add-icon">+</div>
    </div>
  </div>
);

export default Categories;