import React, { FC, useState, useEffect } from 'react';
import {
  Star, Settings, TrendingUp, Search, CheckCircle2, Compass, Edit2, X, Plus, GripVertical,
  Camera, Video, Image as ImageIcon, Images, Microscope, Beaker, FlaskConical, TestTube, Rocket,
  Wrench, Shield, Cloud, Database, Folder, FileText, Share2, Users, AlertTriangle, Bell, Calendar,
  Map, MessageSquare, ClipboardList, Box, Package, Layers, Tag, Link, Lock, Unlock, Upload, Download
} from 'lucide-react';
import pic1 from '../../../../assets/pic1.jpg';
import pic2 from '../../../../assets/pic2.jpg';
import pic3 from '../../../../assets/pic3.jpg';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import { toast } from 'sonner';
import isEqual from "lodash/isEqual";

// --- Hebrew icon catalog (value is what we store; label is what we show) ---
const ICONS_HE = [
  { value: "כוכב",          label: "כוכב (דגש/מועדפים)",          component: Star },
  { value: "הגדרות",        label: "הגדרות",                       component: Settings },
  { value: "מגמה",          label: "מגמה/שיפור",                   component: TrendingUp },
  { value: "חיפוש",         label: "חיפוש",                        component: Search },
  { value: "אישור",         label: "אישור/בדיקה",                  component: CheckCircle2 },
  { value: "מצפן",          label: "ניווט/מצפן",                    component: Compass },

  // Cameras / experiments / lab
  { value: "מצלמה",         label: "מצלמה",                        component: Camera },
  { value: "וידאו",         label: "וידאו/צילום",                  component: Video },
  { value: "תמונה",         label: "תמונה",                        component: ImageIcon },
  { value: "גלריה",         label: "גלריה",                        component: Images },
  { value: "מיקרוסקופ",     label: "מיקרוסקופ",                    component: Microscope },
  { value: "כוס מדידה",     label: "כוס מדידה (Beaker)",           component: Beaker },
  { value: "מבקרון",        label: "מבקרון (Flask)",               component: FlaskConical },
  { value: "מבחנה",         label: "מבחנה (Test Tube)",            component: TestTube },
  { value: "טיל",           label: "טיל/ניסוי",                    component: Rocket },

  // Useful app icons
  { value: "כלים",          label: "כלים/תחזוקה",                  component: Wrench },
  { value: "מגן",           label: "אבטחה/מגן",                    component: Shield },
  { value: "ענן",           label: "ענן/סנכרון",                    component: Cloud },
  { value: "מסד נתונים",    label: "מסד נתונים",                   component: Database },
  { value: "תיקייה",        label: "תיקייה",                        component: Folder },
  { value: "מסמך",          label: "מסמך/קובץ",                     component: FileText },
  { value: "שיתוף",         label: "שיתוף",                         component: Share2 },
  { value: "משתמשים",       label: "משתמשים/צוות",                  component: Users },
  { value: "אזהרה",         label: "אזהרה/שגיאה",                   component: AlertTriangle },
  { value: "התראה",         label: "התראה/פעמון",                   component: Bell },
  { value: "לוח שנה",       label: "לוח שנה",                       component: Calendar },
  { value: "מפה",           label: "מפה",                           component: Map },
  { value: "הודעה",         label: "הודעה/דיון",                    component: MessageSquare },
  { value: "רשימת משימות",  label: "רשימת משימות",                  component: ClipboardList },
  { value: "קופסה",         label: "קופסה/מוצר",                    component: Box },
  { value: "חבילה",         label: "חבילה/משלוח",                   component: Package },
  { value: "שכבות",         label: "שכבות/יררכיה",                  component: Layers },
  { value: "תגית",          label: "תגית/קטגוריה",                   component: Tag },
  { value: "קישור",         label: "קישור",                         component: Link },
  { value: "נעילה",         label: "נעילה",                         component: Lock },
  { value: "פתיחה",         label: "פתיחה/שחרור",                   component: Unlock },
  { value: "העלאה",         label: "העלאה",                         component: Upload },
  { value: "הורדה",         label: "הורדה",                         component: Download },
];

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
const touchStartXRef = React.useRef<number | null>(null);

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

