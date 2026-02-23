import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Trash2,
  RotateCcw,
  PackageX,
  FolderX,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { recycleBinService } from "../../../../services/RecycleBinService";
import { RecycleBinItemDTO } from "../../../models/recycleBin.models";
import { Spinner } from "../../../ui/spinner";
import ImagePreviewHover from "../../ProductArea/ImageCarousel/ImageCarousel/ImagePreviewHover";
import { PathDisplay } from "../../SharedComponents/PathDisplay/PathDisplay";

type FilterType = "all" | "categories" | "products";

interface RecycleBinProps {}

export const RecycleBin: FC<RecycleBinProps> = () => {
  const [items, setItems] = useState<RecycleBinItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { role } = useUser();
  const navigate = useNavigate();

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] =
    useState(false);
  const [showEmptyBinModal, setShowEmptyBinModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecycleBinItemDTO | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  useEffect(() => {
    if (role !== undefined) {
      if (role === "editor") {
        loadRecycleBinItems();
      } else {
        setIsLoading(false);
      }
    }
  }, [role]);

  const loadRecycleBinItems = async () => {
    try {
      setIsLoading(true);
      const data = await recycleBinService.getRecycleBinItems();
      setItems(data);
    } catch (error) {
      toast.error("שגיאה בטעינת סל המיחזור");
      console.error("Error loading recycle bin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = (item: RecycleBinItemDTO) => {
    setSelectedItem(item);
    setShowRestoreModal(true);
  };

  const handlePermanentDeleteClick = (item: RecycleBinItemDTO) => {
    setSelectedItem(item);
    setShowPermanentDeleteModal(true);
  };

  const confirmRestore = async () => {
    if (!selectedItem) return;

    try {
      setIsRestoring(true);
      await recycleBinService.restoreItem({
        itemId: selectedItem._id,
        restoreChildren: selectedItem.itemType === "category",
      });

      await loadRecycleBinItems();
      toast.success(`"${selectedItem.itemName}" שוחזר בהצלחה!`);
      setShowRestoreModal(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("שגיאה בשחזור הפריט");
      console.error("Error restoring item:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      await recycleBinService.permanentlyDelete({
        itemId: selectedItem._id,
        deleteChildren: selectedItem.itemType === "category",
      });

      await loadRecycleBinItems();
      toast.success(`"${selectedItem.itemName}" נמחק לצמיתות`);
      setShowPermanentDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("שגיאה במחיקה לצמיתות");
      console.error("Error permanently deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEmptyBin = () => {
    setShowEmptyBinModal(true);
  };

  const confirmEmptyBin = async () => {
    try {
      setIsEmptying(true);
      const result = await recycleBinService.emptyRecycleBin();
      await loadRecycleBinItems();
      toast.success(
        `סל המיחזור רוקן - ${result.deletedCount} פריטים נמחקו לצמיתות`,
      );
      setShowEmptyBinModal(false);
    } catch (error) {
      toast.error("שגיאה בריקון סל המיחזור");
      console.error("Error emptying recycle bin:", error);
    } finally {
      setIsEmptying(false);
    }
  };

  const closeAllModals = () => {
    setShowRestoreModal(false);
    setShowPermanentDeleteModal(false);
    setShowEmptyBinModal(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">טוען סל מיחזור...</div>
      </div>
    );
  }

  if (role !== "editor") {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">
          רק עורכים יכולים לגשת לסל המיחזור
        </div>
      </div>
    );
  }

  const categoryItems = items.filter((x) => x.itemType === "category");
  const productItems = items.filter((x) => x.itemType === "product");
  const showCategories =
    activeFilter === "all" || activeFilter === "categories";
  const showProducts = activeFilter === "all" || activeFilter === "products";
  const hasItems = items.length > 0;

  return (
    <div
      className="mt-12 p-4 font-system direction-rtl text-right overflow-x-hidden"
      style={{ direction: "rtl" }}
    >
      <div className="text-right mt-16 mb-6">
        <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
          סל מיחזור
        </h2>
        <p className="text-slate-500 text-lg">
          פריטים שנמחקו - ניתן לשחזר או למחוק לצמיתות
        </p>
      </div>

      {/* Filter Buttons */}
      {hasItems && (
        <div className="flex justify-center gap-3 mb-8 flex-wrap mt-8">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "all"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            הכל ({items.length})
          </button>

          <button
            onClick={() => setActiveFilter("categories")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "categories"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            קטגוריות ({categoryItems.length})
          </button>

          <button
            onClick={() => setActiveFilter("products")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeFilter === "products"
                ? "bg-blue-950 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            מוצרים ({productItems.length})
          </button>

          {hasItems && (
            <button
              onClick={handleEmptyBin}
              className="px-6 py-2 rounded-full font-medium transition-all bg-red-600 text-white hover:bg-red-700 shadow-md"
            >
              רוקן סל מיחזור
            </button>
          )}
        </div>
      )}

      {!hasItems ? (
        <div className="w-full flex flex-col justify-center items-center my-12 text-slate-500">
          <Trash2 size={64} className="mb-4 text-slate-300" />
          <p className="text-lg">סל המיחזור ריק</p>
        </div>
      ) : (
        <>
          {/* Categories Section */}
          {showCategories && categoryItems.length > 0 && (
            <div className="mx-auto flex justify-center flex-wrap gap-10 my-12 px-4 sm:px-8">
              {categoryItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col items-center relative group"
                >
                  <div className="flex items-center justify-center relative">
                    <div className="relative opacity-60 hover:opacity-80 transition-opacity">
                      <img
                        src={item.itemImage}
                        alt={item.itemName}
                        className="w-44 h-44 object-cover rounded-full shadow-md mt-2 grayscale"
                      />

                      {/* Action Buttons */}
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                          <button
                            onClick={() => handleRestoreClick(item)}
                            className="peer h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition-all"
                            title="שחזור"
                          >
                            <RotateCcw size={20} />
                          </button>
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                            שחזור קטגוריה
                          </span>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => handlePermanentDeleteClick(item)}
                            className="peer h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all"
                            title="מחיקה לצמיתות"
                          >
                            <Trash2 size={20} />
                          </button>
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                            מחיקה לצמיתות
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="text-base text-slate-700 font-medium mt-2">
                    {item.itemName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.deletedAt).toLocaleDateString("he-IL")}
                  </span>
                  {item.childrenCount != null && item.childrenCount > 0 && (
                    <span className="text-xs text-orange-600 mt-1">
                      כולל {item.childrenCount} פריטי צאצא
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Products Section */}
          {showProducts && productItems.length > 0 && (
            <div className={activeFilter === "products" ? "mt-6" : "mt-16"}>
              {activeFilter === "all" && (
                <h3 className="text-3xl font-light text-slate-700 mb-6 tracking-tight">
                  מוצרים
                </h3>
              )}

              <main className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-24 my-12">
                {productItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col items-center p-5 text-center border-b-2 relative transition-all duration-300 border-gray-200 opacity-60 hover:opacity-80"
                  >
                    <div className="absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full">
                      <div className="flex flex-col items-center text-gray-500">
                        <PackageX />
                        <span>מוצר</span>
                      </div>
                    </div>

                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        onClick={() => handleRestoreClick(item)}
                        className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center hover:scale-110 transition-all duration-200"
                        title="שחזור מוצר"
                      >
                        <RotateCcw size={18} />
                      </button>

                      <button
                        onClick={() => handlePermanentDeleteClick(item)}
                        className="h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center hover:scale-110 transition-all duration-200"
                        title="מחיקה לצמיתות"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="h-36 w-full flex justify-center items-center p-5 rounded-none mr-2 grayscale pointer-events-none">
                      <ImagePreviewHover
                        images={item.productImages || [item.itemImage]}
                        alt={item.itemName}
                        className="h-32 w-32"
                      />
                    </div>

                    <div className="w-full text-center pt-4 border-t border-gray-200">
                      <h2 className="text-[1.1rem] text-[#0D305B] mb-2">
                        {item.itemName}
                      </h2>
                      <span className="text-xs text-slate-500 block">
                        נמחק ב-
                        {new Date(item.deletedAt).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  </div>
                ))}
              </main>
            </div>
          )}
        </>
      )}

      {/* Restore Modal */}
      {showRestoreModal && selectedItem && (
        <div
          className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <RotateCcw size={32} className="text-green-600" />
              </div>
            </div>

            <h4 className="m-0 mb-3 text-xl text-slate-700 font-semibold tracking-tight">
              שחזור פריט
            </h4>

            <p className="text-slate-700 mb-3">
              האם ברצונך לשחזר את{" "}
              {selectedItem.itemType === "category" ? "הקטגוריה" : "המוצר"} "
              {selectedItem.itemName}"?
            </p>

            {selectedItem.itemType === "category" &&
              (selectedItem.childrenCount! > 0 ||
                selectedItem.movedChildrenCount! > 0) && (
                <p className="text-blue-600 text-sm mb-4">
                  {selectedItem.childrenCount! > 0
                    ? `כולל ${selectedItem.childrenCount} פריטים בתוכה`
                    : `${selectedItem.movedChildrenCount} פריטים יוחזרו פנימה`}
                  <AlertTriangle size={16} className="inline mr-1" />
                </p>
              )}

            <p className="text-slate-500 text-sm mb-5">
  הפריט ישוחזר למיקום המקורי: <br />

            {selectedItem.allProductPaths?.length ? (
              selectedItem.allProductPaths.map((path, index) => (
                <code
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1"
                >
          <PathDisplay path={path} />           
     </code>
              ))
            ) : (
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                <PathDisplay path={selectedItem.originalPath} />
              </code>
            )}

            </p>


            <div className="flex flex-col gap-3 mt-5">
              <button
                onClick={confirmRestore}
                disabled={isRestoring}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md ${
                  isRestoring
                    ? "bg-green-400 cursor-not-allowed text-white"
                    : "bg-green-600 text-white hover:bg-green-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                }`}
              >
                {isRestoring ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-white" />
                    משחזר...
                  </span>
                ) : (
                  "שחזור"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isRestoring}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 ${
                  isRestoring
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                }`}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {showPermanentDeleteModal && selectedItem && (
        <div
          className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>

            <h4 className="m-0 mb-3 text-xl text-slate-700 font-semibold tracking-tight">
              מחיקה לצמיתות
            </h4>

            <p className="text-slate-700 mb-3 font-semibold">
              אזהרה: פעולה זו בלתי הפיכה!
            </p>

            <p className="text-slate-700 mb-3">
              האם אתה בטוח שברצונך למחוק לצמיתות את{" "}
              {selectedItem.itemType === "category" ? "הקטגוריה" : "המוצר"} "
              {selectedItem.itemName}"?
            </p>

            {selectedItem.itemType === "category" &&
              (selectedItem.childrenCount! > 0 ||
                selectedItem.movedChildrenCount! > 0) && (
                <p className="text-red-600 text-sm mb-4 font-semibold">
                  {selectedItem.childrenCount! > 0
                    ? `גם ${selectedItem.childrenCount} הפריטים שבתוכה יימחקו לצמיתות מכל המערכת!`
                    : `אזהרה: ${selectedItem.movedChildrenCount} פריטים נמצאים כעת מחוץ לקטגוריה זו`}
                  <AlertTriangle size={16} className="inline mr-1" />
                </p>
              )}

            <div className="flex flex-col gap-3 mt-5">
              <button
                onClick={confirmPermanentDelete}
                disabled={isDeleting}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed text-white"
                    : "bg-red-600 text-white hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-white" />
                    מוחק...
                  </span>
                ) : (
                  "מחיקה לצמיתות"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isDeleting}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 ${
                  isDeleting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                }`}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Bin Modal */}
      {showEmptyBinModal && (
        <div
          className="fixed inset-0 bg-slate-800 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          onClick={closeAllModals}
        >
          <div
            className="bg-white p-8 rounded-xl w-96 max-w-[90%] shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={32} className="text-red-600" />
              </div>
            </div>

            <h4 className="m-0 mb-3 text-xl text-slate-700 font-semibold tracking-tight">
              ריקון סל המיחזור
            </h4>

            <p className="text-slate-700 mb-3 font-semibold">
              אזהרה: פעולה זו בלתי הפיכה!
            </p>

            <p className="text-slate-700 mb-5">
              האם אתה בטוח שברצונך למחוק לצמיתות את כל {items.length} הפריטים
              בסל המיחזור?
            </p>

            <div className="flex flex-col gap-3 mt-5">
              <button
                onClick={confirmEmptyBin}
                disabled={isEmptying}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 shadow-md ${
                  isEmptying
                    ? "bg-red-400 cursor-not-allowed text-white"
                    : "bg-red-600 text-white hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
                }`}
              >
                {isEmptying ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-white" />
                    מרוקן...
                  </span>
                ) : (
                  "רוקן סל מיחזור"
                )}
              </button>

              <button
                onClick={closeAllModals}
                disabled={isEmptying}
                className={`w-full p-3 border-none rounded-lg text-base font-medium transition-all duration-200 ${
                  isEmptying
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
                }`}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;
