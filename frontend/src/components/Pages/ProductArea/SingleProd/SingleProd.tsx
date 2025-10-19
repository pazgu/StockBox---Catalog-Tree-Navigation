import React, { FC, useState, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../ui/accordion";
import cam from "../../../../assets/red-lens-camera.png";
import { Heart, PencilLine, Upload, Plus, GripVertical } from "lucide-react";

// Define the structure for an accordion item
interface AccordionData {
  id: string; // Unique ID for key and manipulation
  title: string;
  content: string;
  isEditable: boolean; // Flag to indicate if content is editable (like the default ones)
}

interface SingleProdProps {}

// Helper function to generate a unique ID (simple timestamp for this example)
const generateUniqueId = () => `accordion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const SingleProd: FC<SingleProdProps> = () => {
  const [role] = useState<string | null>(() => localStorage.getItem("role"));
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("מצלמת DSLR קלאסית עם עדשה אדומה");
  const [description, setDescription] = useState(
    "פתרון מקצועי לצילום איכותי עם עיצוב רטרו ועמידות גבוהה."
  );

  // Consolidated state for product data that was previously separate states
  const [accordionData, setAccordionData] = useState<AccordionData[]>([
    {
      id: "description",
      title: "תיאור המוצר",
      content:
        "מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל הגדרות הצילום.",
      isEditable: true,
    },
    {
      id: "specifications",
      title: "מפרט טכני",
      content:
        "רזולוציה 24MP, חיישן APS-C, עדשה 18-55mm, מסך LCD 3 אינץ', חיבור Wi-Fi",
      isEditable: true,
    },
    {
      id: "features",
      title: "מאפיינים עיקריים",
      content: JSON.stringify([
        "איכות תמונה חדה במיוחד",
        "עיצוב רטרו יוקרתי עם טבעות אדומות",
        "צילום ווידאו 4K מקצועי",
        "עדשה מהירה לצילום בתאורה חלשה",
        "נוחות אחיזה ובקרה",
      ]), // Storing features as JSON string to keep original logic contained
      isEditable: true,
    },
  ]);

  const [productImage, setProductImage] = useState(cam);
  const [originalImage] = useState(cam);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // State to manage the item being dragged (for reordering)
  const [draggedItem, setDraggedItem] = useState<AccordionData | null>(null);

  // --- Accordion Manipulation Handlers ---

  // Handle accordion content change
  const handleAccordionContentChange = (id: string, newContent: string) => {
    setAccordionData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, content: newContent } : item
      )
    );
  };

  // Handle accordion title change
  const handleAccordionTitleChange = (id: string, newTitle: string) => {
    setAccordionData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  // Add a new custom accordion
  const addCustomAccordion = () => {
    setAccordionData(prevData => [
      ...prevData,
      {
        id: generateUniqueId(),
        title: "כותרת אקורדיון חדש",
        content: "תוכן האקורדיון החדש...",
        isEditable: false, // Custom accordions are initially not treated as the special hardcoded ones
      },
    ]);
  };

  // Remove a custom accordion
  const removeAccordion = (id: string) => {
    setAccordionData(prevData => prevData.filter(item => item.id !== id));
  };

  // Handle drag start
  const handleDragStart = (item: AccordionData) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // Handle drop
  const handleDrop = (targetItem: AccordionData) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    setAccordionData(prevData => {
      const newItems = [...prevData];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItem.id);
      const targetIndex = newItems.findIndex(item => item.id === targetItem.id);

      if (draggedIndex === -1 || targetIndex === -1) return prevData;

      // Reorder logic
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      return newItems;
    });

    setDraggedItem(null); // Reset dragged item
  };

  // --- Features Logic (integrated with the 'features' accordion) ---

  // Memoize the features array for easier manipulation
  const features = useMemo(() => {
    try {
      const data = accordionData.find(item => item.id === 'features')?.content;
      return data ? JSON.parse(data) : [];
    } catch {
      return []; // Handle potential JSON parsing error
    }
  }, [accordionData]);

  const setFeatures = useCallback((newFeatures: string[]) => {
    handleAccordionContentChange('features', JSON.stringify(newFeatures));
  }, []);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, "תכונה חדשה"]);
  const removeFeature = (index: number) =>
setFeatures(features.filter((_: string, i: number) => i !== index));
  // --- Image Handlers (kept from original) ---

  const resetImage = () => {
    setProductImage(originalImage);
    setHasImageChanged(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result && typeof result === "string") {
            setProductImage(result);
            setHasImageChanged(true);
          }
        };
        reader.onerror = () => {
          console.error("Error reading file");
          alert("שגיאה בקריאת הקובץ");
        };
        reader.readAsDataURL(file);
      } else {
        alert("אנא בחר קובץ תמונה תקין");
      }
    }
    event.target.value = "";
  };

  // --- Render Logic ---

  return (
    <div className="pt-32 px-6 pb-10 font-sans-['Noto_Sans_Hebrew'] rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-right">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-4xl font-bold text-stockblue border-b-2 border-stockblue w-full text-right outline-none"
              />
            ) : (
              <h1 className="text-4xl font-bold text-stockblue bg-clip-text text-transparent bg-gradient-to-r from-stockblue to-stockblue">
                {title}
              </h1>
            )}
          </div>

                  {role === "admin" && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-stockblue shadow-lg ring-2 ring-stockblue/30 hover:ring-stockblue/40 hover:bg-stockblue/90 transition-all duration-300"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? "סיום עריכה" : "עריכת דף"}
          >
            <PencilLine size={18} />
            {isEditing ? "סיום עריכה" : "עריכת דף"}
          </button>
        )}
        </div>

        {/* Secondary Description */}
        <div className="text-right mb-12">
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-transparent border-b border-gray-400 w-full max-w-2xl text-gray-700 text-lg outline-none resize-none text-right"
            />
          ) : (
            <p className="text-gray-700 text-lg max-w-2xl">{description}</p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left: Image & CTA */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stockblue to-stockblue"></div>

              {/* Image */}
              <div className="relative bg-gray-50 p-6 rounded-xl mb-4 overflow-hidden">
                <img
                  src={productImage}
                  alt={title}
                  className="w-full h-40 object-contain relative z-10 transition-all duration-300 group-hover:scale-105 drop-shadow-md"
                />

                {isEditing && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-3 z-20 transition-all duration-300">
                    <div className="flex gap-2">
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stockblue bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-white transition-all duration-300"
                      >
                        <Upload size={14} />
                        החלף
                      </label>

                      {hasImageChanged && (
                        <button
                          onClick={resetImage}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-700/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-600/30 hover:shadow-lg hover:scale-105 hover:bg-gray-800 transition-all duration-300"
                        >
                          <span className="text-xs">↶</span> ביטול
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="absolute top-2 right-2 bg-stockblue/90 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                    עריכה
                  </div>
                )}
              </div>

              {/* Buttons */}
              {role === "user" ? (
                <div className="space-y-2 relative z-10">
                  <button className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-stockblue shadow-md transition-all duration-300 transform hover:scale-105 hover:bg-stockblue/90">
                    פנייה לחבר צוות
                  </button>

                  <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-105">
                    <Heart size={16} />
                    הוסף למועדפים
                  </button>
                </div>
              ) : role === "admin" ? (
                <div className="relative z-10">
                  <a
                    href="/permissions"
                    className="block w-full text-center py-3 px-4 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    נהל הרשאות
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Accordion List */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {accordionData.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className={`border-b border-gray-200/70 ${isEditing && 'p-2 border border-dashed border-gray-300 rounded-lg'}`}
                  draggable={isEditing}
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item)}
                  onDragEnd={() => setDraggedItem(null)} // Reset dragged item on drag end
                  style={{ opacity: draggedItem && draggedItem.id === item.id ? 0.4 : 1 }}
                >
                  <AccordionTrigger className="w-full text-right text-lg font-semibold text-stockblue py-4 px-2 rounded-lg hover:bg-stockblue/5 transition-colors [&>svg]:text-stockblue">
                                  {isEditing && (
                <div className="flex items-center gap-2 ml-3 text-gray-500 cursor-grab">
                  <GripVertical size={18} className="cursor-grab" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeAccordion(item.id);
                    }}
                    className="text-black hover:text-gray-700 transition-colors font-bold"
                    title="הסר אקורדיון"
                  >
                    ✕
                  </button>
                </div>
              )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleAccordionTitleChange(item.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when editing title
                        className="bg-transparent text-lg font-semibold text-stockblue border-b border-gray-400 w-full text-right outline-none"
                      />
                    ) : (
                      item.title
                    )}
                  </AccordionTrigger>

                  <AccordionContent className="text-right text-base text-gray-700 leading-relaxed pb-6">
                    {item.id === "features" ? (
                      // Special rendering for 'features'
                      isEditing ? (
                        <div className="space-y-3">
                          {features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <button
                                onClick={() => removeFeature(idx)}
                                // Note: The feature remove button is still red for clarity of removal, 
                                // but the main accordion remove 'X' is navy.
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors duration-200 text-sm"
                                title="הסר תכונה"
                              >
                                ✕
                              </button>
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
                                placeholder="תכונה..."
                              />
                            </div>
                          ))}
                          <button
                            onClick={addFeature}
                            className="flex items-center gap-1 px-4 py-2 font-medium rounded-lg border border-stockblue/30 text-stockblue bg-stockblue/10 hover:bg-stockblue/20 hover:border-stockblue/50 transition-all duration-300"
                          >
                            <Plus size={16} /> הוסף תכונה
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-right">
                          {features.map((feature: string, idx: number) => (
                            <div key={idx} className="text-sm text-stockblue">
                              • {feature}
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      // General content rendering
                      isEditing ? (
                        <textarea
                          value={item.content}
                          onChange={(e) => handleAccordionContentChange(item.id, e.target.value)}
                          rows={item.id === 'description' || item.id === 'specifications' ? 4 : 3}
                          className="w-full p-4 text-gray-700 text-sm bg-white/50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
                        />
                      ) : (
                        item.content
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Add New Accordion Button */}
            {isEditing && (
              <div
                onClick={addCustomAccordion}
                // 2. Changed justify-end to justify-start to align with the right in RTL mode
                className="flex items-center justify-start gap-2 mt-4 p-4 rounded-lg border border-dashed border-gray-300 text-stockblue hover:border-stockblue/50 hover:bg-stockblue/5 transition-all duration-300 cursor-pointer"
              >
                <Plus size={18} />
                <span className="font-medium">הוסף אקורדיון חדש</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProd;