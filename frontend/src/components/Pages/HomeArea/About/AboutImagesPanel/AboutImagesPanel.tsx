import React, { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { UserRole } from "../../../../models/user.models";
import { Spinner } from "../../../../ui/spinner";
import { environment } from "../../../../../environments/environment";

type AboutImagesPanelProps = {
  isEditing: boolean;
  role?: UserRole | null;
  isLoading?: boolean;

  images: string[];
  currentIndex: number;

  onPrev: () => void;
  onNext: () => void;

  onRemoveImage: (index: number) => void;
  onClearAll: () => void;
  onReplaceImage: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;

  replaceInputRef?:
    | React.RefObject<HTMLInputElement>
    | React.MutableRefObject<HTMLInputElement | null>;
  addInputRef?:
    | React.RefObject<HTMLInputElement>
    | React.MutableRefObject<HTMLInputElement | null>;
};

const AboutImagesPanel: React.FC<AboutImagesPanelProps> = ({
  isEditing,
  role,
  images,
  currentIndex,
  onPrev,
  onNext,
  onRemoveImage,
  onClearAll,
  onReplaceImage,
  onAddImages,
  replaceInputRef,
  addInputRef,
  isLoading = false,
}) => {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartXRef = React.useRef<number | null>(null);
  const localReplaceRef = React.useRef<HTMLInputElement>(null);
  const localAddRef = React.useRef<HTMLInputElement>(null);

  const replaceRef = replaceInputRef ?? localReplaceRef;
  const addRef = addInputRef ?? localAddRef;

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const within =
        el.contains(document.activeElement) ||
        document.activeElement === document.body;
      if (!within) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onPrev, onNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (dx > 40) onPrev();
    if (dx < -40) onNext();
  };
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <aside
      className="flex-[0_0_320px] flex justify-center items-start
  lg:fixed lg:top-[164px] lg:left-5 z-10 order-1 lg:order-2
  mb-24"
    >
      <div className="relative w-[300px] h-[400px]">
        {/* soft glow bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-500/20 to-purple-500/20 rounded-full scale-110 blur-3xl" />

        {/* card */}
        <div
          ref={wrapRef}
          tabIndex={0}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={`relative z-10 w-full h-full rounded-[3rem] overflow-hidden
            bg-gradient-to-br from-white via-blue-50 to-blue-100/70
            shadow-2xl border-4 border-white/60 backdrop-blur-sm
            ${
              isEditing
                ? ""
                : "transition-all duration-700 ease-out hover:shadow-[0_30px_80px_rgba(59,130,246,0.3)] hover:scale-105 hover:-translate-y-2 hover:rotate-2"
            }
          `}
        >
          {/* sheen + stripe */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-600/10 z-10 pointer-events-none" />
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent z-20 pointer-events-none skew-x-12
              ${
                isEditing
                  ? ""
                  : "-translate-x-full hover:translate-x-full transition-transform duration-1000"
              }
            `}
          />

          {images.length > 0 ? (
            <>
              <img
                src={toFullUrl(images[currentIndex] ?? images[0] ?? "")}
                alt="StockBox preview"
                className={`w-full h-full object-cover scale-105 ${
                  isEditing
                    ? ""
                    : "transition-all duration-1000 ease-out hover:scale-110"
                } pointer-events-none`}
              />

              {isEditing && images.length > 1 && (
                <>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onPrev}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 z-60 h-9 w-9 rounded-full grid place-items-center bg-white/90 text-gray-800 shadow hover:bg-white focus:outline-none
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onNext}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 z-60 h-9 w-9 rounded-full grid place-items-center bg-white/90 text-gray-800 shadow hover:bg-white focus:outline-none
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                    aria-label="תמונה הבאה"
                    title="הבא"
                  >
                    ›
                  </button>
                </>
              )}

              {/* bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-900/30 to-transparent z-10 pointer-events-none" />

              {/* delete + clear (edit/editor only) */}
              {isEditing && role === "editor" && (
                <>
                  <button
                    disabled={isLoading}
                    onClick={() => onRemoveImage(currentIndex)}
                    className={`absolute top-4 right-4 z-[60] pointer-events-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white bg-red-600/90 hover:bg-red-700 shadow-xl transition-all
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                  >
                    מחיקת תמונה
                  </button>

                  {images.length > 0 && (
                    <button
                      disabled={isLoading}
                      onClick={() => setShowClearDialog(true)}
                      className={`absolute top-4 left-4 z-[60] pointer-events-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-red-700 bg-white/90 border border-red-200 hover:bg-red-50 shadow transition-all
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                      title="מחק את כל התמונות"
                    >
                      מחיקת הכל
                    </button>
                  )}

                  {showClearDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 w-60 text-right shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                          למחוק את כל התמונות?
                        </h2>
                        <div className="flex justify-end gap-3">
                          <button
                            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                            onClick={() => setShowClearDialog(false)}
                          >
                            ביטול
                          </button>
                          <button
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                              onClearAll();
                              setShowClearDialog(false);
                            }}
                          >
                            כן, למחוק
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* toolbar (edit/editor only) */}
              {isEditing && role === "editor" && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur shadow-lg px-3 py-2">
                  {/* replace current */}
                  <button
                    disabled={isLoading}
                    onClick={() => replaceRef.current?.click()}
                    className={`h-8 rounded-full px-3 text-xs font-semibold bg-white text-stockblue border border-stockblue/20 hover:bg-blue-50
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                  >
                    החלף
                  </button>

                  <button
                    disabled={isLoading}
                    onClick={() => addRef.current?.click()}
                    className={`h-8 rounded-full px-3 text-xs font-semibold bg-stockblue text-white hover:bg-blue-700
    ${isLoading ? "opacity-50 pointer-events-none" : ""}
  `}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Plus size={14} /> הוסף
                    </span>
                  </button>

                  <input
                    ref={replaceRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onReplaceImage(currentIndex, e)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
              {role === "editor" ? (
                // EDITOR EMPTY STATE (clickable upload)
                <button
                  onClick={() => {
                    if (!isEditing) return;
                    addRef.current?.click();
                  }}
                  onMouseMove={(e) => {
                    const tooltip = e.currentTarget.querySelector(
                      ".cursor-tooltip",
                    ) as HTMLElement;
                    if (tooltip) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${e.clientX - rect.left + 12}px`;
                      tooltip.style.top = `${e.clientY - rect.top + 12}px`;
                    }
                  }}
                  className={`relative group w-full h-full rounded-[3rem] border-2 border-dashed border-stockblue/30 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 transition
    ${isEditing ? "hover:border-stockblue/50 hover:bg-white" : "opacity-70 cursor-not-allowed"}
  `}
                  aria-label="העלאת תמונה"
                >
                  <Upload
                    size={32}
                    className="opacity-70 group-hover:opacity-100"
                  />
                  <span className="text-stockblue/80 font-semibold">
                    אין תמונות כרגע{" "}
                  </span>
                  {isEditing && <span>לחצו כדי להעלות תמונה חדשה</span>}
                  {!isEditing && (
                    <small className="text-xs text-slate-500">
                      יש להיכנס למצב עריכה בשביל להעלות תמונות
                    </small>
                  )}
                  <span className="text-xs text-slate-500">
                    PNG · JPG · JPEG
                  </span>
                </button>
              ) : (
                <div className="w-full h-full rounded-[3rem] border-2 border-dashed border-stockblue/20 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  <span className="text-stockblue/80 font-semibold">
                    אין תמונות כרגע
                  </span>
                </div>
              )}
            </div>
          )}

          <input
            ref={addRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onAddImages}
          />

          {isLoading && (
            <div className="absolute inset-0 z-[80] grid place-items-center bg-white/55 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 shadow">
                <Spinner className="size-5" />
                <span className="text-sm font-semibold text-[#103e76]">
                  טוען…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* floating glows */}
        <div
          className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/40 to-purple-400/30 rounded-full blur-2xl pointer-events-none -z-10 ${
            isEditing ? "" : "animate-pulse"
          }`}
        />
        <div
          className={`absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-blue-500/30 rounded-full blur-3xl pointer-events-none -z-10 ${
            isEditing ? "" : "animate-pulse"
          }`}
        />
      </div>
    </aside>
  );
};

const API_BASE = environment.API_URL;

const toFullUrl = (raw: string) => {
  if (!raw) return "";

  const u = raw.trim().replaceAll("\\", "/");

  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  if (u.startsWith("/")) return `${API_BASE}${u}`;

  return `${API_BASE}/${u}`;
};

export default AboutImagesPanel;
