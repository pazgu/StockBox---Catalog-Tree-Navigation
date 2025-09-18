import React, { FC, useState, useEffect } from 'react';
import './About.css';
import pic1 from '../../../../assets/pic1.jpg';
import pic2 from '../../../../assets/pic2.jpg';
import pic3 from '../../../../assets/pic3.jpg';

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [pic1, pic2, pic3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // מחליף תמונה כל 3 שניות
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="About">
      <div className="about-container">
        {/* ימין – גלריית תמונות / תצוגה */}
        <div className="image-section">
          <div className="image-container">
            <img
              src={images[currentImageIndex]}
              alt="StockBox preview"
              className="main-image"
            />
          </div>
        </div>

        {/* שמאל – תוכן */}
        <div className="content-section">
          <h1 className="main-title">אודות StockBox</h1>

          <p className="description">
            <strong>StockBox</strong> היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד.
            המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה—כך שתוכלו למצוא במהירות
            נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על רציפות ידע בצוות.
          </p>

          <h2 className="section-title">מה אפשר לעשות עם StockBox</h2>
          <ul className="services-list">
            <li>איחוד מידע במקום אחד — דפים, קבצים, החלטות, הערות ושיתופים.</li>
            <li>חיפוש חכם ומהיר — לפי כותרת, תגיות, מחבר ותוכן.</li>
            <li>הרשאות ותפקידים — הפרדה בין &quot;צופים&quot; ל&quot;עורכים&quot; כדי לשמור על סדר ואיכות.</li>
            <li>תיעוד שינויים — היסטוריית עדכונים והקשר סביב כל פריט ידע.</li>
          </ul>

          <h2 className="section-title">החזון שלנו</h2>
          <p className="vision-text">
            אנחנו מאמינים שידע טוב הוא כזה שנגיש לכולם, ברור ועדכני. StockBox נבנתה כדי
            לצמצם בזבוז זמן בחיפושים, למנוע &quot;איי-ידע&quot; מפוזרים ולחזק שקיפות ושיתופיות.
            היעד: מערכת יציבה, נעימה לשימוש, שמתאימה לזרימת העבודה היומיומית של הצוות וגדלה יחד איתו.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