// Touch swipe
const onTouchStart = (e: React.TouchEvent) => {
  touchStartXRef.current = e.touches[0].clientX;
};
const onTouchEnd = (e: React.TouchEvent) => {
  if (touchStartXRef.current == null) return;
  const dx = e.changedTouches[0].clientX - touchStartXRef.current;
  touchStartXRef.current = null;
  if (dx > 40) goPrev();
  if (dx < -40) goNext();
};


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

  const [draggedFeatureIndex, setDraggedFeatureIndex] = useState<number | null>(null);
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

    toast.success("השינויים נישמרו בהצלחה");
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



  const handleFeatureChange = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...editableFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditableFeatures(newFeatures);
  };

  const clearAllImages = () => {
  setEditableImages([]);
  setCurrentImageIndex(0);
};


  const handleFeatureIconChange = (index: number, iconName: string) => {
    const newFeatures = [...editableFeatures];
    newFeatures[index] = { ...newFeatures[index], icon: iconName };
    setEditableFeatures(newFeatures);
  };

  const addFeature = () => {
  if (!isEditing) setIsEditing(true);

  const newItem = { icon: "כוכב", title: "כותרת חדשה", description: "תיאור פיצ'ר חדש." };
  const nextIndex = editableFeatures.length;

  setEditableFeatures(prev => [...prev, newItem]);

  // Wait for DOM to paint, then scroll & focus
  requestAnimationFrame(() => {
    const el = featureItemRefs.current[nextIndex];
    const input = featureTitleInputRefs.current[nextIndex];

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // quick visual cue
      el.classList.add("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white");
      }, 1200);
    }
    if (input) {
      input.focus();
      input.select();
    }
  });
};


  const removeFeature = (index: number) => {
    const newFeatures = editableFeatures.filter((_, i) => i !== index);
    setEditableFeatures(newFeatures);
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

  // Drag and drop handlers for features
  const handleFeatureDragStart = (index: number) => {
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedFeatureIndex === null || draggedFeatureIndex === index) return;

    const newFeatures = [...editableFeatures];
    const draggedItem = newFeatures[draggedFeatureIndex];
    newFeatures.splice(draggedFeatureIndex, 1);
    newFeatures.splice(index, 0, draggedItem);

    setEditableFeatures(newFeatures);
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragEnd = () => {
    setDraggedFeatureIndex(null);
  };

  // Drag and drop handlers for vision points
  const handleVisionDragStart = (index: number) => {
    setDraggedVisionIndex(index);
  };

  const handleVisionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedVisionIndex === null || draggedVisionIndex === index) return;

    const newVisionPoints = [...editableVisionPoints];
    const draggedItem = newVisionPoints[draggedVisionIndex];
    newVisionPoints.splice(draggedVisionIndex, 1);
    newVisionPoints.splice(index, 0, draggedItem);

    setEditableVisionPoints(newVisionPoints);
    setDraggedVisionIndex(index);
  };

  const handleVisionDragEnd = () => {
    setDraggedVisionIndex(null);
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
                onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-stockblue/30 bg-white px-5 py-2.5 text-sm font-semibold text-stockblue shadow-md hover:bg-stockblue hover:text-white transition-all duration-300"
              >
                <Edit2 size={18} />
                {isEditing ? 'שמור שינויים' : 'ערוך דף אודות'}
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
<div className="flex items-center justify-between mb-4">
  {isEditing ? (
    <input
      type="text"
      value={featuresTitle}
      onChange={(e) => setFeaturesTitle(e.target.value)}
      className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
    />
  ) : (
    <h2 className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
      {featuresTitle}
    </h2>
  )}
  {isEditing && (
  <button
    onClick={addFeature}
    className="ml-3 mt-4 inline-flex items-center gap-1 text-stockblue hover:text-blue-700 font-semibold text-sm"
  >
    הוסף פיצ'ר
    <Plus size={16} />
  </button>
)}
</div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
            {editableFeatures.map((feature, index) => {
              const IconComponent = IconMap[feature.icon] || Star; 
              return (
               <div 
                  key={index} 
                  ref={(el) => { if (el) featureItemRefs.current[index] = el; }}
                  className={`relative bg-white/90 backdrop-blur-[8px] rounded-[14px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stockblue/8 transition-all duration-[250ms] ease-out hover:transform hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/96 ${
                    isEditing ? 'cursor-move' : ''
                  } ${draggedFeatureIndex === index ? 'opacity-50' : ''}`}
                  draggable={isEditing}
                  onDragStart={() => handleFeatureDragStart(index)}
                  onDragOver={(e) => handleFeatureDragOver(e, index)}
                  onDragEnd={handleFeatureDragEnd}
                >
                  {isEditing && editableFeatures.length > 1 && (
                    <button
                      onClick={() => removeFeature(index)}
                      className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 z-10 p-1 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                      title="הסר פיצ'ר"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                    <IconComponent size={22} />
                  </div>
                  {isEditing && (
                    <div className="flex-shrink-0">
                     <select
  value={feature.icon}
  onChange={(e) => handleFeatureIconChange(index, e.target.value)}
  className="text-xs font-semibold text-gray-800 mb-1 leading-[1.3] w-full border border-stockblue/30 rounded px-1 py-0.5 focus:outline-none focus:border-stockblue"
>
  {iconOptions.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

                    </div>
                  )}
                  <div className="feature-content flex-1">
                    {isEditing ? (
                      <>
                        <input
                         ref={(el) => { if (el) featureTitleInputRefs.current[index] = el; }}
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                          className="text-[1.1rem] font-bold text-gray-800 mb-1.5 leading-[1.3] w-full border border-stockblue/30 rounded px-2 py-1 focus:outline-none focus:border-stockblue"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                          className="text-[0.97rem] text-gray-600 leading-[1.6] w-full border-2 border-stockblue/30 rounded px-3 py-2 focus:outline-none focus:border-stockblue min-h-[80px]" // Added border-2, more padding, increased min-height
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-[1.1rem] font-bold text-gray-800 m-0 mb-1.5 leading-[1.3]">{feature.title}</h3>
                        <p className="text-[0.97rem] text-gray-600 m-0 leading-[1.6]">{feature.description}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vision Section */}
          <div className="flex items-center justify-between mb-4">
  {isEditing ? (
    <input
      type="text"
      value={visionTitle}
      onChange={(e) => setVisionTitle(e.target.value)}
      className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
    />
  ) : (
    <h2 className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
      {visionTitle}
    </h2>
  )}
 {isEditing && (
  <button
    onClick={addVisionPoint}
    className="mt-4 ml-3 inline-flex items-center gap-1 text-stockblue hover:text-blue-700 font-semibold text-sm"
  >
    הוסף נקודה
    <Plus size={16} />
  </button>
)}
</div>


          <ul className="list-none p-0 my-5 mb-7 grid gap-3">
            {editableVisionPoints.map((point, i) => (
              <li 
                key={i} 
                ref={(el) => { if (el) visionItemRefs.current[i] = el; }}   
                className={`flex items-start gap-2.5 ${
                  isEditing ? 'cursor-move' : ''
                } ${draggedVisionIndex === i ? 'opacity-50' : ''}`}
                draggable={isEditing}
                onDragStart={() => handleVisionDragStart(i)}
                onDragOver={(e) => handleVisionDragOver(e, i)}
                onDragEnd={handleVisionDragEnd}
              >
                {isEditing && (
                  <div className="flex-shrink-0 text-stockblue/40 cursor-move mt-1">
                    <GripVertical size={18} />
                  </div>
                )}
                <span className="bg-stockblue/10 text-stockblue w-7 h-7 rounded-full inline-flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </span>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={(el) => { if (el) visionInputRefs.current[i] = el; }}   
                      type="text"
                      value={point}
                      onChange={(e) => handleVisionPointChange(i, e.target.value)}
                      className="flex-1 text-slate-700 text-base leading-[1.7] border border-stockblue/30 rounded px-3 py-1.5 focus:outline-none focus:border-stockblue"
                    />
                    {editableVisionPoints.length > 1 && (
                      <button
                        onClick={() => removeVisionPoint(i)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-700 text-base leading-[1.7]">{point}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Image Section */}
        <div className="flex-[0_0_320px] flex justify-center items-start lg:fixed lg:top-[164px] lg:left-5 z-10 order-1 lg:order-2">
          <div className="relative w-[300px] h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-500/20 to-purple-500/20 rounded-full scale-110 blur-3xl"></div>

          <div
  ref={imageWrapRef}
  tabIndex={0}
  onTouchStart={onTouchStart}
  onTouchEnd={onTouchEnd}
  className={`relative z-10 w-full h-full rounded-[3rem] overflow-hidden
    bg-gradient-to-br from-white via-blue-50 to-blue-100/70
    shadow-2xl border-4 border-white/60 backdrop-blur-sm
    ${isEditing ? '' : 'transition-all duration-700 ease-out hover:shadow-[0_30px_80px_rgba(59,130,246,0.3)] hover:scale-105 hover:-translate-y-2 hover:rotate-2'}`}
>



  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-600/10 z-10 pointer-events-none"></div>
  <div
  className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent
    z-20 pointer-events-none skew-x-12
    ${isEditing ? '' : '-translate-x-full hover:translate-x-full transition-transform duration-1000'}`}
></div>


   {images.length > 0 ? (
  <>
    {/* Current image */}
    <img
      src={images[currentImageIndex]}
      alt="StockBox preview"
      className={`w-full h-full object-cover scale-105 ${
        isEditing ? '' : 'transition-all duration-1000 ease-out hover:scale-110'
      } pointer-events-none`}
    />
   {/* Side arrows — show only in edit mode */}
{isEditing && images.length > 1 && (
  <>
    <button
      type="button"
      onClick={goPrev}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-[60]
                 h-9 w-9 rounded-full grid place-items-center
                 bg-white/90 text-gray-800 shadow hover:bg-white focus:outline-none"
      aria-label="תמונה קודמת"
      title="קודם"
    >
      ‹
    </button>

    <button
      type="button"
      onClick={goNext}
      className="absolute left-3 top-1/2 -translate-y-1/2 z-[60]
                 h-9 w-9 rounded-full grid place-items-center
                 bg-white/90 text-gray-800 shadow hover:bg-white focus:outline-none"
      aria-label="תמונה הבאה"
      title="הבא"
    >
      ›
    </button>
  </>
)}



    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent z-10 pointer-events-none"></div>

    {/* Delete current image */}
    {isEditing && role === 'admin' && (
      <button
        onClick={() => removeImage(currentImageIndex)}
        className="absolute top-4 right-4 z-[60] pointer-events-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white bg-red-600/90 hover:bg-red-700 shadow-xl transition-all" 
        title="מחק את התמונה הנוכחית"
        aria-label="מחק תמונה"
      >
        מחק תמונה
      </button>
    )}

    {/* Delete all images */}
    {isEditing && role === 'admin' && images.length > 0 && (
      <button
        onClick={clearAllImages}
        className="absolute top-4 left-4 z-[60] pointer-events-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-red-700 bg-white/90 border border-red-200 hover:bg-red-50 shadow transition-all"
        title="מחק את כל התמונות"
      >
        מחק הכל
      </button>
    )}

   {/* Toolbar (edit mode only, no numbers) */}
{isEditing && role === 'admin' && (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur shadow-lg px-3 py-2">
    {/* Replace current */}
    <button
      onClick={() => replaceInputRef.current?.click()}
      className="h-8 rounded-full px-3 text-xs font-semibold bg-white text-stockblue border border-stockblue/20 hover:bg-blue-50"
      title="החלף תמונה נוכחית"
    >
      החלף
    </button>
    <input
      ref={replaceInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => handleReplaceImage(currentImageIndex, e)}
    />

    {/* Add new */}
    <button
      onClick={() => addInputRef.current?.click()}
      className="h-8 rounded-full px-3 text-xs font-semibold bg-stockblue text-white hover:bg-blue-700"
      title="הוסף תמונה חדשה"
    >
      <span className="inline-flex items-center gap-1">
        <Plus size={14} /> הוסף
      </span>
    </button>
    <input
      ref={addInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleAddImages}
    />
  </div>
)}

  </>
) : (
  /* EMPTY STATE with Upload icon */
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
    <button
      onClick={() => addInputRef.current?.click()}
      className="group w-full h-full rounded-[3rem] border-2 border-dashed border-stockblue/30 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 hover:border-stockblue/50 hover:bg-white transition"
      title="העלה תמונה"
    >
      <Upload size={32} className="opacity-70 group-hover:opacity-100" />
      <span className="text-stockblue/80 font-semibold">אין תמונות כרגע – לחצו כדי להעלות</span>
      <span className="text-xs text-slate-500">PNG · JPG · JPEG</span>
    </button>
    <input
      ref={addInputRef}
      type="file"
      accept="image/*"
      multiple                               
      className="hidden"
      onChange={handleAddImages}  
    />
  </div>
)}

</div>


           <div
  className={`absolute -top-6 -right-6 w-24 h-24
    bg-gradient-to-br from-blue-400/40 to-purple-400/30
    rounded-full blur-2xl pointer-events-none -z-10
    ${isEditing ? '' : 'animate-pulse'}`}
></div>


<div
  className={`absolute -bottom-8 -left-8 w-32 h-32
    bg-gradient-to-tr from-purple-500/20 to-blue-500/30
    rounded-full blur-3xl pointer-events-none -z-10
    ${isEditing ? '' : 'animate-pulse'}`}
></div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;