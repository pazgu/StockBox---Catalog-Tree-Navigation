import React from "react";
import { toast } from "sonner";
import useBlockBrowserZoom from "../../Categories/useBlockBrowserZoom";
import { Spinner } from "../../../../ui/spinner";
import { Asterisk } from "lucide-react";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: {
  name: string;
  description: string;
  imageFile: File;
}) => Promise<void>;

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

const RequiredStar = () => (
  <Asterisk
    size={14}
    className="text-red-600 relative -top-[1px]"
    aria-hidden="true"
  />
);




const AddProductModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [productName, setProductName] = React.useState("");
  const [productDesc, setProductDesc] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const FORBIDDEN_CHARS = /[;|"'*<>]/;
  const [rawImage, setRawImage] = React.useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = React.useState(false);

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
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const generateCroppedImage = () => {
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

    return out.toDataURL("image/jpeg", 0.92);
  };


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductName(value);
  if (!value) {
    setErrorMessage(""); 
  } else if (FORBIDDEN_CHARS.test(value)) {
    setErrorMessage("שם מוצר לא יכול להכיל תווים ; | \" ' * < >");
  } else {
    setErrorMessage(""); 
  }
};

  const handleClose = () => {
  setErrorMessage(""); 
  setProductName(""); 
  setRawImage(null);
  onClose();           
};

  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error("שם מוצר חובה");
    return;
  }

    if (!rawImage) {
      toast.error("נא לבחור תמונה");
      return;
    }

    const croppedDataUrl = generateCroppedImage();
    if (!croppedDataUrl) {
      toast.error("שגיאה ביצירת התמונה");
      return;
    }

    const safeName = productName.trim().toLowerCase().replace(/\s+/g, "-");
    const file = dataURLtoFile(croppedDataUrl, `${safeName}.jpg`);

    try {
      setIsSaving(true);

      await onSave({
        name: productName.trim(),
        description: productDesc.trim(),
        imageFile: file,
      });
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message || error?.response?.data?.error;

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        toast.error(serverMessage);
      } else {
        toast.error("שגיאה בהוספת מוצר");
      }

      console.error("Add product failed:", error);
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

          <div className="flex justify-start w-full mb-6">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
              <svg className="w-7 h-7 text-[#0D305B]" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>הוספת מוצר חדש</span>
            </h2>
          </div>

          <div className="group mb-5">
          <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center">
            <span className="inline-flex items-center gap-1 flex-row-reverse">
              <span>שם מוצר</span>
              <RequiredStar />
            </span>
          </label>




            <input
              type="text"
              placeholder="שם מוצר"
              value={productName}
              onChange={handleNameChange}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
            />
            {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
          </div>

          <div className="group mb-5">
           <label className="block text-sm font-bold mb-2 text-gray-700">
              תיאור מוצר
            </label>


            <input
              type="text"
              placeholder="תיאור מוצר"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
            />
          </div>

          <div className="group mb-4">
      <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center">
  <span className="inline-flex items-center gap-1 flex-row-reverse">
    <span>תמונת מוצר</span>
    <RequiredStar />
  </span>
</label>




            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl
               file:border-0 file:text-sm file:font-bold
               file:bg-[#0D305B] file:text-white
               hover:file:bg-[#15457a]
               text-sm text-gray-600"
            />
          </div>

          {rawImage && (
            <div className="w-full flex flex-col items-center mb-4">
              <div
                ref={cropRef}
                className="relative overflow-hidden select-none touch-none bg-white shadow-lg ring-1 ring-gray-200"
                style={{
                  width: CROP_BOX,
                  height: CROP_BOX,
                  position: "relative",
                  borderRadius: "16px", 
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
                    width: rawImage.naturalWidth * getBaseCoverScale(rawImage.naturalWidth, rawImage.naturalHeight, CROP_BOX),
                    height: rawImage.naturalHeight * getBaseCoverScale(rawImage.naturalWidth, rawImage.naturalHeight, CROP_BOX),
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                    outline: "2px solid rgba(255,255,255,0.7)",
                    borderRadius: "16px",
                    outlineOffset: "-2px",
                    zIndex: 20,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700"
                >
                  -
                </button>

                <div className="px-2 text-sm text-slate-600">זום: {zoom.toFixed(2)}</div>

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))}
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
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
            <button
               onClick={handleClose}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl border-2 border-gray-300 transition-colors font-bold
      ${
                isSaving
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              ביטול
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl text-white transition-colors font-bold shadow-lg
      ${
                isSaving
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#0D305B] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl"
              }`}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="size-4 text-white" />
                  מוסיף...
                </span>
              ) : (
                "שמור"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddProductModal;