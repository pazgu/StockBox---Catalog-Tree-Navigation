import React, { FC } from "react"
import "./SingleProd.css"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../ui/accordion"
import { Heart } from "lucide-react"
import cam from '../../../../assets/red-lens-camera.png';




interface SingleProdProps {}

const SingleProd: FC<SingleProdProps> = () => {
  return (
    <div className="SingleProd">
      <div className="page-container">
        {/* כותרת ראשית */}
        <div className="main-title">מצלמת DSLR קלאסית עם עדשה אדומה</div>

        {/* תיאור משני */}
        <div className="sub-description">
          פתרון מקצועי לצילום איכותי עם עיצוב רטרו ועמידות גבוהה.
        </div>

        {/* תוכן הדף */}
        <div className="page-content">
          {/* אזור התמונה והכפתור */}
          <div className="image-and-button-section">
            <div className="product-image">
              <img
                src={cam}
                alt="מצלמת DSLR קלאסית עם עדשה אדומה"
              />
            </div>
            {/* Container for buttons side by side */}
            <div className="buttons-container">
              <button className="heart-btn">
                <Heart size={20} strokeWidth={2} />
              </button>
              <button className="contact-button">פנייה לחבר צוות</button>
            </div>
          </div>

          {/* אזור המידע */}
          <div className="info-section-container">
            <Accordion type="single" collapsible className="w-full">
              {/* תיאור המוצר */}
              <AccordionItem value="description">
                <AccordionTrigger>תיאור המוצר</AccordionTrigger>
                <AccordionContent>
                  מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה
                  מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל
                  הגדרות הצילום.
                </AccordionContent>
              </AccordionItem>

              {/* מפרט טכני */}
              <AccordionItem value="specifications">
                <AccordionTrigger>מפרט טכני</AccordionTrigger>
                <AccordionContent>
                  רזולוציה 24MP, חיישן APS-C, עדשה 18-55mm, מסך LCD 3 אינץ',
                  חיבור Wi-Fi
                </AccordionContent>
              </AccordionItem>

              {/* מאפיינים עיקריים */}
              <AccordionItem value="features">
                <AccordionTrigger>מאפיינים עיקריים</AccordionTrigger>
                <AccordionContent>
                  <div className="features-list">
                    <div className="feature-item">• איכות תמונה חדה במיוחד</div>
                    <div className="feature-item">
                      • עיצוב רטרו יוקרתי עם טבעות אדומות
                    </div>
                    <div className="feature-item">• צילום ווידאו 4K מקצועי</div>
                    <div className="feature-item">
                      • עדשה מהירה לצילום בתאורה חלשה
                    </div>
                    <div className="feature-item">• נוחות אחיזה ובקרה</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleProd
