import React, { FC, useState, useEffect } from 'react';

import pic1 from '../../../../assets/pic1.jpg';
import pic2 from '../../../../assets/pic2.jpg';
import pic3 from '../../../../assets/pic3.jpg';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import { toast } from 'sonner';
import isEqual from "lodash/isEqual";
import {
    Compass, Edit2,Check
} from 'lucide-react';


import { ICONS_HE } from '../../../../mockdata/icons';
import FeaturesSection from './FeaturesSection/FeaturesSection';
import VisionSection from './VisionSection/VisionSection';
import AboutImagesPanel from './AboutImagesPanel/AboutImagesPanel';

// Build a map for rendering (value -> component)
const IconMap: { [key: string]: FC<any> } = Object.fromEntries(
  ICONS_HE.map(i => [i.value, i.component])
);

// Backwards-compat: map old English keys -> Hebrew values (one-time migration)
const EN_TO_HE: Record<string, string> = {
  Star: "כוכב",
  Settings: "הגדרות",
  TrendingUp: "מגמה",
  Search: "חיפוש",
  CheckCircle2: "אישור",
  Compass: "מצפן",
  Plus: "כוכב",         // pick anything sensible if it appears
  X: "אזהרה",           // optional
  GripVertical: "שכבות" // optional
};

// For the <select> options:
const iconOptions = ICONS_HE.map(i => ({ value: i.value, label: i.label }));


interface AboutProps {
}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState("אודות StockBox");
  const [editableContent, setEditableContent] = useState(
    "היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד. המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה. כך שתוכלו למצוא במהירות נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על הנתונים הרצויים."
  );
  const [editableImages, setEditableImages] = useState([pic1, pic2, pic3]);
  const images = editableImages;
  const navigate = useNavigate();
  const { role } = useUser();

const [featuresTitle, setFeaturesTitle] = useState("מה אפשר לעשות עם StockBox");
const [visionTitle, setVisionTitle] = useState("החזון שלנו");

// refs for file inputs
const replaceInputRef = React.useRef<HTMLInputElement>(null);
const addInputRef = React.useRef<HTMLInputElement>(null);

const goPrev = () =>
  setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
const goNext = () =>
  setCurrentImageIndex((i) => (i + 1) % images.length);

// refs for focusing/scrolling to the last-added feature
const featureItemRefs = React.useRef<HTMLDivElement[]>([]);
const featureTitleInputRefs = React.useRef<HTMLInputElement[]>([]);

// refs for focusing/scrolling to the last-added vision point
const visionItemRefs = React.useRef<HTMLLIElement[]>([]);
const visionInputRefs = React.useRef<HTMLInputElement[]>([]);



// Add near other hooks in About
const imageWrapRef = React.useRef<HTMLDivElement | null>(null);

// Keyboard arrows (←/→)
React.useEffect(() => {
  const onKeyDown = (e: KeyboardEvent) => {
    const el = imageWrapRef.current;
    if (!el) return;
    const within =
      el.contains(document.activeElement) || document.activeElement === document.body;
    if (!within) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [goPrev, goNext]);


 const [editableFeatures, setEditableFeatures] = useState([
  { icon: "כוכב",     title: "איחוד מידע במקום אחד", description: "דפים, קבצים, החלטות, הערות ושיתופים." },
  { icon: "חיפוש",    title: "חיפוש חכם ומהיר",      description: "לפי כותרת, תגיות, תיאור ותוכן." },
  { icon: "הגדרות",   title: "הרשאות ותפקידים",     description: "מסך מותאם לכל משתמש. שמירה על סדר ואיכות." },
  { icon: "מגמה",     title: "תיעוד שינויים",       description: "היסטוריית עדכונים והקשר סביב כל פריט." },
]);

useEffect(() => {
  setEditableFeatures(prev =>
    prev.map(f => (EN_TO_HE[f.icon] ? { ...f, icon: EN_TO_HE[f.icon] } : f))
  );
}, []);


  const [editableVisionPoints, setEditableVisionPoints] = useState([
    "מידע ברור, עדכני ונגיש",
    "צמצום זמן חיפוש ",
    "חיזוק שקיפות ושיתופיות בצוות",
    "מערכת נעימה, יציבה ומתאימה לזרימות עבודה יומיומיות.",
    "גדלה יחד עם הצוות והצרכים שלו"
  ]);

  const [draggedVisionIndex, setDraggedVisionIndex] = useState<number | null>(null);

  const handleNavigateToCategories = () => {
    navigate("/categories");
  };

  useEffect(() => {
  if (isEditing) return; // freeze when editing
  const interval = setInterval(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, 3000);
  return () => clearInterval(interval);
}, [images.length, isEditing]);



const handleSaveChanges = () => {
  const hasChanges =
    editableTitle !== originalData.title ||
    editableContent !== originalData.content ||
    !isEqual(editableImages, originalData.images) ||
    !isEqual(editableFeatures, originalData.features) ||
    !isEqual(editableVisionPoints, originalData.visionPoints);

  setIsEditing(false);

  if (hasChanges) {

    setOriginalData({
      title: editableTitle,
      content: editableContent,
      images: editableImages,
      features: editableFeatures,
      visionPoints: editableVisionPoints,
    });

    toast.success("השינויים נשמרו בהצלחה");
  } 
};

const [originalData, setOriginalData] = useState({
  title: editableTitle,
  content: editableContent,
  images: editableImages,
  features: editableFeatures,
  visionPoints: editableVisionPoints,
});

useEffect(() => {
  setOriginalData({
    title: editableTitle,
    content: editableContent,
    images: editableImages,
    features: editableFeatures,
    visionPoints: editableVisionPoints,
  });
}, []);

  useEffect(() => {
  // keep arrays same length as features
  featureItemRefs.current.length = editableFeatures.length;
  featureTitleInputRefs.current.length = editableFeatures.length;

  // keep arrays same length as vision points
  visionItemRefs.current.length = editableVisionPoints.length;
  visionInputRefs.current.length = editableVisionPoints.length;
}, [editableFeatures.length, editableVisionPoints.length]);

// Replace (single file) the image at `index`
const handleReplaceImage = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setEditableImages((prev) => {
      const arr = [...prev];
      if (index >= arr.length) {
        // If index is out of range, append instead
        arr.push(reader.result as string);
        setCurrentImageIndex(arr.length - 1);
      } else {
        arr[index] = reader.result as string;
      }
      return arr;
    });
    event.target.value = '';
  };
  reader.readAsDataURL(file);
};

// ADD (multiple files) to the end
const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(file);
    });

  Promise.all(files.map(toDataUrl)).then((dataUrls) => {
    setEditableImages((prev) => {
      const startIndex = prev.length;          // index of the first newly-added image
      const merged = [...prev, ...dataUrls];
      // jump to the first of the newly added images
      setCurrentImageIndex(startIndex > 0 ? startIndex : 0);
      return merged;
    });
    event.target.value = '';
  });
};


  const removeImage = (index: number) => {
  setEditableImages((prev) => {
    const arr = prev.filter((_, i) => i !== index);
    setCurrentImageIndex((cur) => {
      if (arr.length === 0) return 0;               
      const next = Math.min(cur, arr.length - 1);    
      return next;
    });
    return arr;
  });
};



const handleFeatureChange = (index: number, field: "title" | "description" | "icon", value: string) => {
  setEditableFeatures(prev => {
    const next = [...prev];
    next[index] = { ...next[index], [field]: value };
    return next;
  });
};

  const clearAllImages = () => {
  setEditableImages([]);
  setCurrentImageIndex(0);
};


const addFeature = () => {
  if (!isEditing) setIsEditing(true);
  setEditableFeatures(prev => [...prev, { icon: "כוכב", title: "כותרת חדשה", description: "תיאור פיצ'ר חדש." }]);
};



