import React from "react";
import { toast } from "sonner";
import { Category } from "../../Categories";
import {
  getBaseCoverScale,
  clampOffsetToCircle,
  anchoredZoom,
} from "../../cropMath/cropMath";
import useBlockBrowserZoom from "../../useBlockBrowserZoom";

type Props = {
  isOpen: boolean;
  category: Category; 
  onClose: () => void;
  onSave: (updated: Category) => void;
};

const CROP_BOX = 256;

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
    setPreviewImage(category.categoryImage);
  }, [category]);

  if (!isOpen) return null;

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

  const handleSave = () => {
    const updated: Category = {
      ...category,
      categoryName: name.trim(), 
      categoryImage: previewImage, 
    };
    onSave(updated);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-xl flex items-center justify-center z-50 transition-all duration-300 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl w-[800px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl text-center transform translate-y-[-2px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight">
          ערוך קטגוריה
        </h4>

        <input
          type="text"
          placeholder="שם קטגוריה"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
        />

        {/* upload to open cropper */}
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full mb-4"
        />

        {/* edit current image without uploading */}
        {!isEditCropperOpen && previewImage && (
          <button
            type="button"
            onClick={openCropperFromCurrent}
            className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 font-medium transition-all"
          >
            ערוך מיקום/זום של התמונה הנוכחית
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
                const rect = (
                  editCropRef.current as HTMLDivElement
                ).getBoundingClientRect();
                const cursor = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                };
                const delta = Math.sign(e.deltaY) * -0.1;
                const next = Math.min(
                  4,
                  Math.max(1, +(editZoom + delta).toFixed(3))
                );
                if (next === editZoom) return;

                const newOffset = anchoredZoom(
                  editZoom,
                  next,
                  editOffset,
                  cursor,
                  editRawImage.naturalWidth,
                  editRawImage.naturalHeight,
                  CROP_BOX
                );
                setEditZoom(next);
                setEditOffset(newOffset);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsEditPanning(true);
                setEditStartPan({
                  x: e.clientX - editOffset.x,
                  y: e.clientY - editOffset.y,
                });
              }}
              onMouseMove={(e) => {
                if (!isEditPanning) return;
                const next = {
                  x: e.clientX - editStartPan.x,
                  y: e.clientY - editStartPan.y,
                };
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
                const next = {
                  x: t.clientX - editStartPan.x,
                  y: t.clientY - editStartPan.y,
                };
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
              {/* checker bg */}
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

              {/* image layer */}
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
                      ? (CROP_BOX * editRawImage.naturalWidth) /
                        editRawImage.naturalHeight
                      : CROP_BOX,
                  height:
                    editRawImage.naturalHeight > editRawImage.naturalWidth
                      ? (CROP_BOX * editRawImage.naturalHeight) /
                        editRawImage.naturalWidth
                      : CROP_BOX,
                }}
              />

              {/* dark mask */}
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

            {/* controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() =>
                  setEditZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))
                }
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                -
              </button>
              <div className="px-2 text-sm text-slate-600">
                זום: {editZoom.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))
                }
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetEditCrop}
                className="ml-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                איפוס
              </button>
              <button
                type="button"
                onClick={commitEditCrop}
                className="ml-2 px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
              >
                השתמש בתמונה
              </button>
            </div>
          </div>
        )}

        {/* preview */}
        {!isEditCropperOpen && previewImage && (
          <img
            src={previewImage}
            alt="preview"
            className="max-w-full mt-2.5 rounded-lg mb-4 h-40 object-cover"
          />
        )}

        <div className="flex justify-between gap-3">
          <button
            onClick={handleSave}
            disabled={isEditCropperOpen}
            className={`flex-1 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md ${
              isEditCropperOpen
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-lg"
            }`}
          >
            שמור
          </button>

          <button
            onClick={onClose}
            className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-300 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;
