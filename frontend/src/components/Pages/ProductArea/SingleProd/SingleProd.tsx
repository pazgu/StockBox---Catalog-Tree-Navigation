import React, { FC, useState } from 'react';
import './SingleProd.css';

interface SingleProdProps {}

const SingleProd: FC<SingleProdProps> = () => {
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    specifications: false,
    features: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="SingleProd">
      <div className="page-container">
        
        {/* כותרת ראשית */}
        <div className="main-title">
          מצלמת DSLR קלאסית עם עדשה אדומה
        </div>
        
        {/* תיאור משני */}
        <div className="sub-description">
          פתרון מקצועי לצילום איכותי עם עיצוב רטרו ועמידות גבוהה.
        </div>

        {/* תוכן הדף */}
        <div className="page-content">
          
          {/* אזור התמונה והכפתור */}
          <div className="image-and-button-section">
            <div className="share-icons">
              <button className="share-btn">❤</button>
              <button className="share-btn">📤</button>
            </div>
            <div className="product-image">
              <img src="https://tse4.mm.bing.net/th/id/OIP.cQGfAy2KRulpq2-XsasyYgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="מצלמת DSLR קלאסית עם עדשה אדומה" />
            </div>
            <button className="contact-button">פנייה לחבר צוות</button>
          </div>

          {/* אזור המידע */}
          <div className="info-section-container">
            
            {/* תיאור המוצר */}
            <div className="info-row">
              <div className="info-content">
                <div className="info-label">תיאור המוצר</div>
                <div 
                  className="arrow-button" 
                  onClick={() => toggleSection('description')}
                >
                  {expandedSections.description ? '∨' : '∧'}
                </div>
              </div>
              {expandedSections.description && (
                <div className="expanded-content">
                  <p>מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל הגדרות הצילום.</p>
                </div>
              )}
            </div>

            {/* מפרט טכני */}
            <div className="info-row">
              <div className="info-content">
                <div className="info-label">מפרט טכני</div>
                <div 
                  className="arrow-button" 
                  onClick={() => toggleSection('specifications')}
                >
                  {expandedSections.specifications ? '∨' : '∧'}
                </div>
              </div>
              {expandedSections.specifications && (
                <div className="expanded-content">
                  <p>רזולוציה 24MP, חיישן APS-C, עדשה 18-55mm, מסך LCD 3 אינץ', חיבור Wi-Fi</p>
                </div>
              )}
            </div>

            {/* מאפיינים עיקריים */}
            <div className="info-row">
              <div className="info-content">
                <div className="info-label">מאפיינים עיקריים</div>
                <div 
                  className="arrow-button" 
                  onClick={() => toggleSection('features')}
                >
                  {expandedSections.features ? '∨' : '∧'}
                </div>
              </div>
              {expandedSections.features && (
                <div className="expanded-content features-list">
                  <div className="feature-item">• איכות תמונה חדה במיוחד</div>
                  <div className="feature-item">• עיצוב רטרו יוקרתי עם טבעות אדומות</div>
                  <div className="feature-item">• צילום ווידאו 4K מקצועי</div>
                  <div className="feature-item">• עדשה מהירה לצילום בתאורה חלשה</div>
                  <div className="feature-item">• נוחות אחיזה ובקרה</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProd;