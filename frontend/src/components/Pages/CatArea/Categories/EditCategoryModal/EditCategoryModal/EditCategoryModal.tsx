import React from "react";
import { toast } from "sonner";
import { Category } from "../../Categories";
import {
  getBaseCoverScale,
  clampOffsetToCircle,
  anchoredZoom,
} from "../../cropMath/cropMath";
import useBlockBrowserZoom from "../../useBlockBrowserZoom";
import { Spinner } from "../../../../../ui/spinner";


type Props = {
  isOpen: boolean;
  category: Category; 
  onClose: () => void;
  onSave: (updated: Category) => Promise<void>;
};

const CROP_BOX = 256;
function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

const EditCategoryModal: React.FC<Props> = ({
  isOpen,
  category,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState(category.categoryName);
  const [previewImage, setPreviewImage] = React.useState<string>(
    category.categoryImage
  );

  const [imageFile, setImageFile] = React.useState<File | undefined>(undefined); 
  const [isSaving, setIsSaving] = React.useState(false);



  const [isEditCropperOpen, setIsEditCropperOpen] = React.useState(false);
  const [editRawImage, setEditRawImage] =
    React.useState<HTMLImageElement | null>(null);
  const [editZoom, setEditZoom] = React.useState(1);
  const [editOffset, setEditOffset] = React.useState({ x: 0, y: 0 });
  const [isEditPanning, setIsEditPanning] = React.useState(false);
  const [editStartPan, setEditStartPan] = React.useState({ x: 0, y: 0 });

  const editCropRef = React.useRef<HTMLDivElement>(null!);
  useBlockBrowserZoom(editCropRef);

  React.useEffect(() => {
    setName(category.categoryName);
    setImageFile(undefined); 
    setPreviewImage(category.categoryImage);
  }, [category]);

  if (!isOpen) return null;

  const moveImage = (dx: number, dy: number) => {
  if (!editRawImage) return;
  const next = { x: editOffset.x + dx, y: editOffset.y + dy };
  setEditOffset(
    clampOffsetToCircle(
      next,
      editRawImage.naturalWidth,
      editRawImage.naturalHeight,
      editZoom,
      CROP_BOX
    )
  );
};


  const openCropperFromCurrent = () => {
    if (!previewImage) {
      toast.error("אין תמונה לעריכה");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setEditRawImage(img);
      setEditZoom(1);

      const clamped = clampOffsetToCircle(
        { x: 0, y: 0 },
        img.naturalWidth,
        img.naturalHeight,
        1,
        CROP_BOX
      );
      setEditOffset(clamped);
      setIsEditCropperOpen(true);
    };
    img.src = previewImage;
  };

  const commitEditCrop = () => {
  if (!editRawImage) return;

  const OUT = 512;
  const canvas = document.createElement("canvas");
  canvas.width = OUT;
  canvas.height = OUT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const iw = editRawImage.naturalWidth;
  const ih = editRawImage.naturalHeight;

  const baseScale = getBaseCoverScale(iw, ih, CROP_BOX);
  const displayScale = baseScale * editZoom;
  const canvasScale = OUT / CROP_BOX;

  ctx.clearRect(0, 0, OUT, OUT);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUT, OUT);

  ctx.save();
  ctx.scale(canvasScale, canvasScale);
  ctx.beginPath();
  ctx.arc(CROP_BOX / 2, CROP_BOX / 2, CROP_BOX / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.translate(CROP_BOX / 2, CROP_BOX / 2);
  ctx.translate(editOffset.x, editOffset.y);
  ctx.scale(displayScale, displayScale);
  ctx.drawImage(editRawImage, -iw / 2, -ih / 2);
  ctx.restore();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  const safe = name.trim().toLowerCase().replace(/\s+/g, "-") || "category";
  const file = dataURLtoFile(dataUrl, `${safe}.jpg`);

  setImageFile(file);        
  setPreviewImage(dataUrl);  
  setIsEditCropperOpen(false);
  setEditRawImage(null);

  toast.success("התמונה עודכנה לפי המסגור החדש");
};


  const resetEditCrop = () => {
    setEditZoom(1);
    setEditOffset({ x: 0, y: 0 });
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("נא לבחור קובץ תמונה");
      return;
    }
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`התמונה גדולה מדי (מעל ${MAX_MB}MB)`);
      return;
    }

     setImageFile(file); 

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setEditRawImage(img);
        setEditZoom(1);
        const clamped = clampOffsetToCircle(
          { x: 0, y: 0 },
          img.naturalWidth,
          img.naturalHeight,
          1,
          CROP_BOX
        );
        setEditOffset(clamped);
        setIsEditCropperOpen(true);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
  const trimmed = name.trim();

  if (!trimmed) {
    toast.error("שם קטגוריה חובה");
    return;
  }

  const updated = {
    ...category,
    categoryName: trimmed,
    imageFile,
  } as any;

  try {
    setIsSaving(true);
    await onSave(updated);
    toast.success("הקטגוריה עודכנה בהצלחה");
  } catch (error: any) {
    const serverMessage =
      error?.response?.data?.message || error?.response?.data?.error;

    if (typeof serverMessage === "string" && serverMessage.trim()) {
      toast.error(serverMessage);
    } else {
      toast.error("שגיאה בעדכון הקטגוריה");
    }

    console.error("Edit category failed:", error);
  } finally {
    setIsSaving(false);
  }
};




 return (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => {
      if (!isSaving) onClose();
    }}
  >
    <div
  className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-gray-100 text-right overflow-hidden"
  onClick={(e) => e.stopPropagation()}
