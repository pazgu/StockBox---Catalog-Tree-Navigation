import React from "react";
import { CheckCircle2, GripVertical, Plus, X, Check } from "lucide-react";

type Bullet = { id: string; text: string };

type FieldKind = "sectionTitle" | "bulletsTitle" | "bulletText";

type BulletsSectionProps = {
  isEditing: boolean;

  title: string;
  onChangeTitle: (t: string) => void;

  bullets: Bullet[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, value: string) => void;

  onReorder: (from: number, to: number) => void;

  sectionId: string;
  mkKey: (kind: FieldKind, sectionId: string, itemId?: string) => string;

  isDirty: (key: string) => boolean;
  markDirty: (key: string, currentValue: string) => void;
  confirmField: (key: string, currentValue: string) => void;

  hasUnconfirmedChanges: boolean;
};

const BulletsSection: React.FC<BulletsSectionProps> = ({
  isEditing,
  title,
  onChangeTitle,
  bullets,
  onAdd,
  onRemove,
  onChange,
  onReorder,
  sectionId,
  mkKey,
  isDirty,
  markDirty,
  confirmField,
  hasUnconfirmedChanges,
}) => {
  const draggedIndexRef = React.useRef<number | null>(null);

  const itemRefs = React.useRef<HTMLLIElement[]>([]);
  const inputRefs = React.useRef<HTMLInputElement[]>([]);
  const prevLen = React.useRef<number>(bullets.length);

  itemRefs.current.length = bullets.length;
  inputRefs.current.length = bullets.length;

  React.useEffect(() => {
    if (!isEditing) {
      prevLen.current = bullets.length;
      return;
    }
    if (bullets.length > prevLen.current) {
      const idx = bullets.length - 1;
      const el = itemRefs.current[idx];
      const input = inputRefs.current[idx];

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add(
          "ring-2",
          "ring-stockblue",
          "ring-offset-2",
          "ring-offset-white",
          "rounded-lg",
        );
        setTimeout(() => {
          el.classList.remove(
            "ring-2",
            "ring-stockblue",
            "ring-offset-2",
            "ring-offset-white",
            "rounded-lg",
          );
        }, 1200);
      }
      input?.focus();
      input?.select();
    }
    prevLen.current = bullets.length;
  }, [bullets.length, isEditing]);

  const handleDragStart = (index: number) => {
    if (hasUnconfirmedChanges) return;
    draggedIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (hasUnconfirmedChanges) return;

    const from = draggedIndexRef.current;
    if (from === null || from === overIndex) return;
    onReorder(from, overIndex);
    draggedIndexRef.current = overIndex;
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
  };

  const handleAddClick = () => {
    if (hasUnconfirmedChanges) return;
    onAdd();
  };

  return (
    <section dir="rtl">
      <div className="flex items-center justify-between mb-4">
        {(() => {
          const key = mkKey("bulletsTitle", sectionId);

          return isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeTitle(val);
                  markDirty(key, val);
                }}
                className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
              />

              {isDirty(key) && (
                <button
                  type="button"
                  onClick={() => confirmField(key, title)}
                  className="mt-8 mb-4 h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center flex-shrink-0"
                  title="אשר שינוי"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ) : (
            <h2 className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
              {title}
            </h2>
          );
        })()}

        {isEditing && (
          <button
            onClick={handleAddClick}
            disabled={hasUnconfirmedChanges}
            className={`mt-4 ml-3 inline-flex items-center gap-1 font-semibold text-sm ${
              hasUnconfirmedChanges
                ? "text-gray-400 cursor-not-allowed"
                : "text-stockblue hover:text-blue-700"
            }`}
            title={
              hasUnconfirmedChanges
                ? "יש לאשר שינויים (✓) לפני הוספת נקודה"
                : "הוסף נקודה"
            }
          >
            הוסף נקודה
            <Plus size={16} />
          </button>
        )}
      </div>

      <ul className="list-none p-0 my-5 mb-7 grid gap-3">
        {bullets.map((b, i) => {
          const key = mkKey("bulletText", sectionId, b.id);

          return (
            <li
              key={b.id}
              ref={(el) => {
                if (el) itemRefs.current[i] = el;
              }}
              className={`flex items-start gap-2.5 ${isEditing ? "cursor-move" : ""}`}
              draggable={isEditing && !hasUnconfirmedChanges}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
            >
              {isEditing && (
                <div className="flex-shrink-0 text-stockblue/40 cursor-move mt-1 group relative">
                  <GripVertical size={18} />
                  <span className="absolute top-1/2 -translate-y-1/2 left-7 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md z-50">
                    יש לגרור לשינוי סדר
                  </span>
                </div>
              )}

              <span className="bg-stockblue/10 text-stockblue w-7 h-7 rounded-full inline-flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </span>

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={(el) => {
                      if (el) inputRefs.current[i] = el;
                    }}
                    type="text"
                    value={b.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange(b.id, val);
                      markDirty(key, val);
                    }}
                    className="flex-1 text-slate-700 text-base leading-[1.7] border border-stockblue/30 rounded px-3 py-1.5 focus:outline-none focus:border-stockblue"
                  />

                  {isDirty(key) && (
                    <button
                      type="button"
                      onClick={() => confirmField(key, b.text)}
                      className="h-9 w-9 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center flex-shrink-0"
                      title="אשר שינוי"
                    >
                      <Check size={16} />
                    </button>
                  )}

                  {bullets.length > 1 && (
                    <button
                      onClick={() => onRemove(b.id)}
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      title="מחיקת נקודה"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-slate-700 text-base leading-[1.7]">
                  {b.text}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default BulletsSection;
