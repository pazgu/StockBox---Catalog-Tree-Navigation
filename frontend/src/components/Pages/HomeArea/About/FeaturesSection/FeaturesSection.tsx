import React, { FC, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type IconOption = { value: string; label: string };

// IconMap is a map from your Hebrew icon value to a React component (Lucide)
type IconMapType = { [key: string]: FC<{ size?: number }> };

interface FeaturesSectionProps {
  isEditing: boolean;
  title: string;
  onChangeTitle: (val: string) => void;

  features: Feature[];
  onAdd: () => void; // parent will push a default feature
  onRemove: (index: number) => void;
  onChange: (index: number, field: "title" | "description", value: string) => void;

  // Reorder callback: receives the entire, newly-ordered array
  onReorder: (next: Feature[]) => void;

  iconOptions: IconOption[];
  IconMap: IconMapType;
}

const FeaturesSection: FC<FeaturesSectionProps> = ({
  isEditing,
  title,
  onChangeTitle,

  features,
  onAdd,
  onRemove,
  onChange,

  onReorder,

  iconOptions,
  IconMap,
}) => {
  // for DnD
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // for scroll & focus after add
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const titleInputRefs = useRef<HTMLInputElement[]>([]);
  const prevLenRef = useRef<number>(features.length);

  // keep refs sized to features length
  useEffect(() => {
    itemRefs.current.length = features.length;
    titleInputRefs.current.length = features.length;
  }, [features.length]);

  // detect "added item" and scroll + focus + highlight
  useEffect(() => {
    if (features.length > prevLenRef.current) {
      const newIndex = features.length - 1;
      const itemEl = itemRefs.current[newIndex];
      const inputEl = titleInputRefs.current[newIndex];

      // scroll into view
      if (itemEl) {
        itemEl.scrollIntoView({ behavior: "smooth", block: "center" });
        // temporary highlight ring
        itemEl.classList.add(
          "ring-2",
          "ring-stockblue",
          "ring-offset-2",
          "ring-offset-white"
        );
        setTimeout(() => {
          itemEl?.classList.remove(
            "ring-2",
            "ring-stockblue",
            "ring-offset-2",
            "ring-offset-white"
          );
        }, 1200);
      }

      // focus the title input
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    }
    prevLenRef.current = features.length;
  }, [features.length]);

  const handleIconChange = (index: number, nextIcon: string) => {
    // We only change the icon field; parent keeps the source of truth
    const next = features.map((f, i) => (i === index ? { ...f, icon: nextIcon } : f));
    onReorder(next);
  };

  // DnD handlers
  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === overIndex) return;

    const next = [...features];
    const draggedItem = next[draggedIndex];
    next.splice(draggedIndex, 1);
    next.splice(overIndex, 0, draggedItem);
    setDraggedIndex(overIndex);
    onReorder(next);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <section aria-label="features">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
          />
        ) : (
          <h2 className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
            {title}
          </h2>
        )}

        {isEditing && (
          <button
            onClick={onAdd}
            className="ml-3 mt-4 inline-flex items-center gap-1 text-stockblue hover:text-blue-700 font-semibold text-sm"
          >
            הוסף פיצ'ר
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
        {features.map((feature, index) => {
      const IconComponent = IconMap[feature.icon] || IconMap["כוכב"];


          return (
            <div
              key={index}
              ref={(el) => {
                if (el) itemRefs.current[index] = el;
              }}
              className={`relative bg-white/90 backdrop-blur-[8px] rounded-[14px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stockblue/8 transition-all duration-[250ms] ease-out hover:transform hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/96 ${
                isEditing ? "cursor-move" : ""
              } ${draggedIndex === index ? "opacity-50" : ""}`}
              draggable={isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {isEditing && features.length > 1 && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 z-10 p-1 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                  title="הסר פיצ'ר"
                >
                  <X size={16} />
                </button>
              )}

              {/* Icon bubble */}
              <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                <IconComponent size={22} />
              </div>

              {/* Icon selector (edit-only) */}
              {isEditing && (
                <div className="flex-shrink-0">
                  <select
                    value={feature.icon}
                    onChange={(e) => handleIconChange(index, e.target.value)}
                    className="text-xs font-semibold text-gray-800 mb-1 leading-[1.3] w-full border border-stockblue/30 rounded px-1 py-0.5 focus:outline-none focus:border-stockblue"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Content */}
              <div className="feature-content flex-1">
                {isEditing ? (
                  <>
                    <input
                      ref={(el) => {
                        if (el) titleInputRefs.current[index] = el;
                      }}
                      type="text"
                      value={feature.title}
                      onChange={(e) => onChange(index, "title", e.target.value)}
                      className="text-[1.1rem] font-bold text-gray-800 mb-1.5 leading-[1.3] w-full border border-stockblue/30 rounded px-2 py-1 focus:outline-none focus:border-stockblue"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => onChange(index, "description", e.target.value)}
                      className="text-[0.97rem] text-gray-600 leading-[1.6] w-full border-2 border-stockblue/30 rounded px-3 py-2 focus:outline-none focus:border-stockblue min-h-[80px]"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-[1.1rem] font-bold text-gray-800 m-0 mb-1.5 leading-[1.3]">
                      {feature.title}
                    </h3>
                    <p className="text-[0.97rem] text-gray-600 m-0 leading-[1.6]">
                      {feature.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
