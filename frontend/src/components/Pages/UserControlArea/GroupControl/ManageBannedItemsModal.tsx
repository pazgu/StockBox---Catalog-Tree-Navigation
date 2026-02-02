import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Search,
  X,
  Package,
  FolderTree,
  Settings,
  Lock,
  LockOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BannedItem } from "../../../../types/types";
import { permissionsService } from "../../../../services/permissions.service";
import { toast } from "sonner";
import InheritanceModal from "../../SharedComponents/DialogModal/DialogModal";

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
    "all",
  );
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [permissionIdByKey, setPermissionIdByKey] = useState<Record<string, string>>({});
  const [showInheritanceModal, setShowInheritanceModal] = useState(false);
  const [pendingUnblockItems, setPendingUnblockItems] = useState<BannedItem[]>([]);

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

  const load = useCallback(
    async (shouldNotify = false) => {
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
    },
    [groupId, onUpdateBannedItems],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filteredBannedItems = useMemo(() => {
    return localBannedItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterType === "all" || item.type === filterType),
    );
  }, [localBannedItems, searchQuery, filterType]);

  const availableItems = useMemo(() => {
    const bannedKeys = new Set(
      localBannedItems.map((i) => `${i.type}:${String(i.id)}`),
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
  const executeUnblock = async (items: BannedItem[], inheritToChildren: boolean) => {
    try {
      setIsLoading(true);
      const requestedItemIds = new Set(items.map(item => String(item.id)));    
      const result = await permissionsService.createPermissionsBatch(
        items.map(item => ({
          entityType: item.type,
          entityId: String(item.id),
          allowed: groupId,
          inheritToChildren,
        }))
      );
      const data = await permissionsService.getBlockedItemsForGroup(groupId);
      setPermissionIdByKey(data.permissionIdByKey);
      setAllItems([...data.blocked, ...data.available]);
      setLocalBannedItems(data.blocked);
      setSelectedItems(new Set());
      const afterBlockedIds = new Set(data.blocked.map((item: BannedItem) => String(item.id)));
      const stillBlockedRequestedItems = items.filter(item => 
        afterBlockedIds.has(String(item.id))
      );
      const actuallyUnblockedCount = items.length - stillBlockedRequestedItems.length;
      if (stillBlockedRequestedItems.length > 0) {
        if (actuallyUnblockedCount > 0) {
          const failedRequestedItems = result.data?.details?.failed?.filter((f: any) => 
            requestedItemIds.has(String(f.dto?.entityId))
          ) || [];
          const reason = failedRequestedItems[0]?.reason || "לא ניתן לשחרר חלק מהפריטים";
          toast.warning(
            `${actuallyUnblockedCount} פריטים שוחררו בהצלחה, ${stillBlockedRequestedItems.length} נכשלו. ${reason}`
          );
        } else {
          const failedRequestedItems = result.data?.details?.failed?.filter((f: any) => 
            requestedItemIds.has(String(f.dto?.entityId))
          ) || []; 
          if (failedRequestedItems[0]?.reason) {
            toast.error(failedRequestedItems[0].reason);
          } else {
            toast.error("לא ניתן לשחרר את הפריטים. ייתכן שקטגוריות אב חסומות");
          }
        }
      } else {
        const totalCreated = result.data?.created || items.length;
        const message = actuallyUnblockedCount === items.length 
          ? `${items.length} פריטים שוחררו בהצלחה${inheritToChildren && totalCreated > items.length ? ' (כולל צאצאים)' : ''}`
          : `${actuallyUnblockedCount} פריטים שוחררו בהצלחה`;
        toast.success(message);
      }
    } catch (e: any) {
      console.error("Bulk unblock failed:", e);
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("שגיאה בשחרור הפריטים");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async () => {
    const items = Array.from(selectedItems)
      .map((itemId) => {
        return activeTab === "banned"
          ? localBannedItems.find((i) => i.id === itemId)
          : availableItems.find((i) => i.id === itemId);
      })
      .filter((item): item is BannedItem => item !== undefined);

    if (activeTab === "banned") {
      const hasCategories = items.some(item => item.type === "category");
      if (hasCategories) {
        setPendingUnblockItems(items);
        setShowInheritanceModal(true);
      } else {
        await executeUnblock(items, false);
      }
    } else {
      const permissionIds = items
        .map((item) => {
          const key = keyOf(item.type, item.id);
          return permissionIdByKey[key];
        })
        .filter((id): id is string => !!id);

      if (permissionIds.length > 0) {
        try {
          setIsLoading(true);
          await permissionsService.deletePermissionsBatch(permissionIds);
          const data = await permissionsService.getBlockedItemsForGroup(groupId);
          setPermissionIdByKey(data.permissionIdByKey);
          setAllItems([...data.blocked, ...data.available]);
          setLocalBannedItems(data.blocked);
          setSelectedItems(new Set());
          toast.success(`${items.length} פריטים נחסמו בהצלחה`);
        } catch (e: any) {
          console.error("Bulk block failed:", e);
          toast.error("שגיאה בחסימת הפריטים");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto"
      onClick={() => {
        if (showInheritanceModal) return;
        onClose();
      }}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl shadow-2xl text-right flex flex-col my-auto"
        style={{ height: "570px" }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <Lock className="w-3 h-3" />
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
              <LockOpen className="w-3 h-3" />
              פריטים זמינים ({availableItems.length})
            </div>
          </button>
        </div>

        <div className="p-3 flex-1 flex flex-col overflow-hidden min-h-0">
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
                        ? "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                        : "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
                    }`}
                    title={
                      activeTab === "banned"
                        ? "שחרר פריטים נבחרים"
                        : "חסום פריטים נבחרים"
                    }
                  >
                    {activeTab === "banned" ? (
                      <LockOpen className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
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

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-slate-700 rounded-full animate-spin mb-2"></div>
              <p>טוען נתונים...</p>
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
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3.5 p-3">
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
                          <div
                            className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                              selectedItems.has(item.id)
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white/90 border-gray-300 group-hover:border-blue-400"
                            }`}
                          >
                            {selectedItems.has(item.id) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <img
                            src={
                              item.image || "/assets/images/default-product.jpg"
                            }
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
                            }}
                          />
                          <Link
                            to={`/permissions/${item.type}/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-1 left-1 px-1 py-1 bg-green-600 hover:bg-green-700 text-white text-[8px] font-bold rounded transition-all opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
                            title="נהל הרשאות"
                          >
                            <Settings className="w-2 h-2" />
                            הרשאות
                          </Link>

                          <div
                            className={`absolute bottom-0.5 right-0.5 px-1 py-0.5 ${getTypeColor(
                              item.type,
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
                        <div
                          className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                            selectedItems.has(item.id)
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white/90 border-gray-300 group-hover:border-blue-400"
                          }`}
                        >
                          {selectedItems.has(item.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <img
                          src={
                            item.image || "/assets/images/default-product.jpg"
                          }
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
                          }}
                        />
                        <Link
                          to={`/permissions/${item.type}/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-1 left-1 px-1 py-1 bg-green-600 hover:bg-green-700 text-white text-[8px] font-bold rounded transition-all opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
                          title="נהל הרשאות"
                        >
                          <Settings className="w-2 h-2" />
                          הרשאות
                        </Link>

                        <div
                          className={`absolute bottom-0.5 right-0.5 px-1 py-0.5 ${getTypeColor(
                            item.type,
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
     <InheritanceModal
  open={showInheritanceModal}
  onDismiss={() => {
    setShowInheritanceModal(false);
    setPendingUnblockItems([]);
  }}

  onDecline={() => {
    setShowInheritanceModal(false);

    const onlyCategories = pendingUnblockItems.filter(
      (item) => item.type === "category"
    );

    if (onlyCategories.length > 0) {
      executeUnblock(onlyCategories, false);
    } else {
      toast.info("לא נבחרו קטגוריות לשחרור");
    }

    setPendingUnblockItems([]);
  }}

  onConfirm={() => {
    setShowInheritanceModal(false);
    executeUnblock(pendingUnblockItems, true);
    setPendingUnblockItems([]);
  }}
/>

    </div>
  );
};

export default ManageBannedItemsModal;