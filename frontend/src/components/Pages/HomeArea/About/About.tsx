/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { Compass, Edit2, Check, GripVertical, Trash2, X } from "lucide-react";
import { ICONS_HE } from "../../../../mockdata/icons";
import FeaturesSection from "./FeaturesSection/FeaturesSection";
import AboutImagesPanel from "./AboutImagesPanel/AboutImagesPanel";
import AddSectionButton from "./AddSectionButton/AddSectionButton/AddSectionButton";
import { aboutApi } from "../../../../services/aboutApi";
import BulletsSection from "./BulletsSection/BulletsSection";
import { AboutBlock } from "@/components/models/about.models";

const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
type FeatureItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};
type BulletItem = { id: string; text: string };

type ImageItem = {
  url: string;
  isPreview?: boolean;
};

type SectionType = {
  id: string;
  type: "features" | "bullets" | "intro" | "paragraph";
  title: string;
  content?: string;

  features?: FeatureItem[];
  bullets?: BulletItem[];
};

const blocksToSections = (blocks: AboutBlock[]): SectionType[] => {
  return blocks.map((b) => {
    if (b.type === "intro") {
      return {
        id: b.id,
        type: "intro",
        title: b.data?.title ?? "",
        content: b.data?.content ?? "",
      };
    }

    if (b.type === "features") {
      return {
        id: b.id,
        type: "features",
        title: b.data?.title ?? "",
        features: (b.data?.features ?? []).map((f: any) => ({
          id: f.id ?? uid(),
          icon: f.icon ?? "star",
          title: f.title ?? "",
          description: f.description ?? "",
        })),
      };
    }

    if (b.type === "paragraph") {
      return {
        id: b.id,
        type: "paragraph",
        title: b.data?.title ?? "",
        content: b.data?.content ?? "",
      };
    }

    return {
      id: b.id,
      type: "bullets",
      title: b.data?.title ?? "",
      bullets: (b.data?.bullets ?? []).map((x: any) => ({
        id: x.id ?? uid(),
        text: x.text ?? "",
      })),
    };
  });
};

const sectionsToBlocks = (sections: SectionType[]): AboutBlock[] => {
  return sections.map((s) => {
    if (s.type === "intro") {
      return {
        id: s.id,
        type: "intro",
        data: { title: s.title, content: s.content ?? "" },
      };
    }

    if (s.type === "features") {
      return {
        id: s.id,
        type: "features",
        data: { title: s.title, features: s.features ?? [] },
      };
    }

    if (s.type === "paragraph") {
      return {
        id: s.id,
        type: "paragraph",
        data: { title: s.title, content: s.content ?? "" },
      };
    }

    return {
      id: s.id,
      type: "bullets",
      data: { title: s.title, bullets: s.bullets ?? [] },
    };
  });
};

const IconMap: { [key: string]: FC<any> } = Object.fromEntries(
  ICONS_HE.map((i) => [i.value, i.component]),
);

const iconOptions = ICONS_HE.map((i) => ({ value: i.value, label: i.label }));

type FieldKind =
  | "sectionTitle"
  | "introContent"
  | "paragraphContent"
  | "featuresTitle"
  | "bulletsTitle"
  | "featureTitle"
  | "featureDescription"
  | "featureIcon"
  | "featureCard"
  | "bulletText";

const mkKey = (kind: FieldKind, sectionId: string, itemId?: string) =>
  [kind, sectionId, itemId].filter(Boolean).join("::");

const isBlank = (v?: string | null) => !v || v.trim().length === 0;

const isSectionFilledEnough = (s: SectionType) => {
  if (isBlank(s.title)) return false;

  if (s.type === "intro" || s.type === "paragraph") {
    return !isBlank(s.content);
  }

  if (s.type === "features") {
    const features = s.features ?? [];
    if (features.length === 0) return false;
    return features.every((f) => !isBlank(f.title) && !isBlank(f.description));
  }

  if (s.type === "bullets") {
    const bullets = s.bullets ?? [];
    if (bullets.length === 0) return false;
    return bullets.every((b) => !isBlank(b.text));
  }

  return true;
};

