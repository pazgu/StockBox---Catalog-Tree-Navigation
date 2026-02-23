import React, { FC, useEffect, useRef, useState } from "react";
import { Plus, Star, X, Check } from "lucide-react";

type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type IconOption = { value: string; label: string };

type IconMapType = { [key: string]: FC<{ size?: number }> };

type FieldKind =
  | "sectionTitle"
  | "introContent"
  | "paragraphContent"
  | "featuresTitle"
  | "bulletsTitle"
  | "featureTitle"
  | "featureCard"
  | "featureDescription"
  | "featureIcon"
  | "bulletText";

interface FeaturesSectionProps {
  isEditing: boolean;

  sectionId: string;
  mkKey: (kind: FieldKind, sectionId: string, itemId?: string) => string;

  title: string;
  onChangeTitle: (val: string) => void;

  features: Feature[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "title" | "description" | "icon", value: string) => void;
  onReorder: (next: Feature[]) => void;

  iconOptions: IconOption[];
  IconMap: IconMapType;

  isDirty: (key: string) => boolean;
  markDirty: (key: string, currentValue: string) => void;
  confirmField: (key: string, currentValue: string) => void;

  hasUnconfirmedChanges: boolean;
}

const FeaturesSection: FC<FeaturesSectionProps> = ({
  isEditing,
  sectionId,
  mkKey,

  title,
  onChangeTitle,

  features,
  onAdd,
  onRemove,
  onChange,
  onReorder,

  iconOptions,
  IconMap,

  isDirty,
  markDirty,
  confirmField,
  hasUnconfirmedChanges,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const itemRefs = useRef<HTMLDivElement[]>([]);
  const titleInputRefs = useRef<HTMLInputElement[]>([]);
  const prevLenRef = useRef<number>(features.length);

  useEffect(() => {
    itemRefs.current.length = features.length;
    titleInputRefs.current.length = features.length;
  }, [features.length]);

  useEffect(() => {
    if (features.length > prevLenRef.current) {
      const newIndex = features.length - 1;
      const itemEl = itemRefs.current[newIndex];
      const inputEl = titleInputRefs.current[newIndex];

      if (itemEl) {
        itemEl.scrollIntoView({ behavior: "smooth", block: "center" });
        itemEl.classList.add("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white");
        setTimeout(() => {
          itemEl?.classList.remove("ring-2", "ring-stockblue", "ring-offset-2", "ring-offset-white");
        }, 1200);
      }

      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    }
    prevLenRef.current = features.length;
  }, [features.length]);

  const getCardValue = (f: Feature) =>
    JSON.stringify({
      title: f.title ?? "",
      description: f.description ?? "",
      icon: f.icon ?? "",
    });

  const handleAddClick = () => {
    if (hasUnconfirmedChanges) return;
    onAdd();
  };

  const handleDragStart = (index: number) => {
    if (hasUnconfirmedChanges) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (hasUnconfirmedChanges) return;
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
      <div className="flex items-center justify-between mb-4">
        {(() => {
          const key = mkKey("featuresTitle", sectionId);

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
                className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 pb-1.5 inline-block w-full border border-stockblue/30 rounded px-3 py-1 focus:outline-none focus:border-stockblue"
              />

              {isDirty(key) && (
                <button
                  type="button"
                  onClick={() => confirmField(key, title)}
                  className="h-10 w-10 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center flex-shrink-0"
                  title="אשר שינוי"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ) : (
            <h2 className="text-[1.8rem] text-stockblue my-6 mb-4 font-bold border-b-2 border-stockblue/15 pb-1.5 inline-block">
              {title}
            </h2>
          );
        })()}

        {isEditing && (
          <button
            onClick={handleAddClick}
            disabled={hasUnconfirmedChanges}
            className={`ml-3 mt-4 inline-flex items-center gap-1 font-semibold text-sm ${
              hasUnconfirmedChanges
                ? "text-gray-400 cursor-not-allowed"
                : "text-stockblue hover:text-blue-700"
            }`}
            title={hasUnconfirmedChanges ? "יש לאשר שינויים (✓) לפני הוספת פיצ'ר" : "הוסף פיצ'ר"}
          >
            הוסף פיצ'ר
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-8">
        {features.map((feature, index) => {
          const cardKey = mkKey("featureCard", sectionId, feature.id);
          const IconComponent = IconMap[feature.icon] ?? IconMap["כוכב"] ?? Star;

          return (
            <div
              key={feature.id}
              ref={(el) => {
                if (el) itemRefs.current[index] = el;
              }}
              className={`relative bg-white/90 backdrop-blur-[8px] rounded-[14px] p-5 flex items-start gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stockblue/8 transition-all duration-[250ms] ease-out hover:transform hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/96 ${
                isEditing ? "cursor-move" : ""
              } ${draggedIndex === index ? "opacity-50" : ""}`}
              draggable={isEditing && !hasUnconfirmedChanges}
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

              {isEditing ? (
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                    <IconComponent size={22} />
                  </div>
                  <select
                    value={feature.icon}
                    onChange={(e) => {
                      const nextIcon = e.target.value;
                      onChange(index, "icon", nextIcon);

                      const nextValue = JSON.stringify({
                        title: feature.title ?? "",
                        description: feature.description ?? "",
                        icon: nextIcon,
                      });
                      markDirty(cardKey, nextValue);
                    }}
                    className="text-xs font-semibold text-gray-800 leading-[1.3] w-full border border-stockblue/30 rounded px-1 py-0.5 focus:outline-none focus:border-stockblue"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-stockblue text-white w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(13,48,91,0.25)]">
                  <IconComponent size={22} />
                </div>
              )}

              <div className="feature-content flex-1">
                {isEditing ? (
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        ref={(el) => {
                          if (el) titleInputRefs.current[index] = el;
                        }}
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const nextTitle = e.target.value;
                          onChange(index, "title", nextTitle);

                          const nextValue = JSON.stringify({
                            title: nextTitle,
                            description: feature.description ?? "",
                            icon: feature.icon ?? "",
                          });
                          markDirty(cardKey, nextValue);
                        }}
                        className="text-[1.1rem] font-bold text-gray-800 mb-1.5 leading-[1.3] w-full border border-stockblue/30 rounded px-2 py-1 focus:outline-none focus:border-stockblue"
                      />

                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const nextDesc = e.target.value;
                          onChange(index, "description", nextDesc);

                          const nextValue = JSON.stringify({
                            title: feature.title ?? "",
                            description: nextDesc,
                            icon: feature.icon ?? "",
                          });
                          markDirty(cardKey, nextValue);
                        }}
                        className="text-[0.97rem] text-gray-600 leading-[1.6] w-full border-2 border-stockblue/30 rounded px-3 py-2 focus:outline-none focus:border-stockblue min-h-[80px]"
                      />
                    </div>

                    {isDirty(cardKey) && (
                      <button
                        type="button"
                        onClick={() => confirmField(cardKey, getCardValue(feature))}
                        className="mt-1 h-9 w-9 rounded-full border border-green-600 text-green-700 hover:bg-green-50 grid place-items-center flex-shrink-0"
                        title="אשר שינוי"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
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