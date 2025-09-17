import React, { FC, useState, useEffect } from 'react';
import './About.css';

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array of image URLs - replace with your actual images
  const images = [
    'page1.jpg', // Replace with your actual image paths
    'page2.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="About">
      <div className="about-container">
        {/* Right side - Image */}
        <div className="image-section">
          <div className="image-container">
            <img 
              src={images[currentImageIndex]} 
              alt="Lovescope photography" 
              className="main-image"
            />
          </div>
        </div>

        {/* Left side - Content */}
        <div className="content-section">
          <h1 className="main-title">אודות Lovescope </h1>
          
          <p className="description">
            Lovescope – צילום זוגות צלמי חתונות מקצועיי, המתמחים 
            בתיעוד הרגעים הקסומים והנדירים שהופכים את היום שלכם לבלתי 
            נשכח.
          </p>

          <h2 className="section-title">השירותים שלנו</h2>
          <ul className="services-list">
            <li>• צילומי איסוי וצמוד מהכנות ועד לחתונת הרקיעים.</li>
            <li>• צילומי טבעי ואותנטי שמטמן את הסיפור האהבה שלכם.</li>
            <li>• שימוש בציוד צילום מהדקות וטכניקות צילומיות.</li>
            <li>• עריכה מקצועית שמדגישה את הרגעים המיוחדים והמרגשים.</li>
          </ul>

          <h2 className="section-title">החזון שלנו</h2>
          <p className="vision-text">
            Lovescope אנחנו מאמינים שתמונות הם לא רק מזכרת –
            הם דרך להזות את הרגעים שוב ושוב.
            המטרה שלנו היא ליצור עבורכם אלבום חתונה שלכן מלא באהבה,
            שמחה ורגעים אמיתיים.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;