interface AboutProps {}

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [editableImages, setEditableImages] = useState<ImageItem[]>([]);

  const images = editableImages.map((i) => i.url);
  const navigate = useNavigate();
  const { role } = useUser();

  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const addInputRef = React.useRef<HTMLInputElement>(null);

  const [sections, setSections] = useState<SectionType[]>([]);

  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const [confirmedSnapshot, setConfirmedSnapshot] = useState<
    Record<string, string>
  >({});

  const isDirty = (key: string) => dirtyKeys.has(key);
  const hasUnconfirmedChanges = dirtyKeys.size > 0;

  const getSnapshotValue = (key: string) => confirmedSnapshot[key] ?? "";

  const markDirty = (key: string, currentValue: string) => {
    const snap = getSnapshotValue(key);

    setDirtyKeys((prev) => {
      const next = new Set(prev);

      if (currentValue !== snap) next.add(key);
      else next.delete(key);

      return next;
    });
  };

  const confirmField = (key: string, currentValue: string) => {
    setConfirmedSnapshot((prev) => ({ ...prev, [key]: currentValue }));
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const TOAST = {
    unconfirmedChangesBlocked:
      "לא ניתן להוסיף מקטע חדש לפני אישור כל השינויים (לחיצה על ✓ ליד השדות ששונו).",
    loadError: "שגיאה בטעינת עמוד אודות. נסה שוב מאוחר יותר.",
    saveSuccess: "השינויים נשמרו בהצלחה.",
    saveError: "שגיאה בשמירת השינויים. נסה שוב.",
    cannotDeleteLastSection:
      "לא ניתן למחוק את כל המקטעים. חייב להישאר לפחות מקטע אחד.",
  } as const;

  const lastToastRef = React.useRef<string | null>(null);

  const toastErrorOnce = (msg: string) => {
    if (lastToastRef.current === msg) return;
    lastToastRef.current = msg;
    toast.error(msg);

    window.setTimeout(() => {
      if (lastToastRef.current === msg) lastToastRef.current = null;
    }, 1200);
  };

  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(
    null,
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<{
    sections: SectionType[];
    images: ImageItem[];
  }>({
    sections: [],
    images: [],
  });

  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const dragCounterRef = React.useRef(0);

  const imageWrapRef = React.useRef<HTMLDivElement | null>(null);
  const goPrev = React.useCallback(() => {
    setCurrentImageIndex((i) => {
      if (images.length === 0) return 0;
      return (i - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const goNext = React.useCallback(() => {
    setCurrentImageIndex((i) => {
      if (images.length === 0) return 0;
      return (i + 1) % images.length;
    });
  }, [images.length]);

  const touchStartXRef = React.useRef<number | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await aboutApi.get();

        const loadedSections = blocksToSections(res.blocks ?? []);
        setSections(loadedSections);

        const loadedImages: ImageItem[] = (res.images ?? []).map((url) => ({
          url,
        }));

        setEditableImages(loadedImages);

        setOriginalData({
          sections: loadedSections,
          images: loadedImages,
        });

        const snap: Record<string, string> = {};

        loadedSections.forEach((s) => {
          snap[mkKey("sectionTitle", s.id)] = s.title ?? "";

          if (s.type === "intro")
            snap[mkKey("introContent", s.id)] = s.content ?? "";
          if (s.type === "paragraph")
            snap[mkKey("paragraphContent", s.id)] = s.content ?? "";

          if (s.type === "features") {
            snap[mkKey("featuresTitle", s.id)] = s.title ?? "";
            (s.features ?? []).forEach((f) => {
              snap[mkKey("featureCard", s.id, f.id)] = JSON.stringify({
                title: f.title ?? "",
                description: f.description ?? "",
                icon: f.icon ?? "",
              });
            });
          }

          if (s.type === "bullets") {
            snap[mkKey("bulletsTitle", s.id)] = s.title ?? "";
            (s.bullets ?? []).forEach((b) => {
              snap[mkKey("bulletText", s.id, b.id)] = b.text ?? "";
            });
          }
        });

        setConfirmedSnapshot(snap);
        setDirtyKeys(new Set());
      } catch (e) {
        toast.error(TOAST.loadError);
      }
    })();
  }, []);

  const handleAddSection = (
    afterIndex: number,
    type: "features" | "bullets" | "paragraph",
  ) => {
    if (hasUnconfirmedChanges) {
      toastErrorOnce(TOAST.unconfirmedChangesBlocked);
      return;
    }

    const newSection: SectionType =
      type === "features"
        ? {
            id: `features-${Date.now()}`,
            type: "features",
            title: "",
            features: [
              {
                id: uid(),
                icon: "star",
                title: "",
                description: "",
              },
            ],
          }
        : type === "bullets"
          ? {
              id: `bullets-${Date.now()}`,
              type: "bullets",
              title: "",
              bullets: [{ id: uid(), text: "" }],
            }
          : {
              id: `paragraph-${Date.now()}`,
              type: "paragraph",
              title: "",
              content: "",
            };

    setSections((prev) => [
      ...prev.slice(0, afterIndex + 1),
      newSection,
      ...prev.slice(afterIndex + 1),
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) {
      toast.error("לא ניתן למחוק את כל המקטעים");
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, title: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s)),
    );
  };

  const updateTextContent = (index: number, content: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === index && (s.type === "intro" || s.type === "paragraph")
          ? { ...s, content }
          : s,
      ),
    );
  };

  const handleSectionDragStart = (index: number) => {
    if (hasUnconfirmedChanges) {
      toastErrorOnce(TOAST.unconfirmedChangesBlocked);
      return;
    }
    setDraggedSectionIndex(index);
    dragCounterRef.current = 0;
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;

    setDragOverIndex(index);

    dragCounterRef.current++;
    if (dragCounterRef.current % 5 !== 0) return;

    setSections((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(draggedSectionIndex, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    setDraggedSectionIndex(index);

    const element = sectionRefs.current[index];
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top < 200) {
        window.scrollBy({ top: -30, behavior: "auto" });
      } else if (rect.bottom > viewportHeight - 200) {
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
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (isEditing) return;
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length, isEditing]);
  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
      return;
    }

    if (
      Number.isNaN(currentImageIndex) ||
      currentImageIndex < 0 ||
      currentImageIndex >= images.length
    ) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  const handleSaveChanges = async () => {
    const invalidIndex = sections.findIndex((s) => !isSectionFilledEnough(s));

    if (invalidIndex !== -1) {
      toast.error("אי אפשר לשמור כשיש מקטע ריק. מלא כותרת ותוכן ואז שמור.");
      sectionRefs.current[invalidIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    try {
      const payload = {
        blocks: sectionsToBlocks(sections),
        images: editableImages.map((i) => i.url),
      };

      await aboutApi.replace(payload);

      const snap: Record<string, string> = {};

      sections.forEach((s) => {
        snap[mkKey("sectionTitle", s.id)] = s.title ?? "";

        if (s.type === "intro")
          snap[mkKey("introContent", s.id)] = s.content ?? "";
        if (s.type === "paragraph")
          snap[mkKey("paragraphContent", s.id)] = s.content ?? "";

        if (s.type === "features") {
          snap[mkKey("featuresTitle", s.id)] = s.title ?? "";
          (s.features ?? []).forEach((f) => {
            snap[mkKey("featureCard", s.id, f.id)] = JSON.stringify({
              title: f.title ?? "",
              description: f.description ?? "",
              icon: f.icon ?? "",
            });
          });
        }

        if (s.type === "bullets") {
          snap[mkKey("bulletsTitle", s.id)] = s.title ?? "";
          (s.bullets ?? []).forEach((b) => {
            snap[mkKey("bulletText", s.id, b.id)] = b.text ?? "";
          });
        }
      });

      setConfirmedSnapshot(snap);
      setDirtyKeys(new Set());

      setOriginalData({
        sections,
        images: editableImages
          .filter((i) => !i.isPreview)
          .map((i) => ({ url: i.url })),
      });

      setIsEditing(false);
      toast.success(TOAST.saveSuccess);
    } catch (e) {
      toast.error(TOAST.saveError);
    }
  };

  const cancelEdit = async () => {
    try {
      await aboutApi.replace({
        blocks: sectionsToBlocks(originalData.sections),
        images: originalData.images.map((i) => i.url),
      });

      setSections(originalData.sections);
      setEditableImages(originalData.images);

      const snap = buildSnapshotFromSections(originalData.sections);
      setConfirmedSnapshot(snap);
      setDirtyKeys(new Set());

      setCurrentImageIndex(0);
      setIsEditing(false);

      toast.success("העריכה בוטלה בהצלחה");
    } catch (e) {
      toast.error("שגיאה בביטול העריכה. נסה שוב.");
    }
  };

  const buildSnapshotFromSections = (secs: SectionType[]) => {
    const snap: Record<string, string> = {};

    secs.forEach((s) => {
      snap[mkKey("sectionTitle", s.id)] = s.title ?? "";

      if (s.type === "intro")
        snap[mkKey("introContent", s.id)] = s.content ?? "";
      if (s.type === "paragraph")
        snap[mkKey("paragraphContent", s.id)] = s.content ?? "";

      if (s.type === "features") {
        snap[mkKey("featuresTitle", s.id)] = s.title ?? "";
        (s.features ?? []).forEach((f) => {
          snap[mkKey("featureCard", s.id, f.id)] = JSON.stringify({
            title: f.title ?? "",
            description: f.description ?? "",
            icon: f.icon ?? "",
          });
        });
      }

      if (s.type === "bullets") {
        snap[mkKey("bulletsTitle", s.id)] = s.title ?? "";
        (s.bullets ?? []).forEach((b) => {
          snap[mkKey("bulletText", s.id, b.id)] = b.text ?? "";
        });
      }
    });

    return snap;
  };

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  const handleReplaceImage = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!isEditing) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setIsImagesLoading(true);
    try {
      const res = await aboutApi.replaceImageAt(index, file);
      const nextImgs = (res.images ?? []).map((url) => ({ url }));

      setEditableImages(nextImgs);
      setCurrentImageIndex((cur) => {
        const len = nextImgs.length;
        if (len === 0) return 0;
        return Math.min(index, len - 1);
      });
    } catch (e) {
      toast.error("Failed to replace image");
    } finally {
      setIsImagesLoading(false);
      event.target.value = "";
    }
  };

  const handleAddImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!isEditing) {
      event.target.value = "";
      return;
    }

    const input = event.target;
    const files = Array.from(input.files ?? []) as File[];
    if (!files.length) return;

    const previews: ImageItem[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      isPreview: true,
    }));

    setEditableImages((prev) => {
      const next = [...prev, ...previews];
      setCurrentImageIndex(next.length - 1);
      return next;
    });

    setIsImagesLoading(true);
    try {
      const res = await aboutApi.uploadImages(files);

      previews.forEach((p) => URL.revokeObjectURL(p.url));

      const nextImgs = (res.images ?? []).map((url) => ({ url }));
      setEditableImages(nextImgs);
      setCurrentImageIndex((nextImgs.length ?? 1) - 1);
    } catch (e) {
      toast.error("Failed to upload images");
      setEditableImages((prev) => prev.filter((i) => !i.isPreview));
    } finally {
      setIsImagesLoading(false);
      input.value = "";
    }
  };

  const removeImage = async (index: number) => {
    if (!isEditing) return;

    setIsImagesLoading(true);
    try {
      const res = await aboutApi.deleteImageAt(index);
      const nextImgs = (res.images ?? []).map((url) => ({ url }));
      setEditableImages(nextImgs);

      setCurrentImageIndex((cur) => {
        const len = nextImgs.length;
        if (len === 0) return 0;
        return Math.min(cur, len - 1);
      });
    } catch (e) {
      toast.error("Failed to delete image");
    } finally {
      setIsImagesLoading(false);
    }
  };

  const clearAllImages = async () => {
    if (!isEditing) return;

    setIsImagesLoading(true);
    try {
      const res = await aboutApi.clearImages();
      setEditableImages((res.images ?? []).map((url) => ({ url })));
      setCurrentImageIndex(0);
    } catch (e) {
      toast.error("Failed to clear images");
    } finally {
      setIsImagesLoading(false);
    }
  };

  return (
    <div className="pt-8 min-h-screen font-['Arial'] direction-rtl" dir="rtl">
      <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
        <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
          {role === "editor" && (
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-red-500/30 bg-white text-red-600 shadow-md hover:bg-red-50 transition-all duration-300"
                  title="ביטול עריכה"
                  aria-label="ביטול עריכה"
                >
                  <X size={18} />
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveChanges();
                    return;
                  }
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-stockblue/30 bg-white text-xl font-semibold text-stockblue shadow-md hover:bg-stockblue hover:text-white transition-all duration-300"
                aria-label={isEditing ? "שמירת שינויים" : "עריכה"}
                title={isEditing ? "שמירת שינויים" : "עריכה"}
              >
                {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
              </button>
            </div>
          )}

          {/* Render all sections dynamically */}
          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              ref={(el) => {
                sectionRefs.current[sectionIndex] = el;
              }}
              draggable={isEditing && !hasUnconfirmedChanges}
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
                      onClick={() => {
                        removeSection(sectionIndex);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg transition shadow-md"
                      title="מחיקת מקטע"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* INTRO SECTION */}
              {section.type === "intro" && (
                <>
                  {/* Intro Title */}
                  {(() => {
                    const key = mkKey("sectionTitle", section.id);

                    return isEditing ? (
                      <div className="flex items-center gap-2 mb-5">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSectionTitle(sectionIndex, val);
                            markDirty(key, val);
                          }}
                          className="text-[2.5rem] text-stockblue font-bold text-center w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
                        />

                        {isDirty(key) && (
                          <button
                            type="button"
                            onClick={() => confirmField(key, section.title)}
                            className="h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                            title="אשר שינוי"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <h1 className="text-[2.5rem] text-stockblue mb-5 font-bold text-center">
                        {section.title}
                      </h1>
                    );
                  })()}

                  {/* Intro Content */}
                  <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px] transition-all duration-300 ease-out hover:transform hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(13,48,91,0.06),0_2px_8px_rgba(13,48,91,0.03)] hover:border-stockblue/10 before:content-[''] before:absolute before:top-0 before:right-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-stockblue before:to-stockblue/30 before:rounded-r-[2px] before:opacity-70">
                    {(() => {
                      const key = mkKey("introContent", section.id);

                      return isEditing ? (
                        <div className="flex items-start gap-2">
                          <textarea
                            value={section.content || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateTextContent(sectionIndex, val);
                              markDirty(key, val);
                            }}
                            className="w-full leading-[1.7] text-stockblue/85 font-normal text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[150px]"
                          />

                          {isDirty(key) && (
                            <button
                              type="button"
                              onClick={() =>
                                confirmField(key, section.content ?? "")
                              }
                              className="mt-1 h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                              title="אשר שינוי"
                            >
                              <Check size={18} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="leading-[1.7] text-stockblue/85 font-normal m-0 text-[1.1rem] text-justify">
                          <strong>StockBox</strong> {section.content}
                        </p>
                      );
                    })()}
                  </div>
                </>
              )}

              {section.type === "features" && (
                <FeaturesSection
                  isEditing={isEditing}
                  sectionId={section.id}
                  title={section.title}
                  onChangeTitle={(title) =>
                    updateSectionTitle(sectionIndex, title)
                  }
                  features={section.features || []}
                  onAdd={() => {
                    const newFeature: FeatureItem = {
                      id: uid(),
                      icon: "star",
                      title: "כותרת חדשה",
                      description: "תיאור חדש",
                    };

                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: [...(s.features || []), newFeature],
                            }
                          : s,
                      ),
                    );

                    const cardKey = mkKey(
                      "featureCard",
                      section.id,
                      newFeature.id,
                    );

                    setDirtyKeys((prev) => {
                      const next = new Set(prev);
                      next.add(cardKey);
                      return next;
                    });
                  }}
                  onRemove={(itemIndex) => {
                    const featureId = (section.features || [])[itemIndex]?.id;
                    if (!featureId) return;

                    const cardKey = mkKey("featureCard", section.id, featureId);

                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: (s.features || []).filter(
                                (_, ii) => ii !== itemIndex,
                              ),
                            }
                          : s,
                      ),
                    );
                  }}
                  onChange={(itemIndex, field, value) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? {
                              ...s,
                              features: (s.features || []).map((f, ii) =>
                                ii === itemIndex ? { ...f, [field]: value } : f,
                              ),
                            }
                          : s,
                      ),
                    );
                  }}
                  onReorder={(newFeatures: FeatureItem[]) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "features"
                          ? { ...s, features: newFeatures }
                          : s,
                      ),
                    );
                  }}
                  iconOptions={iconOptions}
                  IconMap={IconMap}
                  mkKey={mkKey}
                  isDirty={isDirty}
                  markDirty={markDirty}
                  confirmField={confirmField}
                  hasUnconfirmedChanges={hasUnconfirmedChanges}
                />
              )}

              {/* BULLETS SECTION */}
              {section.type === "bullets" && (
                <BulletsSection
                  isEditing={isEditing}
                  sectionId={section.id}
                  title={section.title}
                  onChangeTitle={(title) =>
                    updateSectionTitle(sectionIndex, title)
                  }
                  bullets={section.bullets || []}
                  onAdd={() => {
                    const newBullet: BulletItem = {
                      id: uid(),
                      text: "נקודה חדשה",
                    };

                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "bullets"
                          ? { ...s, bullets: [...(s.bullets || []), newBullet] }
                          : s,
                      ),
                    );

                    const bulletKey = mkKey(
                      "bulletText",
                      section.id,
                      newBullet.id,
                    );

                    setDirtyKeys((prev) => {
                      const next = new Set(prev);
                      next.add(bulletKey);
                      return next;
                    });
                  }}
                  onRemove={(id) => {
                    const key = mkKey("bulletText", section.id, id);

                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "bullets"
                          ? {
                              ...s,
                              bullets: (s.bullets || []).filter(
                                (b) => b.id !== id,
                              ),
                            }
                          : s,
                      ),
                    );
                  }}
                  onChange={(id, value) => {
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === sectionIndex && s.type === "bullets"
                          ? {
                              ...s,
                              bullets: (s.bullets || []).map((b) =>
                                b.id === id ? { ...b, text: value } : b,
                              ),
                            }
                          : s,
                      ),
                    );
                  }}
                  onReorder={(from, to) => {
                    setSections((prev) =>
                      prev.map((s, i) => {
                        if (i === sectionIndex && s.type === "bullets") {
                          const arr = [...(s.bullets || [])];
                          const [moved] = arr.splice(from, 1);
                          arr.splice(to, 0, moved);
                          return { ...s, bullets: arr };
                        }
                        return s;
                      }),
                    );
                  }}
                  mkKey={mkKey}
                  isDirty={isDirty}
                  markDirty={markDirty}
                  confirmField={confirmField}
                  hasUnconfirmedChanges={hasUnconfirmedChanges}
                />
              )}

              {section.type === "paragraph" && (
                <>
                  {/* Paragraph Title */}
                  {(() => {
                    const key = mkKey("sectionTitle", section.id);

                    return isEditing ? (
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSectionTitle(sectionIndex, val);
                            markDirty(key, val);
                          }}
                          className="text-[1.8rem] text-stockblue font-bold w-full border-2 border-stockblue/30 rounded-lg px-4 py-2 focus:outline-none focus:border-stockblue"
                        />

                        {isDirty(key) && (
                          <button
                            type="button"
                            onClick={() => confirmField(key, section.title)}
                            className="h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                            title="אשר שינוי"
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <h2 className="text-[1.8rem] text-stockblue mb-4 font-bold">
                        {section.title}
                      </h2>
                    );
                  })()}

                  {/* Paragraph Content */}
                  <div className="relative bg-white/60 backdrop-blur-[20px] px-9 py-8 my-4 mb-6 border border-white/30 shadow-[0_2px_16px_rgba(13,48,91,0.04),0_1px_4px_rgba(13,48,91,0.02)] rounded-[20px]">
                    {(() => {
                      const key = mkKey("paragraphContent", section.id);

                      return isEditing ? (
                        <div className="flex items-start gap-2">
                          <textarea
                            value={section.content || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateTextContent(sectionIndex, val);
                              markDirty(key, val);
                            }}
                            className="w-full leading-[1.7] text-stockblue/85 text-[1.1rem] text-justify border-2 border-stockblue/30 rounded-lg px-4 py-3 focus:outline-none focus:border-stockblue min-h-[120px]"
                          />

                          {isDirty(key) && (
                            <button
                              type="button"
                              onClick={() =>
                                confirmField(key, section.content ?? "")
                              }
                              className="mt-1 h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center"
                              title="אשר שינוי"
                            >
                              <Check size={18} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="leading-[1.7] text-stockblue/85 m-0 text-[1.1rem] text-justify">
                          {section.content}
                        </p>
                      );
                    })()}
                  </div>
                </>
              )}

              {isEditing && (
                <div className="mt-6 flex justify-center">
                  <AddSectionButton
                    index={sectionIndex}
                    handleAddSection={handleAddSection}
                    disabled={hasUnconfirmedChanges}
                    disabledReason={TOAST.unconfirmedChangesBlocked}
                    canAdd={isSectionFilledEnough(section)}
                    blockedReason="לפני שמוסיפים מקטע חדש — צריך למלא כותרת + תוכן במקטע הנוכחי."
                    onBlockedAdd={() =>
                      toast.error(
                        "אי אפשר להוסיף מקטע חדש לפני שממלאים את המקטע הנוכחי.",
                      )
                    }
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
          isLoading={isImagesLoading}
        />
      </div>
    </div>
  );
};

export default About;
