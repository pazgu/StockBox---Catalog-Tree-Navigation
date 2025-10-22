import React, { FC, useState, useEffect } from 'react';
import { Star, Settings, TrendingUp, Search, CheckCircle2, Compass, Edit2, X, Plus, GripVertical } from 'lucide-react';
import pic1 from '../../../../assets/pic1.jpg';
import pic2 from '../../../../assets/pic2.jpg';
import pic3 from '../../../../assets/pic3.jpg';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import { toast } from 'sonner';

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

  const [editableFeatures, setEditableFeatures] = useState([
    { icon: Star, title: "איחוד מידע במקום אחד", description: "דפים, קבצים, החלטות, הערות ושיתופים." },
    { icon: Search, title: "חיפוש חכם ומהיר", description: "לפי כותרת, תגיות, ,תיאור ותוכן." },
    { icon: Settings, title: "הרשאות ותפקידים", description: "מסך מותאם לכל משתמש. שמירה על סדר ואיכות." },
    { icon: TrendingUp, title: "תיעוד שינויים", description: "היסטוריית עדכונים והקשר סביב כל פריט ." },
  ]);

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
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Here you can add logic to save changes to backend/database
    console.log('Changes saved:', { 
      editableTitle, 
      editableContent, 
      editableImages, 
      editableFeatures, 
      editableVisionPoints 
    });
    toast.success("השינויים נישמרו בהצלחה")
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...editableImages];
        newImages[index] = reader.result as string;
        setEditableImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureChange = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...editableFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditableFeatures(newFeatures);
  };

  const handleVisionPointChange = (index: number, value: string) => {
    const newVisionPoints = [...editableVisionPoints];
    newVisionPoints[index] = value;
    setEditableVisionPoints(newVisionPoints);
  };

  const addVisionPoint = () => {
    setEditableVisionPoints([...editableVisionPoints, "נקודת חזון חדשה"]);
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

          {/* Features Section */}
          <h2 className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
            מה אפשר לעשות עם StockBox
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
            {editableFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white/90 backdrop-blur-[8px] rounded-[14px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stockblue/8 transition-all duration-[250ms] ease-out hover:transform hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/96 ${
                    isEditing ? 'cursor-move' : ''
                  } ${draggedFeatureIndex === index ? 'opacity-50' : ''}`}
                  draggable={isEditing}
                  onDragStart={() => handleFeatureDragStart(index)}
                  onDragOver={(e) => handleFeatureDragOver(e, index)}
                  onDragEnd={handleFeatureDragEnd}
                >
                  {isEditing && (
                    <div className="flex-shrink-0 text-stockblue/40 cursor-move pt-1">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                    <IconComponent size={22} />
                  </div>
                  <div className="feature-content flex-1">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                          className="text-[1.1rem] font-bold text-gray-800 mb-1.5 leading-[1.3] w-full border border-stockblue/30 rounded px-2 py-1 focus:outline-none focus:border-stockblue"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                          className="text-[0.97rem] text-gray-600 leading-[1.6] w-full border border-stockblue/30 rounded px-2 py-1 focus:outline-none focus:border-stockblue min-h-[60px]"
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
            <h2 className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
              החזון שלנו
            </h2>
            {isEditing && (
              <button
                onClick={addVisionPoint}
                className="mt-4 inline-flex items-center gap-1 text-stockblue hover:text-blue-700 font-semibold text-sm"
              >
                <Plus size={16} />
                הוסף נקודה
              </button>
            )}
          </div>

          <ul className="list-none p-0 my-5 mb-7 grid gap-3">
            {editableVisionPoints.map((point, i) => (
              <li 
                key={i} 
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

            <div className="relative w-full h-full rounded-[3rem] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100/70 shadow-2xl transition-all duration-700 ease-out hover:shadow-[0_30px_80px_rgba(59,130,246,0.3)] hover:scale-105 hover:-translate-y-2 hover:rotate-2 border-4 border-white/60 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-600/10 z-10 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none skew-x-12"></div>

              <img
                src={images[currentImageIndex]}
                alt="StockBox preview"
                className="w-full h-full object-cover transition-all duration-1000 ease-out scale-105 hover:scale-110"
              />

              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent z-10 pointer-events-none"></div>

              {/* Image Upload Controls for Admin with tooltips */}
              {isEditing && role === 'admin' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                  {[0, 1, 2].map((idx) => (
                    <label
                      key={idx}
                      className="group cursor-pointer bg-white/90 hover:bg-white text-stockblue px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all relative"
                      title={`העלה תמונה ${idx + 1}`}
                    >
                      {idx + 1}
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        תמונה {idx + 1}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/40 to-purple-400/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;