const removeFeature = (index: number) => {
  setEditableFeatures(prev => prev.filter((_, i) => i !== index));
};
const handleFeaturesReorder = (next: typeof editableFeatures) => {
  setEditableFeatures(next);
};


  const handleVisionPointChange = (index: number, value: string) => {
    const newVisionPoints = [...editableVisionPoints];
    newVisionPoints[index] = value;
    setEditableVisionPoints(newVisionPoints);
  };

  

  const addVisionPoint = () => {
  const nextIndex = editableVisionPoints.length;
  setEditableVisionPoints(prev => [...prev, "נקודה חדשה"]);

  // Wait for DOM to paint, then scroll & focus
  requestAnimationFrame(() => {
    const el = visionItemRefs.current[nextIndex];
    const input = visionInputRefs.current[nextIndex];

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // quick visual cue (same vibe as features)
      el.classList.add("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white", "rounded-lg");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white", "rounded-lg");
      }, 1200);
    }
    if (input) {
      input.focus();
      input.select();
    }
  });
};


  const removeVisionPoint = (index: number) => {
    const newVisionPoints = editableVisionPoints.filter((_, i) => i !== index);
    setEditableVisionPoints(newVisionPoints);
  };




  

  return (
    <div className="pt-8 min-h-screen font-['Arial'] direction-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
        {/* Content Section */}
        <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
          {/* Edit Button moved to the far right (start in RTL) */}
          {role === 'admin' && (
            <div className="flex justify-start mb-4">
            <button
                onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
                className="fixed bottom-6 right-6 inline-flex items-center justify-center w-12 h-12 rounded-full border border-stockblue/30 bg-white text-xl font-semibold text-stockblue shadow-md hover:bg-stockblue hover:text-white transition-all duration-300 z-10"
              >
                {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
              </button>
            </div>
          )}

          {/* Main Title */}
          {isEditing ? (
            <input
              
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="text-[2.5rem] text-stockblue mb-5 font-bold text-center w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
            />
          ) : (
            <h1 className="text-[2.5rem] text-stockblue mb-5 font-bold text-center">
              {editableTitle}
            </h1>
          )}

          {/* Intro Card */}
          <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px] transition-all duration-300 ease-out hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(13,48,91,0.06),0_2px_8px_rgba(13,48,91,0.03)] hover:border-stockblue/10 before:content-[''] before:absolute before:top-0 before:right-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-stockblue before:to-stockblue/30 before:rounded-r-[2px] before:opacity-70 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-stockblue/5 after:rounded-[20px] after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100">
            {isEditing ? (
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full leading-[1.7] text-stockblue/85 font-normal text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[150px]"
              />
            ) : (
              <p className="leading-[1.7] text-stockblue/85 font-normal m-0 text-[1.1rem] text-justify">
                <strong>StockBox</strong> {editableContent}
              </p>
            )}
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
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stockblue text-white
                     shadow-[0_4px_14px_rgba(13,48,91,0.35)] group-hover:rotate-12 transition-transform duration-300">
                <Compass size={22} />
              </span>
              גלו את התכולות והאמצעים
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

          {/* Features Section Header - MODIFIED */}
<FeaturesSection
  isEditing={isEditing}
  title={featuresTitle}
  onChangeTitle={setFeaturesTitle}
  features={editableFeatures}
  onAdd={addFeature}
  onRemove={removeFeature}
  onChange={handleFeatureChange}
  onReorder={handleFeaturesReorder}
  iconOptions={iconOptions}
  IconMap={IconMap}
/>


        

          {/* Vision Section */}


         <VisionSection
  isEditing={isEditing}
  title={visionTitle}
  onChangeTitle={setVisionTitle}
  points={editableVisionPoints}
  onAdd={addVisionPoint}
  onRemove={removeVisionPoint}
  onChange={handleVisionPointChange}
  onReorder={(from, to) => {
    // same logic you used before in onDragOver:
    setEditableVisionPoints((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }}
/>
        </div>

        {/* Image Section */}
        <AboutImagesPanel
  isEditing={isEditing}
  role={role}
  images={images}
  currentIndex={currentImageIndex}
  onPrev={goPrev}
  onNext={goNext}
  onRemoveImage={removeImage}
  onClearAll={clearAllImages}
  onReplaceImage={handleReplaceImage}
  onAddImages={handleAddImages}
  replaceInputRef={replaceInputRef}
  addInputRef={addInputRef}
/>
      </div>
    </div>
  );
};

export default About;