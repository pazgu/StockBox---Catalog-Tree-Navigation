import React, { FC, useState } from "react"
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
  const [role] = useState<string | null>(() => localStorage.getItem("role"));
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("מצלמת DSLR קלאסית עם עדשה אדומה");
  const [description, setDescription] = useState(
    "פתרון מקצועי לצילום איכותי עם עיצוב רטרו ועמידות גבוהה."
  );

  return (
    <div className="SingleProd">
      <div className="page-container">
        {/* כותרת ראשית */}
        <div className="main-title">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            title
          )}
        </div>

        <div className="sub-description">
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          ) : (
            description
          )}
        </div>

        <div className="page-content">
          <div className="image-and-button-section">
            <div className="product-image">
              <img src={cam} alt="מצלמת DSLR קלאסית עם עדשה אדומה" />
            </div>

            {/* Container for buttons */}
            {role === "user" ? (
              <div className="buttons-container">
                <button className="heart-btn">
                  <Heart size={20} strokeWidth={2} />
                </button>
                <button className="contact-button">פנייה לחבר צוות</button>
              </div>
            ) : role === "admin" ? (
              <div className="buttons-container">
                <a href="/permissions" className="prem-button">
                  נהל הרשאות
                </a>
              </div>
            ) : null}
          </div>

          <div className="info-section-container">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>תיאור המוצר</AccordionTrigger>
                <AccordionContent>
                  {isEditing ? (
                    <textarea
                      value={
                        "מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל הגדרות הצילום."
                      }
                      onChange={() => {}}
                    />
                  ) : (
                    "מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל הגדרות הצילום."
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specifications">
                <AccordionTrigger>מפרט טכני</AccordionTrigger>
                <AccordionContent>
                  רזולוציה 24MP, חיישן APS-C, עדשה 18-55mm, מסך LCD 3 אינץ',
                  חיבור Wi-Fi
                </AccordionContent>
              </AccordionItem>

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
      <button
        className="prem-button"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "סיום עריכה" : "עריכת דף"}
      </button>
    </div>
  )
}

export default SingleProd
