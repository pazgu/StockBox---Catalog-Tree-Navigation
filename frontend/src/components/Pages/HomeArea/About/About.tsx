import React, { FC, useState, useEffect } from 'react';
import { Star, Settings, TrendingUp, Search, CheckCircle2 } from 'lucide-react';
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
    <div className="pt-[100px] min-h-screen font-['Arial'] direction-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
       
        {/* Content Section */}
        <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
         
          {/* Main Title */}
          <h1 className="text-[2.5rem] text-stockblue mb-5 font-bold text-center">
            אודות StockBox
          </h1>
         
          {/* Intro Card */}
          <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px] transition-all duration-300 ease-out hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(13,48,91,0.06),0_2px_8px_rgba(13,48,91,0.03)] hover:border-stockblue/10 before:content-[''] before:absolute before:top-0 before:right-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-stockblue before:to-stockblue/30 before:rounded-r-[2px] before:opacity-70 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-stockblue/5 after:rounded-[20px] after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100">
            <p className="leading-[1.7] text-stockblue/85 font-normal m-0 text-[1.1rem] text-justify">
              <strong>StockBox</strong> היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד.
              המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה. כך שתוכלו למצוא במהירות
              נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על הנתונים הרצויים.
            </p>
          </div>

          {/* Features Section */}
          <h2 className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
            מה אפשר לעשות עם StockBox
          </h2>
         
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white/90 backdrop-blur-[8px] rounded-[14px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stockblue/8 transition-all duration-[250ms] ease-out hover:transform hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/96">
                  <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                    <IconComponent size={22} />
                  </div>
                  <div className="feature-content">
                    <h3 className="text-[1.1rem] font-bold text-gray-800 m-0 mb-1.5 leading-[1.3]">{feature.title}</h3>
                    <p className="text-[0.97rem] text-gray-600 m-0 leading-[1.6]">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vision Section */}
          <h2 className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
            החזון שלנו
          </h2>

          <ul className="list-none p-0 my-5 mb-7 grid gap-3">
            {visionPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="bg-stockblue/10 text-stockblue w-7 h-7 rounded-full inline-flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </span>
                <span className="text-slate-700 text-base leading-[1.7]">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Image Section */}
        <div className="flex-[0_0_320px] flex justify-center items-start lg:fixed lg:top-[164px] lg:left-5 z-10 order-1 lg:order-2">
          <div className="relative w-[300px] h-[400px] rounded-[28px] overflow-hidden opacity-60 bg-gradient-to-br from-white/90 via-blue-50/95 to-blue-100/90 backdrop-blur-[10px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-500 ease-out transform-gpu will-change-transform hover:transform hover:-translate-y-3 hover:scale-[1.03] hover:rotate-x-[2deg] hover:shadow-[0_32px_80px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-[1.02] hover:saturate-[1.05] hover:opacity-100 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:via-30% before:via-white/5 before:via-60% before:to-black/3 before:opacity-0 before:transition-opacity before:duration-500 before:ease-out before:pointer-events-none before:z-[2] hover:before:opacity-100 after:content-[''] after:absolute after:-top-1/2 after:-left-1/2 after:w-[200%] after:h-[200%] after:bg-gradient-to-br after:from-transparent after:from-30% after:via-white/10 after:via-50% after:to-transparent after:to-70% after:rotate-[-45deg] after:translate-x-[-100%] after:translate-y-[-100%] after:transition-transform after:duration-800 after:ease-out after:pointer-events-none after:z-[3] hover:after:translate-x-full hover:after:translate-y-full lg:w-[300px] lg:h-[400px] md:w-[280px] md:h-[395px]">
            <img
              src={images[currentImageIndex]}
              alt="StockBox preview"
              className="w-full h-full object-cover transition-all duration-[1.4s] ease-out transform scale-100 brightness-[0.98] contrast-[1.03] saturate-[1.08] hue-rotate-[2deg] z-[1] hover:scale-[1.08] hover:brightness-[1.04] hover:contrast-[1.06] hover:saturate-[1.12] hover:hue-rotate-[-1deg]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