>
  <div className="overflow-y-auto max-h-[90vh] p-8">
      {/* Header */}
      <div className="flex justify-start w-full mb-6">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
          <svg
            className="w-7 h-7 text-[#0D305B]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>עריכת קטגוריה</span>
        </h2>
      </div>

      {/* Name field */}
      <div className="group mb-5">
        <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
          שם קטגוריה
        </label>

        <input
          type="text"
          placeholder="שם קטגוריה"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
        />
      </div>

      {/* Image upload */}
      <div className="group mb-4">
        <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
          תמונת קטגוריה
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl
                     file:border-0 file:text-sm file:font-bold
                     file:bg-[#0D305B] file:text-white
                     hover:file:bg-[#15457a]
                     text-sm text-gray-600"
        />
      </div>

      {/* Edit current image without uploading */}
      {!isEditCropperOpen && previewImage && (
        <button
          type="button"
          onClick={openCropperFromCurrent}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-[#0D305B] font-bold transition-all shadow-sm hover:shadow-md"
        >
          עריכת מיקום/זום של התמונה הנוכחית
        </button>
      )}
{isEditCropperOpen && editRawImage && (
  <div className="w-full flex flex-col items-center mb-4">
    <div
      ref={editCropRef}
      className="relative overflow-hidden select-none touch-none bg-white shadow-lg ring-1 ring-gray-200"
      style={{
        width: CROP_BOX,
        height: CROP_BOX,
        borderRadius: "50%",
        position: "relative",
        touchAction: "none",
        overscrollBehavior: "contain",
      }}
      onWheel={(e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!editRawImage) return;

      const SCROLL_SPEED = 1; 

      if (e.ctrlKey) {
        const rect = editCropRef.current.getBoundingClientRect();
        const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const deltaZoom = Math.sign(e.deltaY) * -0.1;
        const nextZoom = Math.min(4, Math.max(1, +(editZoom + deltaZoom).toFixed(3)));
        if (nextZoom === editZoom) return;

        const newOffset = anchoredZoom(
          editZoom,
          nextZoom,
          editOffset,
          cursor,
          editRawImage.naturalWidth,
          editRawImage.naturalHeight,
          CROP_BOX
        );

        setEditZoom(nextZoom);
        setEditOffset(newOffset);
      } else {
        const dx = e.deltaX * SCROLL_SPEED;
        const dy = e.deltaY * SCROLL_SPEED;

        setEditOffset(prev =>
          clampOffsetToCircle(
            { x: prev.x + dx, y: prev.y + dy },
            editRawImage.naturalWidth,
            editRawImage.naturalHeight,
            editZoom,
            CROP_BOX
          )
        );
      }
    }}

      onMouseUp={() => setIsEditPanning(false)}
      onMouseLeave={() => setIsEditPanning(false)}
      onTouchStart={(e) => {
        const t = e.touches[0];
        setIsEditPanning(true);
        setEditStartPan({
          x: t.clientX - editOffset.x,
          y: t.clientY - editOffset.y,
        });
      }}
      onTouchMove={(e) => {
        if (!isEditPanning) return;
        const t = e.touches[0];
        const next = { x: t.clientX - editStartPan.x, y: t.clientY - editStartPan.y };
        setEditOffset(
          clampOffsetToCircle(
            next,
            editRawImage.naturalWidth,
            editRawImage.naturalHeight,
            editZoom,
            CROP_BOX
          )
        );
      }}
      onTouchEnd={() => setIsEditPanning(false)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          zIndex: 0,
        }}
      />
      <img
        src={editRawImage.src}
        alt="edit-crop"
        draggable={false}
        className="absolute top-1/2 left-1/2 will-change-transform z-10"
        style={{
          transform: `translate(calc(-50% + ${editOffset.x}px), calc(-50% + ${editOffset.y}px)) scale(${editZoom})`,
          transformOrigin: "center center",
          width:
            editRawImage.naturalWidth >= editRawImage.naturalHeight
              ? (CROP_BOX * editRawImage.naturalWidth) / editRawImage.naturalHeight
              : CROP_BOX,
          height:
            editRawImage.naturalHeight > editRawImage.naturalWidth
              ? (CROP_BOX * editRawImage.naturalHeight) / editRawImage.naturalWidth
              : CROP_BOX,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "50%",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
          outline: "2px solid rgba(255,255,255,0.7)",
          outlineOffset: "-2px",
          zIndex: 20,
        }}
      />
    </div>

    <div className="flex flex-wrap items-center gap-2 mt-4">
      <button
        type="button"
        onClick={() => setEditZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
        className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-[#0D305B] font-bold"
      >
        -
      </button>
      <div className="px-2 text-sm text-gray-600 font-semibold">
        זום: {editZoom.toFixed(2)}
      </div>
      <button
        type="button"
        onClick={() => setEditZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))}
        className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-[#0D305B] font-bold"
      >
        +
      </button>
      <button
        type="button"
        onClick={resetEditCrop}
        className="ml-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold"
      >
        איפוס
      </button>
      <button
        type="button"
        onClick={commitEditCrop}
        className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D305B] to-[#15457a] text-white hover:from-[#15457a] hover:to-[#1e5a9e] font-bold shadow-lg hover:shadow-xl"
      >
        השתמש בתמונה
      </button>
    </div>
  </div>
)}


      {/* Preview */}
      {!isEditCropperOpen && previewImage && (
        <img
          src={previewImage}
          alt="preview"
          className="max-w-full mt-2.5 rounded-xl mb-4 h-40 object-cover shadow-sm"
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
        <button
          onClick={onClose}
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl border-2 border-gray-300 transition-colors font-bold
            ${isSaving ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
        >
          ביטול
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || isEditCropperOpen}
          className={`px-8 py-3 rounded-xl text-white transition-colors font-bold shadow-lg
            ${
              isSaving || isEditCropperOpen
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0D305B] to-[#15457a] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl"
            }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="size-4 text-white" />
              שומר...
            </span>
          ) : (
            "שמור שינויים"
          )}
        </button>
      </div>
    </div>
  </div>
    </div>
);

};

export default EditCategoryModal;
