import React, { FC, useState, useEffect } from "react";
import pic1 from "../../../../assets/pic1.jpg";
import pic2 from "../../../../assets/pic2.jpg";
import pic3 from "../../../../assets/pic3.jpg";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import isEqual from "lodash/isEqual";
import {
  CheckCircle2,
  Compass,
  Edit2,
  Check,
  GripVertical,
  Trash2,
} from "lucide-react";
import { ICONS_HE } from "../../../../mockdata/icons";
import FeaturesSection from "./FeaturesSection/FeaturesSection";
import VisionSection from "./VisionSection/VisionSection";
import AboutImagesPanel from "./AboutImagesPanel/AboutImagesPanel";
import AddSectionButton from "./AddSectionButton/AddSectionButton/AddSectionButton";
const EN_TO_HE: { [key: string]: string } = {
  star: "כוכב",
  search: "חיפוש",
  settings: "הגדרות",
  trend: "מגמה",
};

const IconMap: { [key: string]: FC<any> } = Object.fromEntries(
  ICONS_HE.map((i) => [i.value, i.component])
);

const iconOptions = ICONS_HE.map((i) => ({ value: i.value, label: i.label }));

type SectionType = {
  id: string;
  type: "features" | "vision" | "intro";
  title: string;
  content?: string;
  features?: Array<{ icon: string; title: string; description: string }>;
  visionPoints?: string[];
};

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editableImages, setEditableImages] = useState([pic1, pic2, pic3]);
  const images = editableImages;
  const navigate = useNavigate();
  const { role } = useUser();

  // refs for file inputs
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const addInputRef = React.useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<SectionType[]>([
    {
      id: "intro-1",
      type: "intro",
      title: "אודות StockBox",
      content:
        "היא מערכת וובי מרכזית שמאחדת את כל הידע של הצוות למקום אחד. המטרה שלנו היא להפוך מידע מפוזר למסודר, נגיש ובר-פעולה. כך שתוכלו למצוא במהירות נהלים, תיעוד, החלטות, קבצים ותוצרים חשובים, לשתף בקלות ולשמור על הנתונים הרצויים.",
    },
    {
      id: "features-1",
      type: "features",
      title: "מה אפשר לעשות עם StockBox",
      features: [
        {
          icon: "כוכב",
          title: "איחוד מידע במקום אחד",
          description: "דפים, קבצים, החלטות, הערות ושיתופים.",
        },
        {
          icon: "חיפוש",
          title: "חיפוש חכם ומהיר",
          description: "לפי כותרת, תגיות, תיאור ותוכן.",
        },
        {
          icon: "הגדרות",
          title: "הרשאות ותפקידים",
          description: "מסך מותאם לכל משתמש. שמירה על סדר ואיכות.",
        },
        {
          icon: "מגמה",
          title: "תיעוד שינויים",
          description: "היסטוריית עדכונים והקשר סביב כל פריט.",
        },
      ],
    },
    {
      id: "vision-1",
      type: "vision",
      title: "החזון שלנו",
      visionPoints: [
        "מידע ברור, עדכני ונגיש",
        "צמצום זמן חיפוש",
        "חיזוק שקיפות ושיתופיות בצוות",
        "מערכת נעימה, יציבה ומתאימה לזרימות עבודה יומיומיות.",
        "גדלה יחד עם הצוות והצרכים שלו",
      ],
    },
  ]);

  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState({
    sections,
    images: editableImages,
  });
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const dragCounterRef = React.useRef(0);

  // Image wrapping
  const imageWrapRef = React.useRef<HTMLDivElement | null>(null);
  const goPrev = () =>
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const touchStartXRef = React.useRef<number | null>(null);

  // Keyboard navigation between images
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = imageWrapRef.current;
      if (!el) return;
      const within =
        el.contains(document.activeElement) ||
        document.activeElement === document.body;
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

  // Editable features (legacy compatibility for child components)
  const [editableFeatures, setEditableFeatures] = useState([
    {
      icon: "כוכב",
      title: "איחוד מידע במקום אחד",
      description: "דפים, קבצים, החלטות, הערות ושיתופים.",
    },
    {
      icon: "חיפוש",
      title: "חיפוש חכם ומהיר",
      description: "לפי כותרת, תגיות, תיאור ותוכן.",
    },
    {
      icon: "הגדרות",
      title: "הרשאות ותפקידים",
      description: "מסך מותאם לכל משתמש. שמירה על סדר ואיכות.",
    },
    {
      icon: "מגמה",
      title: "תיעוד שינויים",
      description: "היסטוריית עדכונים והקשר סביב כל פריט.",
    },
  ]);

  useEffect(() => {
    setEditableFeatures((prev) =>
      prev.map((f) => (EN_TO_HE[f.icon] ? { ...f, icon: EN_TO_HE[f.icon] } : f))
    );
  }, []);

  const [editableVisionPoints, setEditableVisionPoints] = useState([
    "מידע ברור, עדכני ונגיש",
    "צמצום זמן חיפוש",
    "חיזוק שקיפות ושיתופיות בצוות",
    "מערכת נעימה, יציבה ומתאימה לזרימות עבודה יומיומיות.",
    "גדלה יחד עם הצוות והצרכים שלו",
  ]);

  const [draggedVisionIndex, setDraggedVisionIndex] = useState<number | null>(
    null
  );

  // Add section
  const handleAddSection = (
    afterIndex: number,
    type: "features" | "vision"
  ) => {
    const newSection: SectionType =
      type === "features"
        ? {
            id: `features-${Date.now()}`,
            type: "features",
            title: "פיצ׳רים חדשים",
            features: [
              { icon: "כוכב", title: "כותרת חדשה", description: "תיאור חדש" },
            ],
          }
        : {
            id: `vision-${Date.now()}`,
            type: "vision",
            title: "חזון חדש",
            visionPoints: ["נקודה חדשה"],
          };

    setSections((prev) => [
      ...prev.slice(0, afterIndex + 1),
      newSection,
      ...prev.slice(afterIndex + 1),
    ]);
  };

  // Remove section
  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      toast.error("לא ניתן למחוק את כל המקטעים");
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // Update section title
  const updateSectionTitle = (index: number, title: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s))
    );
  };

  // Update intro content
  const updateIntroContent = (index: number, content: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index && s.type === "intro" ? { ...s, content } : s
      )
    );
  };

  // Section drag handlers
  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
    dragCounterRef.current = 0;
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;

    setDragOverIndex(index);

    // Only reorder every 5th call to reduce jankiness
    dragCounterRef.current++;
    if (dragCounterRef.current % 5 !== 0) return;

    setSections((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(draggedSectionIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    setDraggedSectionIndex(index);

    // Auto-scroll when dragging near edges
    const element = sectionRefs.current[index];
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Scroll up if near top
      if (rect.top < 200) {
        window.scrollBy({ top: -30, behavior: "auto" });
      }
      // Scroll down if near bottom
      else if (rect.bottom > viewportHeight - 200) {
        window.scrollBy({ top: 30, behavior: "auto" });
      }
    }
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
    setDragOverIndex(null);
    dragCounterRef.current = 0;
  };

  const handleSectionDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleSectionDragLeave = () => {
    setDragOverIndex(null);
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = imageWrapRef.current;
      if (!el) return;
      const within =
        el.contains(document.activeElement) ||
        document.activeElement === document.body;
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
  }, []);

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

  const handleNavigateToCategories = () => {
    navigate("/categories");
  };

  useEffect(() => {
    if (isEditing) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isEditing]);

  const handleSaveChanges = () => {
    const hasChanges =
      !isEqual(sections, originalData.sections) ||
      !isEqual(editableImages, originalData.images);
    setIsEditing(false);
    if (hasChanges) {
      setOriginalData({ sections, images: editableImages });
      toast.success("השינויים נשמרו בהצלחה");
    }
  };

  useEffect(() => {
    setOriginalData({ sections, images: editableImages });
  }, []);

  // Keep refs array in sync with sections length
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  // Image handlers
  const handleReplaceImage = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditableImages((prev) => {
        const arr = [...prev];
        if (index >= arr.length) {
          arr.push(reader.result as string);
          setCurrentImageIndex(arr.length - 1);
        } else {
          arr[index] = reader.result as string;
        }
        return arr;
      });
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

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
        const startIndex = prev.length;
        const merged = [...prev, ...dataUrls];
        setCurrentImageIndex(startIndex > 0 ? startIndex : 0);
        return merged;
      });
      event.target.value = "";
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

  const clearAllImages = () => {
    setEditableImages([]);
    setCurrentImageIndex(0);
  };

  return (
    <div className="pt-8 min-h-screen font-['Arial'] direction-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
        <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
          {role === "editor" && (
            <button
              onClick={() =>
                isEditing ? handleSaveChanges() : setIsEditing(true)
              }
              className="fixed bottom-6 right-6 inline-flex items-center justify-center w-12 h-12 rounded-full border border-stockblue/30 bg-white text-xl font-semibold text-stockblue shadow-md hover:bg-stockblue hover:text-white transition-all duration-300 z-50"
            >
              {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
            </button>
          )}

          {/* Render all sections dynamically */}
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[sectionIndex] = el;
              }}
              draggable={isEditing}
              onDragStart={() => handleSectionDragStart(sectionIndex)}
              onDragOver={(e) => handleSectionDragOver(e, sectionIndex)}
              onDragEnter={() => handleSectionDragEnter(sectionIndex)}
              onDragLeave={handleSectionDragLeave}
              onDragEnd={handleSectionDragEnd}
              className={`relative my-6 transition-all duration-200 ${
                isEditing
                  ? "border-2 border-dashed border-stockblue/30 rounded-xl p-4 cursor-move hover:border-stockblue/50"
                  : ""
              } ${
                draggedSectionIndex === sectionIndex
                  ? "opacity-40 scale-95 rotate-1"
                  : ""
              } ${
                dragOverIndex === sectionIndex &&
                draggedSectionIndex !== sectionIndex
                  ? "border-stockblue border-solid bg-stockblue/5 scale-[1.02]"
                  : ""
              }`}
            >
              {/* Section Controls */}
              {isEditing && (
                <div className="absolute -right-3 -top-3 flex gap-2 z-20">
                  <div className="p-2 bg-stockblue text-white rounded-lg cursor-grab active:cursor-grabbing shadow-md hover:bg-stockblue/90 transition">
                    <GripVertical size={20} />
                  </div>
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                      title="מחק מקטע"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* INTRO SECTION */}
              {section.type === "intro" && (
                <>
                  {isEditing ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(sectionIndex, e.target.value)
                      }
                      className="text-[2.5rem] text-stockblue mb-5 font-bold text-center w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
                    />
                  ) : (
                    <h1 className="text-[2.5rem] text-stockblue mb-5 font-bold text-center">
                      {section.title}
                    </h1>
                  )}

                  <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px] transition-all duration-300 ease-out hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(13,48,91,0.06),0_2px_8px_rgba(13,48,91,0.03)] hover:border-stockblue/10 before:content-[''] before:absolute before:top-0 before:right-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-stockblue before:to-stockblue/30 before:rounded-r-[2px] before:opacity-70">
                    {isEditing ? (
                      <textarea
                        value={section.content || ""}
                        onChange={(e) =>
                          updateIntroContent(sectionIndex, e.target.value)
                        }
                        className="w-full leading-[1.7] text-stockblue/85 font-normal text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[150px]"
                      />
                    ) : (
                      <p className="leading-[1.7] text-stockblue/85 font-normal m-0 text-[1.1rem] text-justify">
                        <strong>StockBox</strong> {section.content}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* FEATURES SECTION */}
              {section.type === "features" && (
                <FeaturesSection
                  isEditing={isEditing}
                  title={section.title}
                  onChangeTitle={(title) =>
                    updateSectionTitle(sectionIndex, title)
                  }
                  features={section.features || []}
                  onAdd={() => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: [
                                ...(s.features || []),
                                {
                                  icon: "כוכב",
                                  title: "כותרת חדשה",
                                  description: "תיאור חדש",
                                },
                              ],
                            }
                          : s
                      )
                    );
                  }}
                  onRemove={(itemIndex) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: (s.features || []).filter(
                                (_, ii) => ii !== itemIndex
                              ),
                            }
                          : s
                      )
                    );
                  }}
                  onChange={(itemIndex, field, value) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: (s.features || []).map((f, ii) =>
                                ii === itemIndex ? { ...f, [field]: value } : f
                              ),
                            }
                          : s
                      )
                    );
                  }}
                  onReorder={(newFeatures) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? { ...s, features: newFeatures }
                          : s
                      )
                    );
                  }}
                  iconOptions={iconOptions}
                  IconMap={IconMap}
                />
              )}

              {/* VISION SECTION */}
              {section.type === "vision" && (
                <VisionSection
                  isEditing={isEditing}
                  title={section.title}
                  onChangeTitle={(title) =>
                    updateSectionTitle(sectionIndex, title)
                  }
                  points={section.visionPoints || []}
                  onAdd={() => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "vision"
                          ? {
                              ...s,
                              visionPoints: [
                                ...(s.visionPoints || []),
                                "נקודה חדשה",
                              ],
                            }
                          : s
                      )
                    );
                  }}
                  onRemove={(itemIndex) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "vision"
                          ? {
                              ...s,
                              visionPoints: (s.visionPoints || []).filter(
                                (_, ii) => ii !== itemIndex
                              ),
                            }
                          : s
                      )
                    );
                  }}
                  onChange={(itemIndex, value) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "vision"
                          ? {
                              ...s,
                              visionPoints: (s.visionPoints || []).map(
                                (p, ii) => (ii === itemIndex ? value : p)
                              ),
                            }
                          : s
                      )
                    );
                  }}
                  onReorder={(from, to) => {
                    setSections((prev) =>
                      prev.map((s, i) => {
                        if (i === sectionIndex && s.type === "vision") {
                          const arr = [...(s.visionPoints || [])];
                          const [moved] = arr.splice(from, 1);
                          arr.splice(to, 0, moved);
                          return { ...s, visionPoints: arr };
                        }
                        return s;
                      })
                    );
                  }}
                />
              )}

              {/* Add Section Button - Always visible in edit mode */}
              {isEditing && (
                <div className="mt-6 flex justify-center">
                  <AddSectionButton
                    index={sectionIndex}
                    handleAddSection={handleAddSection}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center my-10">
            <button
              onClick={handleNavigateToCategories}
              className="group inline-flex items-center gap-3 rounded-2xl border border-stockblue/20 bg-gradient-to-r from-white/90 via-white/80 to-blue-50/60 px-10 py-4 text-[1.15rem] font-bold text-stockblue backdrop-blur-sm shadow-[0_8px_28px_rgba(13,48,91,0.18)] hover:shadow-[0_12px_38px_rgba(13,48,91,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stockblue text-white shadow-[0_4px_14px_rgba(13,48,91,0.35)] group-hover:rotate-12 transition-transform duration-300">
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
        </div>

        {/* Image Panel */}
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
