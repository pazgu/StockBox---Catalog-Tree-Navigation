import React, { FC, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../../ui/accordion";
import {
  Plus,
  Folder,
  FolderPlus,
  GripVertical,
  Upload,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { UploadedFile } from "../../../../models/files.models";
interface AccordionSectionProps {
  isEditing: boolean;
  accordionData: any[];
  features: string[];
  folders: any[];
  draggedItem: any;
  showNewFolderInput: boolean;
  newFolderName: string;
  contentIconUrl: string; // Add this prop for content type icon
  bulletsIconUrl: string; // Add this prop for bullets type icon
  handleDragStart: (item: any) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (item: any) => void;
  setDraggedItem: (item: any) => void;
  handleAccordionTitleChange: (id: string, value: string) => void;
  handleAccordionContentChange: (id: string, value: string) => void;
  removeAccordion: (id: string) => void;
  addCustomAccordion: () => void;
  addFeature: () => void;
  removeFeature: (idx: number) => void;
  handleFeatureChange: (idx: number, value: string) => void;
  getFileIcon: (type: string) => React.ReactNode;
  handleFileUpload: (folderId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteFolder: (folderId: string) => void;
  handleDeleteFile: (folderId: string, fileId: string) => void;
  formatFileSize: (size: number) => string;
  setShowNewFolderInput: (value: boolean) => void;
  setNewFolderName: (value: string) => void;
  handleCreateFolder: () => void;
  confirmAddAccordion: (type: "content" | "bullets") => void;
  showAccordionTypeSelector: boolean;
  setShowAccordionTypeSelector: (value: boolean) => void;
}

const AccordionSection: FC<AccordionSectionProps> = ({
  isEditing,
  accordionData,
  features,
  folders,
  draggedItem,
  showNewFolderInput,
  newFolderName,
  contentIconUrl,
  bulletsIconUrl,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setDraggedItem,
  handleAccordionTitleChange,
  handleAccordionContentChange,
  removeAccordion,
  addCustomAccordion,
  addFeature,
  removeFeature,
  handleFeatureChange,
  getFileIcon,
  handleFileUpload,
  handleDeleteFolder,
  handleDeleteFile,
  formatFileSize,
  setShowNewFolderInput,
  setNewFolderName,
  handleCreateFolder,
  confirmAddAccordion,
  showAccordionTypeSelector,
  setShowAccordionTypeSelector,
}) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  return (
    <div className="lg:col-span-2 order-1 lg:order-2">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {accordionData.map((item) => (
          <AccordionItem
            key={item.uiId}
            value={item.uiId}
            className={`border-b border-gray-200/70 relative ${
              isEditing &&
              "p-2 border border-dashed border-gray-300 rounded-lg"
            }`}
            draggable={isEditing}
            onDragStart={() => handleDragStart(item)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(item)}
            onDragEnd={() => setDraggedItem(null)}
            style={{
              opacity: draggedItem && draggedItem.uiId === item.uiId ? 0.4 : 1,
            }}
          >
              {isEditing && (
              <div className="absolute -top-3 -right-3 z-10">
                <div className="w-10 h-10 rounded-full bg-[#fffaf1] shadow-lg border-2 border-[#F5E7C6] flex items-center justify-center overflow-hidden">
                  <img
                    src={item.type === "bullets" ? bulletsIconUrl : contentIconUrl}
                    alt={item.type === "bullets" ? "Bullets type" : "Content type"}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
            )}
            <AccordionTrigger className="w-full text-right text-lg font-semibold text-stockblue py-4 px-2 rounded-lg hover:bg-stockblue/5 transition-colors [&>svg]:text-stockblue">
              {isEditing && (
                <div className="flex items-center gap-2 ml-3 text-gray-500 cursor-grab">
                  <GripVertical size={18} className="cursor-grab" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeAccordion(item.uiId);
                    }}
                    className="text-black hover:text-gray-700 transition-colors font-bold"
                    title="הסר אקורדיון"
                  >
                    ✕
                  </button>
                </div>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleAccordionTitleChange(item.uiId, e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-lg font-semibold text-stockblue border-b border-gray-400 w-full text-right outline-none"
                />
              ) : (
                item.title
              )}
            </AccordionTrigger>

           <AccordionContent className="text-right text-base text-gray-700 leading-relaxed pb-6">
  {item.type === "bullets" ? (
    isEditing ? (
      <div className="space-y-2">
        {JSON.parse(item.content || "[]").map((bullet: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              onClick={() => {
                const bullets = JSON.parse(item.content || "[]");
                bullets.splice(idx, 1);
                handleAccordionContentChange(item.uiId, JSON.stringify(bullets));
              }}
              className="text-red-500 hover:text-red-700 px-2 py-1 rounded transition-all"
              title="מחק פריט"
            >
              ✕
            </button>
            <input
              type="text"
              value={bullet}
              onChange={(e) => {
                const bullets = JSON.parse(item.content || "[]");
                bullets[idx] = e.target.value;
                handleAccordionContentChange(item.uiId, JSON.stringify(bullets));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue"
              placeholder="פריט..."
            />
          </div>
        ))}
        <button
          onClick={() => {
            const bullets = JSON.parse(item.content || "[]");
            bullets.push("");
            handleAccordionContentChange(item.uiId, JSON.stringify(bullets));
          }}
          className="mt-2 px-3 py-1 bg-cyan-800 text-white rounded hover:bg-cyan-700 transition-all"
        >
          הוסף פריט
        </button>
      </div>
    ) : (
      <ul className="list-disc list-inside space-y-1 text-right">
        {JSON.parse(item.content || "[]").map((b: string, i: number) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    )
  ) : (
    <textarea
      value={item.content}
      onChange={(e) =>
        handleAccordionContentChange(item.uiId, e.target.value)
      }
      rows={3}
      className="w-full p-4 text-gray-700 text-sm bg-white/50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
    />
  )}
</AccordionContent>

          </AccordionItem>
        ))}
      </Accordion>

 {isEditing && (
  <div className="mt-4">
    {/* Always visible Add Accordion button */}
    <div
      onClick={() => setShowAccordionTypeSelector(true)}
      className="flex items-center justify-start gap-2 p-4 rounded-lg border border-dashed border-gray-300 text-stockblue hover:border-stockblue/50 hover:bg-stockblue/5 transition-all duration-300 cursor-pointer"
    >
      <Plus size={18} />
      <span className="font-medium">הוסף אקורדיון חדש</span>
    </div>

    {/* Only show type selector when the button is clicked */}
    {showAccordionTypeSelector && (
      <div className="p-4 bg-white border rounded-lg mt-2">
        <p className="mb-2">בחר סוג אקורדיון:</p>
        <div className="flex gap-2">
          <button
            onClick={() => confirmAddAccordion("content")}
            className="px-3 py-1 bg-[#D7C097] text-white rounded hover:bg-[#D7C097]/80 transition"
          >
              טקסט          
</button>
          <button
            onClick={() => confirmAddAccordion("bullets")}
            className="px-3 py-1 bg-[#547792] text-white rounded hover:bg-[#547792]/80 transition"
          >
            נקודות
          </button>
          <button
            onClick={() => setShowAccordionTypeSelector(false)}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            ביטול
          </button>
        </div>
      </div>
    )}
  </div>
)}


      {/* Files section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stockblue">קבצים ומסמכים</h2>
          {isEditing && (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stockblue text-white rounded-lg hover:bg-stockblue/90 transition-all duration-300"
            >
              <FolderPlus size={18} />
              תיקייה חדשה
            </button>
          )}
        </div>

        {showNewFolderInput && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="שם התיקייה..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue outline-none text-right"
              onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-cyan-800 text-white rounded-lg hover:bg-cyan-700 transition-all"
            >
              צור
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
            >
              ביטול
            </button>
          </div>
        )}

        <div className="space-y-4">
          {folders.map((folder) => (
            <details
              key={folder.uiId}
              className="border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 overflow-hidden"
            >
              <summary 
              className="flex items-center justify-between p-4 cursor-pointer list-none"
              onClick={(e) => e.preventDefault()}
            >
                <div className="flex items-center gap-3">
                  <Folder size={24} className="text-stockblue" />
                  <h3 className="font-semibold text-lg text-gray-800">
                    {folder.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({folder.files.length} קבצים)
                  </span>
                </div>
                {isEditing && (
              <div className="flex items-center gap-2">
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stockblue text-white rounded-lg hover:bg-stockblue/90 cursor-pointer transition-all text-sm"
                >
                  <Upload size={16} />
                  העלה קבצים
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(folder.uiId, e)}
                    className="hidden"
                  />
                </label>
                
                {folder.files.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const detailsElement = e.currentTarget.closest('details');
                    if (detailsElement) {
                      detailsElement.open = !detailsElement.open;
                      setOpenFolders(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(folder.uiId)) {
                          newSet.delete(folder.uiId);
                        } else {
                          newSet.add(folder.uiId);
                        }
                        return newSet;
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stockblue text-white rounded-lg hover:bg-stockblue/90 cursor-pointer transition-all text-sm"
                >
                  {openFolders.has(folder.uiId) ? 'הסתר קבצים' : 'צפה בקבצים'}
                </button>
              )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.uiId);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="מחק תיקייה"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </summary>

              <div className="p-4 pt-0 border-t border-gray-200">
                {folder.files.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {folder.files.map((file: UploadedFile) => (
                      <div
                        key={file.uiId}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type || "")}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium text-gray-800 truncate"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mr-2">
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-2 text-stockblue hover:bg-stockblue/10 rounded-lg transition-all"
                            title="הורד קובץ"
                          >
                            <Download size={18} />
                          </a>
                          {isEditing && (
                            <button
                              onClick={() =>
                                handleDeleteFile(folder.uiId, file.uiId)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="מחק קובץ"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    לא נמצאו קבצים בתיקייה זו
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>

        {folders.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין תיקיות עדיין. לחץ על "תיקייה חדשה" כדי להתחיל.
          </p>
        )}
      </div>
    </div>
  );
};

export default AccordionSection;
