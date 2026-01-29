import React, { FC, useState, useCallback, useMemo } from "react";
import {
  Heart,
  PencilLine,
  MailQuestionIcon,
  Check,
  Upload,
  X,
  File,
  Save,
  Video,
  Music,
  FileText,
} from "lucide-react";

import { useUser } from "../../../../context/UserContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AccordionData } from "../../../models/accordion.models";
import AccordionSection from "../AccordionSection/AccordionSection/AccordionSection";
import ImageCarousel from "../ImageCarousel/ImageCarousel/ImageCarousel";
import Breadcrumbs from "../../../LayoutArea/Breadcrumbs/Breadcrumbs";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductsService } from "../../../../services/ProductService";
import { ProductDto } from "../../../../components/models/product.models";
import { CloudinaryService } from "../../../../services/Cloudinary.service";
import { FileFolder, UploadedFile } from "../../../models/files.models";
import bulletIcon from "../../../../assets/bullets.png";
import contentIcon from "../../../../assets/font.png";
import { Spinner } from "../../../../components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { handleEntityRouteError } from "../../../../lib/routing/handleEntityRouteError";

import { useLocation } from "react-router-dom";
import { userService } from "../../../../services/UserService";
import { User } from "@/components/models/user.models";

interface SingleProdProps {}

