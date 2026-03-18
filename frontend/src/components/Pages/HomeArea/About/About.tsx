/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import FeaturesSection from "./FeaturesSection/FeaturesSection";
import AboutImagesPanel from "./AboutImagesPanel/AboutImagesPanel";
import { aboutApi } from "../../../../services/aboutApi";
import BulletsSection from "./BulletsSection/BulletsSection";
import { debounce } from "../../../../lib/utils";
import AboutSkeleton from "./AboutSkeleton/AboutSkeleton";
import {
  uid,
  CTA_SECTION_ID,
  type FeatureItem,
  type BulletItem,
  type ImageItem,
  type SectionType,
  createNewSection,
  mkKey,
  isSectionFilledEnough,
  getHeaderOffset,
  blocksToSections,
  sectionsToBlocks,
  buildSnapshotFromSections,
  IconMap,
  iconOptions,
  ensureCtaSection,
  scrollToSectionAndFocus,
  reorderSections,
  normalizeImageIndex,
  revokePreviewUrls,
} from "./about.utils";
import IntroSection from "./IntroSection/IntroSection";
import ParagraphSection from "./ParagraphSection/ParagraphSection";
import CtaSection from "./CtaSection/CtaSection";
import {
  AboutFloatingActions,
  EmptyAboutSectionsState,
  AboutSectionTopActions,
  AboutSectionFooterActions,
  AboutBottomDropZone,
} from "./AboutPageParts";
import UnsavedChangesDialog from "../../SharedComponents/UnsavedChangesDialog/UnsavedChangesDialog";
import { useSocket } from "../../../../hooks/useSocket";

interface AboutProps { }

const About: FC<AboutProps> = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editExitAction, setEditExitAction] = useState<"save" | "cancel" | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [editableImages, setEditableImages] = useState<ImageItem[]>([]);
  const [pendingAddedFiles, setPendingAddedFiles] = useState<File[]>([]);
  const images = editableImages.map((i) => i.url);
  const navigate = useNavigate();
  const { role } = useUser();
  const token = localStorage.getItem("token") || "";
  const { onEvent, offEvent } = useSocket({ token });
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const addInputRef = React.useRef<HTMLInputElement>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const contentSectionsCount = useMemo(
    () => sections.filter((s) => s.type !== "cta").length,
    [sections],
  );

  const isEmptyContent = contentSectionsCount === 0;
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
  const draggedIndexRef = React.useRef<number | null>(null);
  const pendingScrollToSectionIdRef = React.useRef<string | null>(null);
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

  const fetchAboutData = useCallback(async () => {
    try {
      setIsPageLoading(true);

      const res = await aboutApi.get();
      const loadedSections = blocksToSections(res.blocks ?? []);
      const loadedImages: ImageItem[] = (res.images ?? []).map((url) => ({
        url,
      }));

      const withCta = ensureCtaSection(loadedSections);

      setSections(withCta);
      setEditableImages(loadedImages);
      setOriginalData({
        sections: withCta,
        images: loadedImages,
      });

      setConfirmedSnapshot(buildSnapshotFromSections(withCta));
      setDirtyKeys(new Set());

      setCurrentImageIndex((prev) =>
        normalizeImageIndex(prev, loadedImages.length),
      );
    } catch (e) {
      toast.error(TOAST.loadError);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  const touchStartXRef = React.useRef<number | null>(null);
  useEffect(() => {
    void fetchAboutData();
  }, [fetchAboutData]);

  useEffect(() => {
    const handleAboutUpdated = () => {
      if (isEditing) return;
      void fetchAboutData();
    };

    onEvent("about_updated", handleAboutUpdated);

    return () => {
      offEvent("about_updated", handleAboutUpdated);
    };
  }, [onEvent, offEvent, fetchAboutData, isEditing]);

  const handleAddSection = (
    afterIndex: number,
    type: "features" | "bullets" | "paragraph",
  ) => {
    if (hasUnconfirmedChanges) {
      toastErrorOnce(TOAST.unconfirmedChangesBlocked);
      return;
    }

    const newSection = createNewSection(type);
    pendingScrollToSectionIdRef.current = newSection.id;
    setSections((prev) => {
      const ctaIndex = prev.findIndex((s) => s.type === "cta");
      const safeAfterIndex =
        ctaIndex !== -1 && afterIndex >= ctaIndex ? ctaIndex - 1 : afterIndex;

      return [
        ...prev.slice(0, safeAfterIndex + 1),
        newSection,
        ...prev.slice(safeAfterIndex + 1),
      ];
    });
  };

  const removeSection = (index: number) => {
    if (sections[index]?.type === "cta") return;
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
    setDragOverIndex(index);
    draggedIndexRef.current = index;
    dragCounterRef.current = 0;
  };

  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    const from = draggedIndexRef.current;
    if (from === null || from === index) return;
    setDragOverIndex(index);

    const headerOffset = getHeaderOffset();
    const topThreshold = headerOffset + 40;
    const bottomThreshold = 140;
    const speed = 24;
    const y = e.clientY;
    if (y < topThreshold) {
      window.scrollBy({ top: -speed, behavior: "auto" });
    } else if (window.innerHeight - y < bottomThreshold) {
      window.scrollBy({ top: speed, behavior: "auto" });
    }
  };

  const handleSectionDragEnd = () => {
    const from = draggedIndexRef.current;
    const toRaw = dragOverIndex;
    setDraggedSectionIndex(null);
    setDragOverIndex(null);
    dragCounterRef.current = 0;
    draggedIndexRef.current = null;
    if (from === null || toRaw === null || from === toRaw) return;
    setSections((prev) => reorderSections(prev, from, toRaw));
  };

  const handleSectionDragEnter = (index: number) => {
    setDragOverIndex(index);
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
    const normalizedIndex = normalizeImageIndex(
      currentImageIndex,
      images.length,
    );

    if (normalizedIndex !== currentImageIndex) {
      setCurrentImageIndex(normalizedIndex);
    }
  }, [images.length, currentImageIndex]);

  useEffect(() => {
    scrollToSectionAndFocus(
      pendingScrollToSectionIdRef.current,
      sections,
      sectionRefs,
      () => {
        pendingScrollToSectionIdRef.current = null;
      },
    );
  }, [sections]);

  const hasActualChanges = useCallback(() => {
    if (pendingAddedFiles.length > 0) return true;

    const currentBlocks = sectionsToBlocks(sections);
    const originalBlocks = sectionsToBlocks(originalData.sections);
    const currentImages = editableImages
      .filter((i) => !i.isPreview)
      .map((i) => i.url);
    const originalImages = originalData.images.map((i) => i.url);

    return (
      JSON.stringify(currentBlocks) !== JSON.stringify(originalBlocks) ||
      JSON.stringify(currentImages) !== JSON.stringify(originalImages)
    );
  }, [
    sections,
    originalData.sections,
    originalData.images,
    editableImages,
    pendingAddedFiles,
  ]);

  const handleSaveChanges = useCallback(async () => {
    if (!hasActualChanges()) {
      setIsEditing(false);
      return;
    }

    const invalidIndex = sections.findIndex(
      (s) => !isSectionFilledEnough(s),
    );

    if (invalidIndex !== -1) {
      toast.error("אי אפשר לשמור כשיש מקטע ריק. מלא כותרת ותוכן ואז שמור.");
      sectionRefs.current[invalidIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

       try {
      setIsSaving(true);

      const payload = {
        blocks: sectionsToBlocks(sections),
        images: editableImages.filter((i) => !i.isPreview).map((i) => i.url),
      };

      if (pendingAddedFiles.length > 0) {
        setIsImagesLoading(true);
        try {
          const res = await aboutApi.uploadImages(pendingAddedFiles);

          setEditableImages((prev) => {
            revokePreviewUrls(prev);
            return prev;
          });

          const serverAfterUpload = res.images ?? [];
          const originalUrls = originalData.images.map((i) => i.url);
          const alreadyInPayload = payload.images;

          const newlyAdded = serverAfterUpload.filter(
            (u) => !originalUrls.includes(u) && !alreadyInPayload.includes(u),
          );

          payload.images = [...payload.images, ...newlyAdded];

          setPendingAddedFiles([]);
          setEditableImages(payload.images.map((url) => ({ url })));
          setCurrentImageIndex((idx) => {
            const len = payload.images.length;
            if (len === 0) return 0;
            return Math.min(idx, len - 1);
          });
        } finally {
          setIsImagesLoading(false);
        }
      }

      await aboutApi.replace(payload);

      setConfirmedSnapshot(buildSnapshotFromSections(sections));
      setDirtyKeys(new Set());
      setOriginalData({
        sections: sections,
        images: payload.images.map((url) => ({ url })),
      });
      setIsEditing(false);
      toast.success(TOAST.saveSuccess);
       } catch (e) {
      toast.error(TOAST.saveError);
    } finally {
      setIsSaving(false);
    }
  }, [
    sections,
    editableImages,
    pendingAddedFiles,
    originalData.sections,
    originalData.images,
    hasActualChanges,
    TOAST.saveSuccess,
    TOAST.saveError,
  ]);

  const cancelEdit = useCallback(() => {

    setPendingAddedFiles([]);
    setEditableImages((prev) => {
      revokePreviewUrls(prev);
      return prev;
    });
    setSections(originalData.sections);
    setEditableImages(originalData.images);
    const snap = buildSnapshotFromSections(originalData.sections);
    setConfirmedSnapshot(snap);
    setDirtyKeys(new Set());
    setCurrentImageIndex(0);
    setIsEditing(false);
  }, [originalData.sections, originalData.images]);

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

  const handleAddImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setPendingAddedFiles((prev) => [...prev, ...files]);
    input.value = "";
  };

  const removeImage = useCallback(
    (index: number) => {
      if (!isEditing) return;

      setEditableImages((prev) => {
        const next = prev.filter((_, i) => i !== index);

        setCurrentImageIndex((cur) => {
          if (next.length === 0) return 0;
          return Math.min(cur, next.length - 1);
        });

        return next;
      });
    },
    [isEditing],
  );

  const clearAllImages = useCallback(() => {
    if (!isEditing) return;

    setEditableImages([]);
    setCurrentImageIndex(0);
  }, [isEditing]);

  const debouncedSaveChanges = useMemo(
    () =>
      debounce(() => {
        void handleSaveChanges();
      }, 600),
    [handleSaveChanges],
  );

  const debouncedCancelEdit = useMemo(
    () =>
      debounce(() => {
        void cancelEdit();
      }, 600),
    [cancelEdit],
  );

  const cancelPendingExit = () => {
    (debouncedSaveChanges as any).cancel?.();
    (debouncedCancelEdit as any).cancel?.();
  };

  const handleCancelClick = () => {
    cancelPendingExit();

    if (hasActualChanges()) {
      setShowCancelConfirm(true);
      return;
    }

    setEditExitAction("cancel");
    debouncedCancelEdit();
  };

  const handleDragOverContainer = (e: React.DragEvent) => {
    if (!isEditing) return;

    const threshold = 120;
    const speed = 25;
    const viewportHeight = window.innerHeight;
    const cursorY = e.clientY;
    if (cursorY < threshold) {
      const scrollAmount = -speed * ((threshold - cursorY) / threshold);
      window.scrollBy({ top: scrollAmount, behavior: "auto" });
    } else if (viewportHeight - cursorY < threshold) {
      const scrollAmount =
        speed * ((threshold - (viewportHeight - cursorY)) / threshold);
      window.scrollBy({ top: scrollAmount, behavior: "auto" });
    }
  };

  if (isPageLoading) {
    return (
      <div className="pt-8 min-h-screen font-['Arial'] direction-rtl" dir="rtl">
        <AboutSkeleton />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOverContainer}
      className="pt-8 min-h-screen font-['Arial'] direction-rtl"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex items-start gap-15 py-10 flex-wrap lg:flex-nowrap">
        <div className="flex-1 p-5 lg:ml-[400px] order-2 lg:order-1">
          <AboutFloatingActions
            role={role}
            isEditing={isEditing}
            isSaving={isSaving}
            handleCancelClick={handleCancelClick}
            cancelPendingExit={cancelPendingExit}
            setEditExitAction={setEditExitAction}
            debouncedSaveChanges={debouncedSaveChanges}
            setIsEditing={setIsEditing}
          />
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
              onDragEnd={handleSectionDragEnd}
              className={`relative my-6 transition-all duration-200 ${isEditing
                ? "border-2 border-dashed border-stockblue/30 rounded-xl p-4 cursor-move hover:border-stockblue/50"
                : ""
                } ${draggedSectionIndex === sectionIndex
                  ? "opacity-40 scale-95 rotate-1"
                  : ""
                } ${dragOverIndex === sectionIndex &&
                  draggedSectionIndex !== sectionIndex
                  ? "border-stockblue border-solid bg-stockblue/5 scale-[1.02]"
                  : ""
                }`}
            >
              <AboutSectionTopActions
                isEditing={isEditing}
                isCtaSection={section.type === "cta"}
                sectionIndex={sectionIndex}
                removeSection={removeSection}
              />

              {section.type === "intro" && (
                <IntroSection
                  section={section}
                  sectionIndex={sectionIndex}
                  isEditing={isEditing}
                  updateSectionTitle={updateSectionTitle}
                  updateTextContent={updateTextContent}
                  markDirty={markDirty}
                  confirmField={confirmField}
                  isDirty={isDirty}
                  mkKey={mkKey}
                />
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
                      title: "",
                      description: "",
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
                      text: "",
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
                <ParagraphSection
                  section={section}
                  sectionIndex={sectionIndex}
                  isEditing={isEditing}
                  updateSectionTitle={updateSectionTitle}
                  updateTextContent={updateTextContent}
                  markDirty={markDirty}
                  confirmField={confirmField}
                  isDirty={isDirty}
                  mkKey={mkKey}
                />
              )}

              {section.type === "cta" && (
                <CtaSection
                  isEditing={isEditing}
                  handleNavigateToCategories={handleNavigateToCategories}
                />
              )}

              <AboutSectionFooterActions
                isEditing={isEditing}
                isCtaSection={section.type === "cta"}
                sectionIndex={sectionIndex}
                hasUnconfirmedChanges={hasUnconfirmedChanges}
                canAdd={isSectionFilledEnough(section)}
                handleAddSection={handleAddSection}
                disabledReason={TOAST.unconfirmedChangesBlocked}
                blockedReason="לפני שמוסיפים מקטע חדש — צריך למלא כותרת + תוכן במקטע הנוכחי."
                onBlockedAdd={() =>
                  toast.error(
                    "אי אפשר להוסיף מקטע חדש לפני שממלאים את המקטע הנוכחי.",
                  )
                }
              />
            </div>
          ))}

          <EmptyAboutSectionsState
            isEditing={isEditing}
            isEmptyContent={isEmptyContent}
            hasUnconfirmedChanges={hasUnconfirmedChanges}
            handleAddSection={handleAddSection}
            unconfirmedChangesBlockedText={TOAST.unconfirmedChangesBlocked}
          />

          <AboutBottomDropZone
            isEditing={isEditing}
            hasUnconfirmedChanges={hasUnconfirmedChanges}
            dragOverIndex={dragOverIndex}
            sectionsLength={sections.length}
            draggedIndexRef={draggedIndexRef}
            setDragOverIndex={setDragOverIndex}
          />
        </div>

        {/* Image Panel */}
        <AboutImagesPanel
          isEditing={isEditing}
          editExitAction={editExitAction}
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
      <UnsavedChangesDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          setEditExitAction("cancel");
          debouncedCancelEdit();
        }}
      />
    </div>
  );
};

export default About;