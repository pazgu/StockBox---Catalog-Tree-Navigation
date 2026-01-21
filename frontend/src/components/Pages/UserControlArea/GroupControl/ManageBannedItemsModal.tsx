import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Plus,
  Trash2,
  Package,
  FolderTree,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categoriesService } from "../../../../services/CategoryService";
import { groupService } from "../../../../services/GroupService";
import { BannedItem, BannedEntityType } from "../../../../types/types";
import { permissionsService } from "../../../../services/permissions.service";
import { toast } from "sonner";

interface ManageBannedItemsModalProps {
  groupId: string;
  groupName: string;
  bannedItems: BannedItem[];
  onClose: () => void;
  onUpdateBannedItems: (items: BannedItem[]) => void;
}



const ManageBannedItemsModal: React.FC<ManageBannedItemsModalProps> = ({
  groupId,
  groupName,
  bannedItems,
  onClose,
  onUpdateBannedItems,
}) => {
  const [localBannedItems, setLocalBannedItems] =
    useState<BannedItem[]>(bannedItems);
  const [allItems, setAllItems] = useState<BannedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"banned" | "available">("banned");
  const [filterType, setFilterType] = useState<"all" | "product" | "category">(
    "all"
  );
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [permissionIdByKey, setPermissionIdByKey] = useState<
    Record<string, string>
  >({});

  const keyOf = (type: "product" | "category", id: string | number) =>
    `${type}:${String(id)}`;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getItemIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="w-3 h-3" />;
      case "category":
        return <FolderTree className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "מוצר";
      case "category":
        return "קטגוריה";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-500";
      case "category":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const load = useCallback(async (shouldNotify = false) => {
  try {
    setIsLoading(true);

    const data = await permissionsService.getBlockedItemsForGroup(groupId);
    setPermissionIdByKey(data.permissionIdByKey);
    setAllItems([...data.blocked, ...data.available]);
    setLocalBannedItems(data.blocked);
    if (shouldNotify) {
      onUpdateBannedItems(data.blocked);
    }
  } catch (e) {
    console.error("Failed loading modal data:", e);
  } finally {
    setIsLoading(false);
  }
}, [groupId, onUpdateBannedItems]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredBannedItems = useMemo(() => {
    return localBannedItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterType === "all" || item.type === filterType)
    );
  }, [localBannedItems, searchQuery, filterType]);

  const availableItems = useMemo(() => {
    const bannedKeys = new Set(
      localBannedItems.map((i) => `${i.type}:${String(i.id)}`)
    );

    return allItems.filter((item) => {
      const key = `${item.type}:${String(item.id)}`;
      return (
        !bannedKeys.has(key) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterType === "all" || item.type === filterType)
      );
    });
  }, [allItems, localBannedItems, searchQuery, filterType]);

  const handleRemoveItem = async (item: BannedItem) => {
    try {
      setIsLoading(true);

      await permissionsService.createPermission(item.type, String(item.id), groupId);

      await load(true);
      toast.success(`הפריט "${item.name}" שוחרר בהצלחה`);
    } catch (e: any) {
      if (e.response?.status === 400) {
        toast.error(e.response?.data?.message || "לא ניתן לשחרר פריט זה");
      } else {
        toast.error("שגיאה בשחרור הפריט");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (item: BannedItem) => {
    const key = keyOf(item.type, item.id);
    const permId = permissionIdByKey[key];

    try {
      setIsLoading(true);
      if (permId) {
        await permissionsService.deletePermission(permId);
      }

      await load(true);
      setSearchQuery("");
    } catch (e) {
      console.error("Failed to block:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (itemId: string | number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const currentItems =
      activeTab === "banned" ? filteredBannedItems : availableItems;
    const allIds = currentItems.map((item) => item.id);

    if (selectedItems.size === currentItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(allIds));
  };

  const handleBulkAction = async () => {
    setIsLoading(true);
    try {
      const promises = Array.from(selectedItems).map(async (itemId) => {
        const item = activeTab === "banned" 
          ? localBannedItems.find(i => i.id === itemId)
          : availableItems.find(i => i.id === itemId);
        
        if (!item) return;
        
        if (activeTab === "banned") {
          await permissionsService.createPermission(item.type, String(item.id), groupId);
        } else {
          const key = keyOf(item.type, item.id);
          const permId = permissionIdByKey[key];
          if (permId) {
            await permissionsService.deletePermission(permId);
          }
        }
      });
      await Promise.all(promises);
      await load(true);
      setSelectedItems(new Set());
    } catch (e) {
      console.error("Bulk action failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl shadow-2xl text-right flex flex-col my-auto"
        style={{ height: "570px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-700 text-white p-5 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              ניהול פריטים חסומים
            </h3>
            <p className="text-slate-300 text-xs">קבוצה: {groupName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab("banned");
              scrollContainerRef.current &&
                (scrollContainerRef.current.scrollTop = 0);
            }}
            className={`flex-1 py-2.5 px-4.5 text-sm font-medium transition-all ${
              activeTab === "banned"
                ? "text-slate-700 bg-white border-b-2 border-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Trash2 className="w-3 h-3" />
              פריטים חסומים ({filteredBannedItems.length})
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("available");
              scrollContainerRef.current &&
                (scrollContainerRef.current.scrollTop = 0);
            }}
            className={`flex-1 py-2.5 px-4.5 text-sm font-medium transition-all ${
              activeTab === "available"
                ? "text-slate-700 bg-white border-b-2 border-green-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />
              הוסף חסימה ({availableItems.length})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder={
                activeTab === "banned"
                  ? "חפש בפריטים חסומים..."
                  : "חפש פריטים להוספה..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-7 pl-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-3 mb-2 flex-wrap flex-shrink-0">
            <button
              onClick={() => setFilterType("all")}
              className={`px-8 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                filterType === "all"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              הכל
            </button>

            <button
              onClick={() => setFilterType("product")}
              className={`px-8 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-0.5 transition-all ${
                filterType === "product"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Package className="w-2.5 h-2.5" />
              מוצרים
            </button>

            <button
              onClick={() => setFilterType("category")}
              className={`px-8 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-0.5 transition-all ${
                filterType === "category"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FolderTree className="w-2.5 h-2.5" />
              קטגוריות
            </button>
          </div>

          {/* Bulk */}
          {((activeTab === "banned" && filteredBannedItems.length > 0) ||
            (activeTab === "available" && availableItems.length > 0)) && (
            <div className="flex gap-1 mb-2 items-center bg-gray-50 p-1 rounded-md flex-shrink-0">
              <button
                onClick={handleSelectAll}
                className="py-1 px-5 rounded-md text-[11px] font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
              >
                {selectedItems.size ===
                (activeTab === "banned"
                  ? filteredBannedItems.length
                  : availableItems.length)
                  ? "בטל הכל"
                  : "בחר הכל"}
              </button>

              {selectedItems.size > 0 && (
                <>
                  <span className="text-[11px] text-gray-500 bg-white px-2 py-0.5 rounded">
                    {selectedItems.size} נבחרו
                  </span>
                  <button
                    onClick={handleBulkAction}
                    disabled={isLoading}
                    className={`py-1 px-3 rounded-md text-[11px] font-medium transition-all shadow-sm hover:shadow-md ${
                      activeTab === "banned"
                        ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
                        : "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                    }`}
                  >
                    {activeTab === "banned" ? "הסר" : "הוסף"}
                  </button>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    disabled={isLoading}
                    className="py-1 px-3 rounded-md text-[11px] font-medium bg-gray-400 text-white hover:bg-gray-500 disabled:bg-gray-300 transition-all shadow-sm hover:shadow-md"
                  >
                    בטל בחירה
                  </button>
                </>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              טוען נתונים...
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto min-h-0 pr-1"
            >
              {activeTab === "banned" ? (
                filteredBannedItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-bold text-gray-700 text-sm">
                      {searchQuery
                        ? "לא נמצאו פריטים תואמים"
                        : "אין פריטים חסומים"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1.5">
                    {filteredBannedItems.map((item) => (
                      <div
                        key={`${item.type}:${item.id}`}
                        className={`group relative rounded overflow-hidden transition-all cursor-pointer ${
                          selectedItems.has(item.id)
                            ? "ring-2 ring-blue-500 shadow-md"
                            : "hover:shadow-md shadow-sm"
                        }`}
                        onClick={() => handleToggleSelection(item.id)}
                      >
                        <div className="relative w-full h-24 bg-gray-100 overflow-hidden">
                          <div className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                            selectedItems.has(item.id)
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white/90 border-gray-300 group-hover:border-blue-400"
                          }`}>
                            {selectedItems.has(item.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>                
                          <img
                            src={
                              item.image || "/assets/images/default-product.jpg"
                            }
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item);
                            }}
                            className="absolute top-1 left-1 p-1 bg-white/90 text-gray-700 hover:text-white hover:bg-red-500 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="הסר חסימה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/permissions?item=${item.id}&type=${item.type}`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-1 left-1 px-1 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[8px] font-bold rounded transition-all opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
                            title="נהל הרשאות"
                          >
                            <Settings className="w-2 h-2" />
                            הרשאות
                          </Link>

                          <div
                            className={`absolute bottom-0.5 right-0.5 px-1 py-0.5 ${getTypeColor(
                              item.type
                            )} text-white text-[7px] font-bold rounded-full flex items-center gap-0.5`}
                          >
                            {getItemIcon(item.type)}
                            <span>{getItemTypeLabel(item.type)}</span>
                          </div>
                        </div>
                        <div className="p-1.5 bg-white">
                          <h4 className="font-semibold text-gray-800 text-[10px] line-clamp-2 text-center leading-tight">
                            {item.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : availableItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-bold text-gray-700 text-sm">
                    {searchQuery
                      ? "לא נמצאו פריטים תואמים"
                      : "כל הפריטים כבר חסומים"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1.5">
                  {availableItems.map((item) => (
                    <div
                      key={`${item.type}:${item.id}`}
                      className={`group relative rounded overflow-hidden transition-all cursor-pointer ${
                        selectedItems.has(item.id)
                          ? "ring-2 ring-blue-500 shadow-md"
                          : "hover:shadow-md shadow-sm"
                      }`}
                      onClick={() => handleToggleSelection(item.id)}
                    >
                      <div className="relative w-full h-24 bg-gray-100 overflow-hidden">
                        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                          selectedItems.has(item.id)
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white/90 border-gray-300 group-hover:border-blue-400"
                        }`}>
                          {selectedItems.has(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <img
                          src={
                            item.image || "/assets/images/default-product.jpg"
                          }
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddItem(item);
                          }}
                          className="absolute top-1 left-1 p-1 bg-white/90 text-gray-700 hover:text-white hover:bg-green-500 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="הוסף לחסימה"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          to={`/permissions?item=${item.id}&type=${item.type}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-1 left-1 px-1 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[8px] font-bold rounded transition-all opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
                          title="נהל הרשאות"
                        >
                          <Settings className="w-2 h-2" />
                          הרשאות
                        </Link>

                        <div
                          className={`absolute bottom-0.5 right-0.5 px-1 py-0.5 ${getTypeColor(
                            item.type
                          )} text-white text-[7px] font-bold rounded-full flex items-center gap-0.5`}
                        >
                          {getItemIcon(item.type)}
                          <span>{getItemTypeLabel(item.type)}</span>
                        </div>
                      </div>
                      <div className="p-1.5 bg-white">
                        <h4 className="font-semibold text-gray-800 text-[10px] line-clamp-2 text-center leading-tight">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageBannedItemsModal;