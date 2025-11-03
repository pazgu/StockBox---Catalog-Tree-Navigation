import React, { FC, useState, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../ui/accordion";
import cam from "../../../../assets/red-lens-camera.png";
import {
  Heart,
  PencilLine,
  Upload,
  Plus,
  GripVertical,
  MailQuestionIcon,
} from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FolderPlus,
  Folder,
  File,
  Video,
  Music,
  FileText,
  Download,
  Trash2,
  X,
} from "lucide-react";
import {
  AccordionData,
  UploadedFile,
  FileFolder,
} from "../../../../types/types";
import AccordionSection from "../AccordionSection/AccordionSection/AccordionSection";
import ImageCarousel from "../ImageCarousel/ImageCarousel/ImageCarousel";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";

interface SingleProdProps {}
// Helper function to generate a unique ID (simple timestamp for this example)
const generateUniqueId = () =>
  `accordion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const SingleProd: FC<SingleProdProps> = () => {
  const { role } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("מצלמת DSLR קלאסית עם עדשה אדומה");
  const path: string[] = ["categories", "single-cat", title];
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

  // === IMAGE STATES (MODIFIED) ===
  const [productImages, setProductImages] = useState<string[]>([cam]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [originalImages] = useState<string[]>([cam]);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  // === IMAGE HANDLERS ===
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  //This section is for the files upload
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setProductImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImage = URL.createObjectURL(files[0]);
      setProductImages((prev) =>
        prev.map((img, i) => (i === currentImageIndex ? newImage : img))
      );
    }
  };

  const handleDeleteImage = () => {
    setProductImages((prev) => {
      if (prev.length === 1) return prev; // keep at least one
      const updated = prev.filter((_, i) => i !== currentImageIndex);
      setCurrentImageIndex((prevIndex) =>
        prevIndex === updated.length ? updated.length - 1 : prevIndex
      );
      return updated;
    });
  };

  const [draggedItem, setDraggedItem] = useState<AccordionData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [folders, setFolders] = useState<FileFolder[]>([
    { id: "folder-1", name: "ניסויים", files: [] },
  ]);
  const toggleFavorite = () => {
    if (isFavorite) {
      toast.info("הוסר מהמועדפים ");
    } else {
      toast.success("נוסף למועדפים ");
    }
    setIsFavorite((prev) => !prev);
  };
  const handleAccordionContentChange = (id: string, newContent: string) => {
    setAccordionData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, content: newContent } : item
      )
    );
  };

  const handleAccordionTitleChange = (id: string, newTitle: string) => {
    setAccordionData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  const addCustomAccordion = () => {
    setAccordionData((prevData) => [
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
    setAccordionData((prevData) => prevData.filter((item) => item.id !== id));
  };

  // Handle drag start
  const handleDragStart = (item: AccordionData) => {
    setDraggedItem(item);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem: AccordionData) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    setAccordionData((prevData) => {
      const newItems = [...prevData];
      const draggedIndex = newItems.findIndex(
        (item) => item.id === draggedItem.id
      );
      const targetIndex = newItems.findIndex(
        (item) => item.id === targetItem.id
      );

      if (draggedIndex === -1 || targetIndex === -1) return prevData;

      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      return newItems;
    });

    setDraggedItem(null); // Reset dragged item
  };

  const features = useMemo(() => {
    try {
      const data = accordionData.find(
        (item) => item.id === "features"
      )?.content;
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, [accordionData]);

  const setFeatures = useCallback((newFeatures: string[]) => {
    handleAccordionContentChange("features", JSON.stringify(newFeatures));
  }, []);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, "תכונה חדשה"]);
  const removeFeature = (index: number) =>
    setFeatures(features.filter((_: string, i: number) => i !== index));

  const handleSaveClick = () => {
    if (isEditing) {
      toast.success("השינויים נישמרו בהצלחה!");
    }
    setIsEditing(!isEditing);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("video/"))
      return <Video size={20} className="text-purple-600" />;
    if (type.startsWith("audio/"))
      return <Music size={20} className="text-blue-600" />;
    if (type.startsWith("image/"))
      return <File size={20} className="text-green-600" />;
    if (type.includes("pdf"))
      return <FileText size={20} className="text-red-600" />;
    return <File size={20} className="text-gray-600" />;
  };

  const handleFileUpload = (
    folderId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: generateUniqueId(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      }));

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, files: [...folder.files, ...newFiles] }
            : folder
        )
      );
    }
  };

  const handleDeleteFile = (folderId: string, fileId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, files: folder.files.filter((f) => f.id !== fileId) }
          : folder
      )
    );
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          name: newFolderName,
          files: [],
        },
      ]);
      setNewFolderName("");
      setShowNewFolderInput(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };
  return (
    <div className="pt-16 px-6 pb-10 font-sans-['Noto_Sans_Hebrew'] rtl">
      <Breadcrumbs path={path} />
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
              onClick={handleSaveClick}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stockblue to-stockblue"></div>

              {/* === IMAGE CAROUSEL START === */}
              <ImageCarousel
                productImages={productImages}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                prevImage={prevImage}
                nextImage={nextImage}
                isEditing={isEditing}
                handleReplaceImage={handleReplaceImage}
                handleAddImages={handleAddImages}
                handleDeleteImage={handleDeleteImage}
                title={title}
              />

              {/* Buttons */}
              {role === "user" ? (
                <div className="space-y-2 relative z-10 flex flex-row justify-center gap-12">
                  <button
                    title="צור קשר"
                    className="w-14 h-12 py-3 px-4 rounded-lg font-semibold text-stockblue transition-all duration-300 transform hover:scale-105  active:scale-95"
                    onClick={() => {
                      const email = process.env.REACT_APP_CONTACT_EMAIL;
                      const subject = encodeURIComponent(`${title}`);
                      const body = process.env.REACT_APP_EMAIL_BODY || "";
                      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                    }}
                    dir="rtl"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <MailQuestionIcon size={24} />
                  </button> <h3 className="pt-1">|</h3>

                  <button
                    title="הוסף למועדפים"
                    onClick={toggleFavorite}
                    className={` w-14 h-12 flex items-center justify-center rounded-lg hover:scale-105 transition-all duration-300 transform
        ${isFavorite ? " text-red-600" : " text-gray-700"}`}
                  >
                    <Heart
                      size={24}
                      fill={isFavorite ? "currentColor" : "none"}
                      className="transition-all duration-300 mb-3.5 text-red-700 size-6"
                    />
                  </button>
                </div>
              ) : role === "admin" ? (
                <div className="relative z-10">
                  <Link
                    to="/permissions"
                    className="block w-full text-center py-3 px-4 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    נהל הרשאות
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Accordion List */}

          <AccordionSection
            isEditing={isEditing}
            accordionData={accordionData}
            features={features}
            folders={folders}
            draggedItem={draggedItem}
            showNewFolderInput={showNewFolderInput}
            newFolderName={newFolderName}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            setDraggedItem={setDraggedItem}
            handleAccordionTitleChange={handleAccordionTitleChange}
            handleAccordionContentChange={handleAccordionContentChange}
            removeAccordion={removeAccordion}
            addCustomAccordion={addCustomAccordion}
            addFeature={addFeature}
            removeFeature={removeFeature}
            handleFeatureChange={handleFeatureChange}
            getFileIcon={getFileIcon}
            handleFileUpload={handleFileUpload}
            handleDeleteFolder={handleDeleteFolder}
            handleDeleteFile={handleDeleteFile}
            formatFileSize={formatFileSize}
            setShowNewFolderInput={setShowNewFolderInput}
            setNewFolderName={setNewFolderName}
            handleCreateFolder={handleCreateFolder}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleProd;