const SingleProd: FC<SingleProdProps> = () => {
  const { role, id } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [originalProduct, setOriginalProduct] = useState<ProductDto | null>(
    null,
  );
  const [newAccordionType, setNewAccordionType] = useState<
    "bullets" | "content" | null
  >(null);
  const [showAccordionTypeSelector, setShowAccordionTypeSelector] =
    useState(false);
  const [accordionData, setAccordionData] = useState<AccordionData[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [draggedItem, setDraggedItem] = useState<AccordionData | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const contentIconUrl = contentIcon;
  const bulletsIconUrl = bulletIcon;
  const [isSaving, setIsSaving] = useState(false);
  const addImagesInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const { productId } = useParams<{ productId: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!productId) return;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    if (!isValidObjectId) {
      navigate("/404", { replace: true });
      return;
    }

    const loadProduct = async () => {
      try {
        const product = await ProductsService.getById(productId);

        setTitle(product.productName);
        setDescription(product.productDescription || "");
        setProductImages(product.productImages || []);
        setCurrentImageIndex(0);
        setProduct(product);
        setOriginalProduct(product);

        if (Array.isArray(product.customFields)) {
          const accordion = product.customFields.map((field: any) => ({
            id: field._id,
            uiId: field._id,
            title: field.title,
            type: field.type,
            content:
              field.type === "bullets"
                ? JSON.stringify(field.bullets)
                : field.content,
          }));
          setAccordionData(accordion);
        }

        const folders =
          product.uploadFolders?.[0]?.folders.map((folder: any) => ({
            uiId: folder._id,
            name: folder.folderName,
            files: folder.files.map((file: any) => ({
              uiId: file._id,
              name: file.link.split("/").pop(),
              type: "",
              url: file.link,
              size: 0,
            })),
          })) || [];

        setFolders(folders);
      } catch (err) {
        if (handleEntityRouteError(err, navigate)) return;

        console.error(err);
        toast.error("שגיאה בטעינת המוצר");
      }
    };

    loadProduct();
  }, [productId, navigate, id]);

  const location = useLocation();
  const breadcrumbPath = useMemo(() => {
    const hasPassedBreadcrumbs = Boolean(location.state?.searchBreadcrumbs);
    const searchVar = location.state?.searchBreadcrumbs;

    if (hasPassedBreadcrumbs && typeof searchVar === "string") {
      return ["categories", ...searchVar.split("/").filter(Boolean)];
    }

    if (!product) return ["categories"];

    const rawPath = Array.isArray(product.productPath)
      ? product.productPath[0]
      : (product.productPath as unknown as string);

    if (!rawPath) return ["categories"];

    const cleanPath = rawPath
      .replace(/^\/categories\//, "")
      .replace(/^categories\//, "");

    return ["categories", ...cleanPath.split("/").filter(Boolean)];
  }, [product, location.state]);

  type EditSnapshot = {
    title: string;
    description: string;
    productImages: string[];
    accordionData: AccordionData[];
    folders: FileFolder[];
  };

  const [editSnapshot, setEditSnapshot] = useState<EditSnapshot | null>(null);
  const enterEditMode = () => {
    setEditSnapshot({
      title,
      description,
      productImages: [...productImages],
      accordionData: JSON.parse(JSON.stringify(accordionData)),
      folders: JSON.parse(JSON.stringify(folders)),
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!editSnapshot) {
      setIsEditing(false);
      return;
    }

    setTitle(editSnapshot.title);
    setDescription(editSnapshot.description);
    setProductImages(editSnapshot.productImages);
    setAccordionData(editSnapshot.accordionData);
    setFolders(editSnapshot.folders);

    setCurrentImageIndex(0);
    setIsEditing(false);
    setEditSnapshot(null);

    toast.success("העריכה בוטלה בהצלחה");
  };

  const nextImage = () => {
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    if (productImages.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1,
    );
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);

    try {
      const uploads = Array.from(files).map((file) =>
        CloudinaryService.uploadFile(file, "products/images"),
      );

      const results = await Promise.all(uploads);
      const urls = results.map((r) => r.url);

      setProductImages((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("העלאת תמונות נכשלה");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);

    try {
      const result = await CloudinaryService.uploadFile(
        files[0],
        "products/images",
      );

      setProductImages((prev) =>
        prev.map((img, i) => (i === currentImageIndex ? result.url : img)),
      );
    } catch (err) {
      console.error("Image replacement failed", err);
      toast.error("החלפת תמונה נכשלה");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = () => {
    setProductImages((prev) => {
      const updated = prev.filter((_, i) => i !== currentImageIndex);
      if (updated.length === 0) {
        setCurrentImageIndex(0);
        return [];
      }
      setCurrentImageIndex((prevIndex) =>
        prevIndex >= updated.length ? updated.length - 1 : prevIndex,
      );
      return updated;
    });
  };
  const handleAccordionContentChange = (uiId: string, newContent: string) => {
    setAccordionData((prevData) =>
      prevData.map((item) =>
        item.uiId === uiId ? { ...item, content: newContent } : item,
      ),
    );
  };

  const handleAccordionTitleChange = (uiId: string, newTitle: string) => {
    setAccordionData((prevData) =>
      prevData.map((item) =>
        item.uiId === uiId ? { ...item, title: newTitle } : item,
      ),
    );
  };

  const confirmAddAccordion = (type: "content" | "bullets") => {
    const newItem = {
      uiId: `ui-${Date.now()}`, // required for type AccordionData
      id: `new-${Date.now()}`,
      title: "",
      type,
      content: type === "bullets" ? JSON.stringify([]) : "",
    };

    addCustomAccordion(newItem);

    setShowAccordionTypeSelector(false);
    setNewAccordionType(null);
  };

  const addCustomAccordion = (newItem?: AccordionData) => {
    if (!newItem) return;
    setAccordionData((prev) => [...prev, newItem]);
  };

  const removeAccordion = (uiId: string) => {
    setAccordionData((prevData) =>
      prevData.filter((item) => item.uiId !== uiId),
    );
  };

  const handleDragStart = (item: AccordionData) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetItem: AccordionData) => {
    if (!draggedItem || draggedItem.uiId === targetItem.uiId) return;

    setAccordionData((prevData) => {
      const newItems = [...prevData];

      const draggedIndex = newItems.findIndex(
        (item) => item.uiId === draggedItem.uiId,
      );
      const targetIndex = newItems.findIndex(
        (item) => item.uiId === targetItem.uiId,
      );

      if (draggedIndex === -1 || targetIndex === -1) return prevData;

      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, removed);

      return newItems;
    });

    setDraggedItem(null);
  };

  const features = useMemo(() => {
    try {
      const data = accordionData.find(
        (item) => item.uiId === "features",
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

  const handleSaveClick = async () => {
    if (!isEditing) {
      enterEditMode();
      setIsEditing(true);
      return;
    }
    const hasEmptyFields = accordionData.some((item) =>
      item.type === "content"
        ? !item.content?.trim()
        : item.type === "bullets"
          ? !(item.content && JSON.parse(item.content).length > 0)
          : false,
    );

    if (hasEmptyFields) {
      toast.error("לא ניתן לשמור שדות ריקים");
      return;
    }

    const customFields = accordionData.map((item) => ({
      _id: item.id,
      title: item.title,
      type: item.type,
      content: item.type === "content" ? item.content : undefined,
      bullets:
        item.type === "bullets" ? JSON.parse(item.content || "[]") : undefined,
    }));
    const uploadFolders = folders.length
      ? [
          {
            title: "Default Group",
            folders: folders
              .filter((folder) => folder.files.length > 0)
              .map((folder) => ({
                ...(folder._id ? { _id: folder._id } : {}),
                folderName: folder.name,
                files: folder.files.map((file) => ({
                  ...(file._id ? { _id: file._id } : {}),
                  link: file.url,
                  name: file.name,
                  size: file.size,
                })),
              })),
          },
        ]
      : [];

    const payload = {
      productName: title,
      productDescription: description,
      productImages,
      customFields,
      uploadFolders,
    };
    // Check if anything changed
    const hasChanges =
      title !== originalProduct?.productName ||
      description !== originalProduct?.productDescription ||
      JSON.stringify(accordionData) !==
        JSON.stringify(
          originalProduct?.customFields?.map((field) => ({
            uiId: field._id,
            title: field.title,
            type: field.type,
            content:
              field.type === "bullets"
                ? JSON.stringify(field.bullets)
                : field.content,
          })),
        ) ||
      JSON.stringify(productImages) !==
        JSON.stringify(originalProduct?.productImages) ||
      JSON.stringify(folders) !==
        JSON.stringify(
          originalProduct?.uploadFolders?.[0]?.folders.map((folder) => ({
            uiId: folder._id,
            name: folder.folderName,
            files: folder.files.map((f) => ({
              uiId: f._id,
              name: f.link.split("/").pop(),
              url: f.link,
              size: 0,
            })),
          })) || [],
        );

    if (!hasChanges) {
      setIsEditing(false);
      toast.info("לא נעשו שינויים");
      return;
    }

    try {
      setIsSaving(true);
      await ProductsService.updateProduct(productId!, payload);
      toast.success("שינויים נשמרו בהצלחה");
      setEditSnapshot(null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("לא הצלחנו לשמור את המוצר. נסה שוב בבקשה.");
    } finally {
      setIsSaving(false);
    }
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

  const handleFileUpload = async (
    folderUiId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      try {
        const result = await CloudinaryService.uploadFile(file);
        uploadedFiles.push({
          uiId: crypto.randomUUID(),
          name: result.originalName,
          type: file.type,
          url: result.url,
          size: result.size,
        });
      } catch (err) {
        console.error("Upload failed for", file.name, err);
        toast.error(`Upload failed for ${file.name}`);
      }
    }

    setFolders((prev) =>
      prev.map((folder) =>
        folder.uiId === folderUiId
          ? { ...folder, files: [...folder.files, ...uploadedFiles] }
          : folder,
      ),
    );
  };

  const handleDeleteFile = (folderUiId: string, fileUiId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.uiId === folderUiId
          ? {
              ...folder,
              files: folder.files.filter((f) => f.uiId !== fileUiId),
            }
          : folder,
      ),
    );
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders((prev) => [
        ...prev,
        {
          uiId: crypto.randomUUID(),
          name: newFolderName,
          files: [],
        },
      ]);
      setNewFolderName("");
      setShowNewFolderInput(false);
    }
  };

  const handleDeleteFolder = (folderUiId: string) => {
    setFolders((prev) => prev.filter((f) => f.uiId !== folderUiId));
  };

  const toggleFavorite = async (itemId: string) => {
    if (!id) {
      toast.error("יש להתחבר כדי להוסיף למועדפים");
      return;
    }

    const previousUser = user;
    const isFavorite = user?.favorites?.some((fav) => fav.id === itemId);

    setUser((prev) => {
      if (!prev) return prev;
      const favorites = prev.favorites ?? [];
      return {
        ...prev,
        favorites: isFavorite
          ? favorites.filter((fav) => fav.id !== itemId)
          : [...favorites, { id: itemId, type: "product" }],
      };
    });

    try {
      const updatedUser = await userService.toggleFavorite(itemId, "product");

      setUser(updatedUser);

      toast[isFavorite ? "info" : "success"](
        `${product?.productName} ${isFavorite ? "הוסר מהמועדפים" : "נוסף למועדפים"}`,
      );
    } catch (err) {
      setUser(previousUser);
      toast.error("שגיאה בעדכון המועדפים. נסה שוב.");
      console.error(err);
    }
  };
  const isFavorite = useMemo(() => {
    return user?.favorites?.some((fav) => fav.id === product?._id) ?? false;
  }, [user?.favorites, product?._id]);
  return (
    <div className="pt-16 px-6 pb-10 font-sans-['Noto_Sans_Hebrew'] rtl">
      <Breadcrumbs path={breadcrumbPath} />
      <div className="max-w-6xl mx-auto">
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

          {role === "editor" && (
            <div className="fixed bottom-8 left-6 flex flex-col gap-3 z-50">
              {isEditing && (
                <div className="relative">
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    aria-label="ביטול עריכה"
                    className={`peer flex items-center justify-center w-14 h-14 rounded-full font-semibold bg-white text-red-600 shadow-lg ring-2 ring-red-500/20 hover:ring-red-500/30 hover:bg-red-50 transition-all duration-300
                      ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <X size={22} />
                  </button>
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    ביטול עריכה
                  </span>
                </div>
              )}

              <div className="relative">
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  aria-label={isEditing ? "שמירת שינויים" : "עריכת דף"}
                  className={`peer flex items-center justify-center w-14 h-14 rounded-full font-semibold text-white bg-stockblue shadow-lg ring-2 ring-stockblue/30 hover:ring-stockblue/40 hover:bg-stockblue/90 transition-all duration-300
                    ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSaving ? (
                    <Spinner className="size-6 text-white" />
                  ) : isEditing ? (
                    <Save size={22} />
                  ) : (
                    <PencilLine size={22} />
                  )}
                </button>
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                  {isSaving
                    ? "שומר..."
                    : isEditing
                      ? "שמור שינויים"
                      : "עריכת דף"}
                </span>
              </div>
            </div>
          )}
        </div>

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

              {productImages.length > 0 ? (
                <div className="relative mb-4">
                  {isUploadingImages && (
                    <div className="absolute inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm rounded-2xl">
                      <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 shadow">
                        <Spinner className="size-6 text-stockblue" />
                        <span className="text-sm font-semibold text-stockblue">
                          מעלה תמונות…
                        </span>
                      </div>
                    </div>
                  )}
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
                    isUploading={isUploadingImages}
                    title={title}
                  />
                </div>
              ) : (
                <div className="relative mb-4">
                  {/* outer soft card */}
                  <div
                    className={`relative overflow-hidden rounded-[32px] p-[14px] shadow-[0_18px_55px_rgba(15,23,42,0.12)]
${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}
                  >
                    {/* dreamy background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f7fbff] via-white to-[#eaf1ff]" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-200/25 blur-3xl" />
                    <div className="absolute -bottom-14 -right-14 w-48 h-48 rounded-full bg-indigo-200/25 blur-3xl" />

                    {/* uploading overlay - ADD THIS BACK */}
                    {isUploadingImages && (
                      <div className="absolute inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm rounded-[32px]">
                        <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 shadow">
                          <Spinner className="size-6 text-stockblue" />
                          <span className="text-sm font-semibold text-stockblue">
                            מעלה תמונות…
                          </span>
                        </div>
                      </div>
                    )}

                    {/* inner dashed area */}
                    <button
                      type="button"
                      disabled={isUploadingImages}
                      onClick={() => {
                        if (!isEditing) {
                          toast.info("כדי להעלות תמונות יש להיכנס למצב עריכה");
                          return;
                        }
                        addImagesInputRef.current?.click();
                      }}
                      className={`relative z-10 w-full h-[320px] rounded-[28px]
          border-2 border-dashed border-slate-300/80
          bg-white/55 backdrop-blur-sm
          flex flex-col items-center justify-center gap-3
          transition-all
          ${isEditing ? "hover:bg-white/70 hover:border-slate-400/90" : ""}
          ${isUploadingImages ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {/* upload icon bubble */}
                      <div className="h-14 w-14 rounded-2xl bg-white/70 shadow-sm grid place-items-center">
                        <Upload className="h-7 w-7 text-slate-500" />
                      </div>

                      <div className="text-center leading-snug">
                        <div className="text-[18px] font-semibold text-slate-500">
                          אין תמונות כרגע – לחצו כדי להעלות
                        </div>
                        <div className="mt-2 text-[13px] tracking-wide text-slate-400">
                          PNG · JPG · JPEG
                        </div>
                      </div>
                    </button>

                    <input
                      ref={addImagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAddImages}
                    />
                  </div>
                </div>
              )}

              {role === "viewer" ? (
                <div className="space-y-2 relative z-10 flex flex-row justify-center gap-12">
                  <div className="relative">
                    <button
                      onClick={() => {
                        const email = process.env.REACT_APP_CONTACT_EMAIL;
                        const subject = encodeURIComponent(`${title}`);
                        const body = process.env.REACT_APP_EMAIL_BODY || "";
                        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                      }}
                      className="peer w-14 h-12 py-3 px-4 rounded-lg font-semibold text-stockblue transition-all duration-300 transform hover:scale-105 active:scale-95"
                      dir="rtl"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      <MailQuestionIcon size={24} />
                    </button>
                    <span className="absolute top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                      צור קשר
                    </span>
                  </div>

                  <h3 className="pt-1">|</h3>

                  <div className="relative">
                    <button
                      className={`peer w-14 h-12 flex items-center justify-center rounded-lg hover:scale-105 transition-all duration-300 transform
                      ${isFavorite ? "text-red-600" : "text-gray-700"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product?._id || "");
                      }}
                    >
                      <Heart
                        size={24}
                        fill={isFavorite ? "currentColor" : "none"}
                        className="transition-all duration-300 mb-3.5 text-red-700 size-6"
                      />
                    </button>
                    <span className="absolute top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                      {isFavorite ? "הסר ממועדפים" : "הוסף למועדפים"}
                    </span>
                  </div>
                </div>
              ) : role === "editor" ? (
                <div className="relative z-10">
                  <Link
                    to={`/permissions/product/${product?._id}`}
                    className="block w-full text-center py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-800 shadow-md transition-all duration-300"
                  >
                    נהל הרשאות
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <AccordionSection
            isEditing={isEditing}
            accordionData={accordionData}
            features={features}
            folders={folders}
            draggedItem={draggedItem}
            showNewFolderInput={showNewFolderInput}
            newFolderName={newFolderName}
            contentIconUrl={contentIconUrl}
            bulletsIconUrl={bulletsIconUrl}
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
            confirmAddAccordion={confirmAddAccordion}
            showAccordionTypeSelector={showAccordionTypeSelector}
            setShowAccordionTypeSelector={setShowAccordionTypeSelector}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleProd;
