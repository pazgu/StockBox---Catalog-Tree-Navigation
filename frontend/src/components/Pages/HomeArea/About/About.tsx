import React, { FC, useState, useEffect } from 'react';
import { Star, Settings, TrendingUp, Search, CheckCircle2 , Compass  } from 'lucide-react';
import pic1 from '../../../../assets/pic1.jpg';
import pic2 from '../../../../assets/pic2.jpg';
import pic3 from '../../../../assets/pic3.jpg';
import { useNavigate } from 'react-router-dom';

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [pic1, pic2, pic3];
  const navigate = useNavigate(); 

  const handleNavigateToCategories = () => {
    navigate("/categories"); // Assuming the path to Categories is "/categories"
  };

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
    <div className="pt-8 min-h-screen font-['Arial'] direction-rtl" dir="rtl">
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

<div className="flex justify-center my-10">
  <button
    onClick={handleNavigateToCategories}
    className="group inline-flex items-center gap-3 rounded-2xl border border-stockblue/20 
               bg-gradient-to-r from-white/90 via-white/80 to-blue-50/60
               px-10 py-4 text-[1.15rem] font-bold text-stockblue backdrop-blur-sm
               shadow-[0_8px_28px_rgba(13,48,91,0.18)] hover:shadow-[0_12px_38px_rgba(13,48,91,0.3)]
               hover:scale-105 active:scale-95 transition-all duration-300 ease-out
               focus:outline-none focus-visible:ring-4 focus-visible:ring-stockblue/25"
  >
    {/* Icon chip */}
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stockblue text-white
                     shadow-[0_4px_14px_rgba(13,48,91,0.35)] group-hover:rotate-12 transition-transform duration-300">
      <Compass size={22} />
    </span>

    גלו את התכולות והאמצעים

    {/* Arrow */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-[22px] w-[22px] -scale-x-100 transition-transform duration-300 group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  </button>
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

        {/* Image Section — replaced with the “shape” from the first code */}
        <div className="flex-[0_0_320px] flex justify-center items-start lg:fixed lg:top-[164px] lg:left-5 z-10 order-1 lg:order-2">
          <div className="relative w-[300px] h-[400px]">
            {/* Decorative background blob (from first code) */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-500/20 to-purple-500/20 rounded-full scale-110 blur-3xl"></div>

            {/* Main image container with organic shape (from first code) */}
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100/70 shadow-2xl transition-all duration-700 ease-out hover:shadow-[0_30px_80px_rgba(59,130,246,0.3)] hover:scale-105 hover:-translate-y-2 hover:rotate-2 border-4 border-white/60 backdrop-blur-sm">
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-600/10 z-10 pointer-events-none"></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none skew-x-12"></div>

              {/* Image */}
              <img
                src={images[currentImageIndex]}
                alt="StockBox preview"
                className="w-full h-full object-cover transition-all duration-1000 ease-out scale-105 hover:scale-110"
              />

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent z-10 pointer-events-none"></div>
            </div>

            {/* Decorative dots (from first code) */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/40 to-purple-400/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
