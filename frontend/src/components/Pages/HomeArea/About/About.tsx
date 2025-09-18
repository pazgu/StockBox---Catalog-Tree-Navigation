import React, { FC, useState, useEffect } from 'react';
import { Star, Settings, TrendingUp, Search } from 'lucide-react';
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

  const features = [
    {
      icon: Star,
      title: "איחוד מידע במקום אחד",
      description: "דפים, קבצים, החלטות, הערות ושיתופים."
    },
    {
      icon: Search,
      title: "חיפוש חכם ומהיר",
      description: "לפי כותרת, תגיות, מחבר ותוכן."
    },
    {
      icon: Settings,
      title: "הרשאות ותפקידים",
      description: "הפרדה בין \"צופים\" ל\"עורכים\" כדי לשמור על סדר ואיכות."
    },
    {
      icon: TrendingUp,
      title: "תיעוד שינויים",
      description: "היסטוריית עדכונים והקשר סביב כל פריט ידע."
    }
  ];

  return (
    <div className="About">
      <div className="about-container">
        {/* שמאל – תוכן */}
        <div className="content-section">
          <h1 className="main-title">אודות StockBox</h1>
          
          <p className="description">
            <strong>StockBox</strong> היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד.
            המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה—כך שתוכלו למצוא במהירות
            נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על רציפות ידע בצוות.
          </p>

          <h2 className="section-title">מה אפשר לעשות עם StockBox</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="section-title">החזון שלנו</h2>
          <p className="vision-text">
            אנחנו מאמינים שידע טוב הוא כזה שנגיש לכולם, ברור ועדכני. StockBox נבנתה כדי
            לצמצם בזבוז זמן בחיפושים, למנוע "איי-ידע" מפוזרים ולחזק שקיפות ושיתופיות.
            היעד: מערכת יציבה, נעימה לשימוש, שמתאימה לזרימת העבודה היומיומית של הצוות וגדלה יחד איתו.
          </p>
        </div>

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
      </div>
    </div>
  );
};

export default About;