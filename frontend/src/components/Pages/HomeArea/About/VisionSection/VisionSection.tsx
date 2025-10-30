import React from "react";
import { CheckCircle2, GripVertical, Plus, X } from "lucide-react";

type VisionSectionProps = {
  isEditing: boolean;
  title: string;
  onChangeTitle: (t: string) => void;

  points: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;

  onReorder: (from: number, to: number) => void;
};

const VisionSection: React.FC<VisionSectionProps> = ({
  isEditing,
  title,
  onChangeTitle,
  points,
  onAdd,
  onRemove,
  onChange,
  onReorder,
}) => {
  const draggedIndexRef = React.useRef<number | null>(null);

  // Refs for each row + its input
  const itemRefs = React.useRef<HTMLLIElement[]>([]);
  const inputRefs = React.useRef<HTMLInputElement[]>([]);
  const prevLen = React.useRef<number>(points.length);

  // Keep arrays in sync with points length
  itemRefs.current.length = points.length;
  inputRefs.current.length = points.length;

  // When a new point is added (length grew), scroll to it + focus its input
  React.useEffect(() => {
    if (!isEditing) {
      prevLen.current = points.length;
      return;
    }
    if (points.length > prevLen.current) {
      const idx = points.length - 1;
      const el = itemRefs.current[idx];
      const input = inputRefs.current[idx];

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // quick highlight pulse
        el.classList.add(
          "ring-2",
          "ring-stockblue",
          "ring-offset-2",
          "ring-offset-white",
          "rounded-lg"
        );
        setTimeout(() => {
          el.classList.remove(
            "ring-2",
            "ring-stockblue",
            "ring-offset-2",
            "ring-offset-white",
            "rounded-lg"
          );
        }, 1200);
      }
      input?.focus();
      input?.select();
    }
    prevLen.current = points.length;
  }, [points.length, isEditing]);

  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    const from = draggedIndexRef.current;
    if (from === null || from === overIndex) return;
    onReorder(from, overIndex);
    draggedIndexRef.current = overIndex;
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
  };

  return (
    <section dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
          />
        ) : (
          <h2 className="text-[1.8rem] text-stockblue mt-8 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
            {title}
          </h2>
        )}

        {isEditing && (
          <button
            onClick={onAdd}
            className="mt-4 ml-3 inline-flex items-center gap-1 text-stockblue hover:text-blue-700 font-semibold text-sm"
          >
            הוסף נקודה
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Points list */}
      <ul className="list-none p-0 my-5 mb-7 grid gap-3">
        {points.map((point, i) => (
          <li
            key={i}
            ref={(el) => {
              if (el) itemRefs.current[i] = el;
            }}
            className={`flex items-start gap-2.5 ${isEditing ? "cursor-move" : ""}`}
            draggable={isEditing}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
          >
            {isEditing && (
              <div className="flex-shrink-0 text-stockblue/40 cursor-move mt-1">
                <GripVertical size={18} />
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
                  value={point}
                  onChange={(e) => onChange(i, e.target.value)}
                  className="flex-1 text-slate-700 text-base leading-[1.7] border border-stockblue/30 rounded px-3 py-1.5 focus:outline-none focus:border-stockblue"
                />
                {points.length > 1 && (
                  <button
                    onClick={() => onRemove(i)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                    title="מחק נקודה"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ) : (
              <span className="text-slate-700 text-base leading-[1.7]">{point}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default VisionSection;
