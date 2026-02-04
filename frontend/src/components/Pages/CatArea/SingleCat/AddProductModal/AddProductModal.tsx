import React from "react";
import { toast } from "sonner";
import useBlockBrowserZoom from "../../Categories/useBlockBrowserZoom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: {
    name: string;
    description: string;
    imageFile: File;
  }) => void;
};

const CROP_BOX = 256;

function getBaseCoverScale(imgW: number, imgH: number, box: number) {
  return Math.max(box / imgW, box / imgH);
}

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

function clampOffsetToCircle(
  offset: { x: number; y: number },
  imgW: number,
  imgH: number,
  zoom: number,
  box: number,
) {
  const baseScale = getBaseCoverScale(imgW, imgH, box);
  const dispW = imgW * baseScale * zoom;
  const dispH = imgH * baseScale * zoom;

  const halfW = dispW / 2;
  const halfH = dispH / 2;
  const radius = box / 2;

  const maxX = Math.max(0, halfW - radius);
  const maxY = Math.max(0, halfH - radius);

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

function anchoredZoom(
  oldZoom: number,
  newZoom: number,
  offset: { x: number; y: number },
  cursorInBox: { x: number; y: number },
  imgW: number,
  imgH: number,
  box: number,
) {
  const baseScale = getBaseCoverScale(imgW, imgH, box);
  const u = cursorInBox.x - box / 2;
  const v = cursorInBox.y - box / 2;

  const newOffsetX = u - (newZoom / oldZoom) * (u - offset.x);
  const newOffsetY = v - (newZoom / oldZoom) * (v - offset.y);

  return clampOffsetToCircle(
    { x: newOffsetX, y: newOffsetY },
    imgW,
    imgH,
    newZoom,
    box,
  );
}

const AddProductModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [productName, setProductName] = React.useState("");
  const [productDesc, setProductDesc] = React.useState("");
  const [rawImage, setRawImage] = React.useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 });
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [committedPreview, setCommittedPreview] = React.useState<string | null>(
    null,
  );

  const cropRef = React.useRef<HTMLDivElement>(null!);
  useBlockBrowserZoom(cropRef);

  React.useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setProductDesc("");
      setRawImage(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsPanning(false);
      setIsCropperOpen(false);
      setCommittedPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setRawImage(img);
        setZoom(1);

        const clamped = clampOffsetToCircle(
          { x: 0, y: 0 },
          img.naturalWidth,
          img.naturalHeight,
          1,
          CROP_BOX,
        );
        setOffset(clamped);
        setIsCropperOpen(true);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const commitCrop = () => {
    if (!rawImage) return null;

    const OUT = 512;
    const out = document.createElement("canvas");
    out.width = OUT;
    out.height = OUT;
    const ctx = out.getContext("2d");
    if (!ctx) return null;

    const iw = rawImage.naturalWidth;
    const ih = rawImage.naturalHeight;
    const baseScale = getBaseCoverScale(iw, ih, CROP_BOX);
    const displayScale = baseScale * zoom;
    const canvasScale = OUT / CROP_BOX;

    ctx.clearRect(0, 0, OUT, OUT);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUT, OUT);

    ctx.save();
    ctx.scale(canvasScale, canvasScale);

    ctx.translate(CROP_BOX / 2, CROP_BOX / 2);
    ctx.translate(offset.x, offset.y);
    ctx.scale(displayScale, displayScale);
    ctx.drawImage(rawImage, -iw / 2, -ih / 2);
    ctx.restore();

    const dataUrl = out.toDataURL("image/jpeg", 0.92);
    setCommittedPreview(dataUrl);
    setIsCropperOpen(false);
    toast.success("התמונה נשמרה לפי המסגור שבחרת");
    return dataUrl;
  };

  const handleSave = () => {
    if (!productName.trim()) {
      toast.error("שם מוצר חובה");
      return;
    }
    let finalImage = committedPreview;
    if (!finalImage && (isCropperOpen || rawImage)) {
      finalImage = commitCrop();
    }
    if (!finalImage) {
      toast.error("נא לבחור תמונה ולהחיל את החיתוך");
      return;
    }
    const safeName = productName.trim().toLowerCase().replace(/\s+/g, "-");
    const file = dataURLtoFile(finalImage, `${safeName}.jpg`);

    onSave({
      name: productName.trim(),
      description: productDesc.trim(),
      imageFile: file,
    });
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
          הוסף מוצר חדש
        </h4>

        <input
          type="text"
          placeholder="שם מוצר"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-3 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
        />

        <input
          type="text"
          placeholder="תיאור מוצר"
          value={productDesc}
          onChange={(e) => setProductDesc(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg mb-5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full mb-4"
        />

        {isCropperOpen && rawImage && (
          <div className="w-full flex flex-col items-center mb-4">
            <div
              ref={cropRef}
              className="relative overflow-hidden select-none touch-none bg-white shadow-lg ring-1 ring-gray-200"
              style={{
                width: CROP_BOX,
                height: CROP_BOX,
                position: "relative",
                touchAction: "none",
                overscrollBehavior: "contain",
              }}
              onWheel={(e) => {
                if (!rawImage) return;
                e.preventDefault();
                e.stopPropagation();
                const rect = (
                  cropRef.current as HTMLDivElement
                ).getBoundingClientRect();
                const cursor = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                };
                const delta = Math.sign(e.deltaY) * -0.1;
                const next = Math.min(
                  4,
                  Math.max(1, +(zoom + delta).toFixed(3)),
                );
                if (next === zoom) return;
                const newOff = anchoredZoom(
                  zoom,
                  next,
                  offset,
                  cursor,
                  rawImage.naturalWidth,
                  rawImage.naturalHeight,
                  CROP_BOX,
                );
                setZoom(next);
                setOffset(newOff);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsPanning(true);
                setStartPan({
                  x: e.clientX - offset.x,
                  y: e.clientY - offset.y,
                });
              }}
              onMouseMove={(e) => {
                if (!isPanning || !rawImage) return;
                const next = {
                  x: e.clientX - startPan.x,
                  y: e.clientY - startPan.y,
                };
                setOffset(
                  clampOffsetToCircle(
                    next,
                    rawImage.naturalWidth,
                    rawImage.naturalHeight,
                    zoom,
                    CROP_BOX,
                  ),
                );
              }}
              onMouseUp={() => setIsPanning(false)}
              onMouseLeave={() => setIsPanning(false)}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setIsPanning(true);
                setStartPan({
                  x: t.clientX - offset.x,
                  y: t.clientY - offset.y,
                });
              }}
              onTouchMove={(e) => {
                if (!isPanning || !rawImage) return;
                const t = e.touches[0];
                const next = {
                  x: t.clientX - startPan.x,
                  y: t.clientY - startPan.y,
                };
                setOffset(
                  clampOffsetToCircle(
                    next,
                    rawImage.naturalWidth,
                    rawImage.naturalHeight,
                    zoom,
                    CROP_BOX,
                  ),
                );
              }}
              onTouchEnd={() => setIsPanning(false)}
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
                src={rawImage.src}
                alt="to-crop"
                draggable={false}
                className="absolute top-1/2 left-1/2 will-change-transform z-10"
                style={{
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                  transformOrigin: "center center",
                  width:
                    rawImage.naturalWidth >= rawImage.naturalHeight
                      ? (CROP_BOX * rawImage.naturalWidth) /
                        rawImage.naturalHeight
                      : CROP_BOX,
                  height:
                    rawImage.naturalHeight > rawImage.naturalWidth
                      ? (CROP_BOX * rawImage.naturalHeight) /
                        rawImage.naturalWidth
                      : CROP_BOX,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                  outline: "2px solid rgba(255,255,255,0.7)",
                  outlineOffset: "-2px",
                  zIndex: 20,
                }}
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))
                }
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                -
              </button>
              <div className="px-2 text-sm text-slate-600">
                זום: {zoom.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))
                }
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  if (rawImage) {
                    setOffset(
                      clampOffsetToCircle(
                        { x: 0, y: 0 },
                        rawImage.naturalWidth,
                        rawImage.naturalHeight,
                        1,
                        CROP_BOX,
                      ),
                    );
                  } else {
                    setOffset({ x: 0, y: 0 });
                  }
                }}
                className="ml-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
              >
                איפוס
              </button>
              <button
                type="button"
                onClick={commitCrop}
                className="ml-2 px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
              >
                השתמש בתמונה
              </button>
            </div>
          </div>
        )}

        {!isCropperOpen && committedPreview && (
          <img
            src={committedPreview}
            alt="preview"
            className="max-w-full mt-2.5 mb-4 h-40 object-cover"
          />
        )}

        <div className="flex justify-between gap-3">
          <button
            onClick={handleSave}
            disabled={isCropperOpen && !committedPreview}
            className={`flex-1 p-3 rounded-lg text-base font-medium transition-all duration-200 text-white shadow-md
              ${isCropperOpen && !committedPreview ? "bg-slate-400 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600 hover:-translate-y-px hover:shadow-lg"}`}
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

export default AddProductModal;
