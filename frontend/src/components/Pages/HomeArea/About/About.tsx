import React, { FC, useState, useEffect } from 'react';
import { Star, Settings, TrendingUp, Search, CheckCircle2 } from 'lucide-react'; // NOTE: requires `npm i lucide-react`
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
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const features = [
    { icon: Star,       title: "איחוד מידע במקום אחד", description: "דפים, קבצים, החלטות, הערות ושיתופים." },
    { icon: Search,     title: "חיפוש חכם ומהיר",       description: "לפי כותרת, תגיות, ,תיאור ותוכן." },
    { icon: Settings,   title: "הרשאות ותפקידים",       description: "מסך מותאם לכל משתמש. שמירה על סדר ואיכות." },
    { icon: TrendingUp, title: "תיעוד שינויים",         description: "היסטוריית עדכונים והקשר סביב כל פריט ." },
  ];

  const visionPoints = [
    "מידע ברור, עדכני ונגיש",
    "צמצום זמן חיפוש ",
    "חיזוק שקיפות ושיתופיות בצוות",
    "מערכת נעימה, יציבה ומתאימה לזרימות עבודה יומיומיות.",
    "גדלה יחד עם הצוות והצרכים שלו"
  ];

  return (
    <div className="About">
      <div className="about-container">
        <div className="content-section">
          <h1 className="main-title">אודות StockBox</h1>
          <div className="intro-card">
            <p className="description lead-intro">
              <strong>StockBox</strong> היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד.
              המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה. כך שתוכלו למצוא במהירות
              נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על הנתונים הרצויים.
            </p>
          </div>

          <h2 className="section-title">מה אפשר לעשות עם StockBox</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={22} />
                  </div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="section-title vision-title">החזון שלנו</h2>

          <ul className="vision-list">
            {visionPoints.map((point, i) => (
              <li key={i} className="vision-item">
                <span className="vision-bullet">
                  <CheckCircle2 size={18} />
                </span>
                <span className="vision-text-line">{point}</span>
              </li>
            ))}
          </ul>
        </div>

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