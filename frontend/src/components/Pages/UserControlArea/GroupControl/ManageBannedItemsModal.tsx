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
  Lock,
  LockOpen,
  ChevronDown,
  ChevronUp,
  List,
  GitBranch,
} from "lucide-react";
import { BannedItem } from "../../../../types/types";
import { permissionsService } from "../../../../services/permissions.service";
import { toast } from "sonner";
import { Toaster } from "sonner";
import InheritanceModal from "../../SharedComponents/DialogModal/DialogModal";
import { usePath } from "../../../../context/PathContext";
import TreeNode from "../GroupControl/TreeNode";
interface TreeItem extends BannedItem {
  children?: TreeItem[];
  products?: TreeItem[];
  image: string;
  groupId: string;
  contextPath?: string;
}
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
  const [unifiedTree, setUnifiedTree] = useState<TreeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"banned" | "available">("banned");
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [filterType, setFilterType] = useState<"all" | "product" | "category">(
    "all",
  );
  const [selectedItems, setSelectedItems] = useState<
    Map<string | number, string | undefined>
  >(new Map());
  const [selectedWithChildren, setSelectedWithChildren] = useState<
    Set<string | number>
  >(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [permissionIdByKey, setPermissionIdByKey] = useState<
    Record<string, string>
  >({});
  const [showInheritanceModal, setShowInheritanceModal] = useState(false);
  const [pendingUnblockItems, setPendingUnblockItems] = useState<BannedItem[]>(
    [],
  );
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const { setPreviousPath, previousPath } = usePath();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number>(0);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCardWidth(entry.contentRect.width - 32);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const keyOf = (type: "product" | "category", id: string | number) =>
    `${type}:${String(id)}`;

  const load = useCallback(
    async (shouldNotify = false) => {
      try {
        setIsLoading(true);
        const data = await permissionsService.getBlockedItemsForGroup(groupId);
        const addStatusToTree = (nodes: any[], status: boolean): any[] => {
          return nodes.map((node) => ({
            ...node,
            isBlocked: status,
            children: node.children
              ? addStatusToTree(node.children, status)
              : [],
            products: node.products
              ? node.products.map((p: any) => ({ ...p, isBlocked: status }))
              : [],
          }));
        };
        const taggedBlockedTree = addStatusToTree(data.blockedTree || [], true);
        const taggedAvailableTree = addStatusToTree(
          data.availableTree || [],
          false,
        );
        const unifiedTree = [...taggedBlockedTree, ...taggedAvailableTree];
        setUnifiedTree(data.fullTree || []);
        setPermissionIdByKey(data.permissionIdByKey);
        setLocalBannedItems(data.blocked || []);
        const enrichWithContextPath = (items: BannedItem[]): BannedItem[] => {
          return items.map((item) => {
            if (item.type === "product" && item.productPath) {
              const pathStr = Array.isArray(item.productPath)
                ? item.productPath[0]
                : item.productPath;
              if (!pathStr) return item;
              const pathParts = pathStr.split("/").filter(Boolean);
              const categoryParts =
                pathParts[0] === "categories"
                  ? pathParts.slice(1, -1)
                  : pathParts.slice(0, -1);
              const contextPath = "/categories/" + categoryParts.join("/");
              return { ...item, contextPath };
            }
            return item;
          });
        };

        const enrichedBlocked = enrichWithContextPath(data.blocked).map(
          (i) => ({ ...i, isBlocked: true }),
        );
        const enrichedAvailable = enrichWithContextPath(data.available).map(
          (i) => ({ ...i, isBlocked: false }),
        );

        setAllItems([...enrichedBlocked, ...enrichedAvailable]);
        setLocalBannedItems(enrichedBlocked);

        if (shouldNotify) {
          onUpdateBannedItems(enrichedBlocked);
        }
      } catch (e) {
        toast.error("שגיאה בטעינת נתונים");
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

  const filterTree = useCallback(
    (nodes: TreeItem[], query: string): TreeItem[] => {
      if (!query) return nodes;
      const filtered: TreeItem[] = [];
      nodes.forEach((node) => {
        const matchesSearch = node.name
          .toLowerCase()
          .includes(query.toLowerCase());
        const filteredChildren = node.children
          ? filterTree(node.children, query)
          : [];
        const filteredProducts =
          node.products?.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase()),
          ) || [];
        if (
          matchesSearch ||
          filteredChildren.length > 0 ||
          filteredProducts.length > 0
        ) {
          filtered.push({
            ...node,
            children: filteredChildren,
            products: filteredProducts,
          });
        }
      });
      return filtered;
    },
    [],
  );
  const filteredTree = useMemo(() => {
    if (!searchQuery) return unifiedTree;
    return filterTree(unifiedTree, searchQuery);
  }, [unifiedTree, searchQuery, filterTree]);

  const handleToggleSelection = (
  itemId: string | number,
  withChildren: boolean,
  contextPath?: string,
) => {
if (withChildren) {
  const isCurrentlySelected = selectedWithChildren.has(itemId);
  setSelectedWithChildren((prev) => {
    const newSet = new Set(prev);
    if (isCurrentlySelected) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    return newSet;
  });
  setSelectedItems((prev) => {
    const newMap = new Map(prev);
    if (isCurrentlySelected) {
      newMap.delete(itemId);
    } else {
      const descendants = getAllDescendants(itemId, unifiedTree);
      descendants.forEach((d) => newMap.delete(d.id));
      newMap.set(itemId, contextPath);
    }
    return newMap;
  });
} else {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(itemId)) {
        newMap.delete(itemId);
        setSelectedWithChildren((prevChildren) => {
          const newChildren = new Set(prevChildren);
          newChildren.delete(itemId);
          return newChildren;
        });
      } else {
        newMap.set(itemId, contextPath);
      }
      return newMap;
    });
  }
};
  const handleToggleExpand = (nodeId: string | number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string | number>();
    const collectIds = (nodes: TreeItem[]) => {
      nodes.forEach((node) => {
        if (
          (node.children?.length ?? 0) > 0 ||
          (node.products?.length ?? 0) > 0
        ) {
          allNodeIds.add(node.id);
        }
        if (node.children) collectIds(node.children);
      });
    };

    collectIds(filteredTree);
    setExpandedNodes(allNodeIds);
  };
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };
  const handleSelectAll = () => {
    const currentItems =
      viewMode === "tree"
        ? allItems
        : activeTab === "banned"
          ? filteredBannedItems
          : availableItems;

    if (selectedItems.size >= currentItems.length && selectedItems.size > 0) {
      setSelectedItems(new Map());
      setSelectedWithChildren(new Set());
    } else {
      const newMap = new Map<string | number, string | undefined>();
      currentItems.forEach((item) => {
        newMap.set(item.id, item.contextPath);
      });
      setSelectedItems(newMap);
    }
  };

  const allCurrentSelected = (() => {
    const currentItems =
      viewMode === "tree"
        ? allItems
        : activeTab === "banned"
          ? filteredBannedItems
          : availableItems;
    return (
      currentItems.length > 0 &&
      currentItems.every((item) => selectedItems.has(item.id))
    );
  })();
  const getAllDescendants = useCallback((nodeId: string | number, nodes: TreeItem[]): TreeItem[] => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      const descendants: TreeItem[] = [];
      const collect = (n: TreeItem) => {
        (n.children || []).forEach((child) => { descendants.push(child); collect(child); });
        (n.products || []).forEach((p) => descendants.push(p));
      };
      collect(node);
      return descendants;
    }
    const found = getAllDescendants(nodeId, node.children || []);
    if (found.length > 0) return found;
  }
  return [];
}, []);
const selectedItemsStatus = useMemo(() => {
  let hasBlocked = Array.from(selectedItems.keys()).some((id) =>
    localBannedItems.some((i) => i.id === id)
  );
  let hasAvailable = Array.from(selectedItems.keys()).some((id) =>
    availableItems.some((i) => i.id === id)
  );

  selectedWithChildren.forEach((id) => {
    const descendants = getAllDescendants(id, unifiedTree);
    if (descendants.some((d) => localBannedItems.some((b) => b.id === d.id))) hasBlocked = true;
    if (descendants.some((d) => availableItems.some((a) => a.id === d.id))) hasAvailable = true;
  });

  return { hasBlocked, hasAvailable };
}, [selectedItems, selectedWithChildren, localBannedItems, availableItems, unifiedTree, getAllDescendants]);

  const executeUnblock = async (
    items: BannedItem[],
    inheritToChildren: boolean,
  ) => {
    try {
      setIsLoading(true);
      const itemsWithContext = items.map((item) => {
        if (item.type === "product") {
          if (!item.contextPath && item.productPath) {
            const pathStr = Array.isArray(item.productPath)
              ? item.productPath[0]
              : item.productPath;
            if (pathStr) {
              const pathParts = pathStr.split("/").filter(Boolean);
              const categoryParts =
                pathParts[0] === "categories"
                  ? pathParts.slice(1, -1)
                  : pathParts.slice(0, -1);
              item.contextPath = "/categories/" + categoryParts.join("/");
            }
          }
        }
        return item;
      });
const categoryItems = itemsWithContext.filter((i) => i.type === "category");
const nonCategoryItems = itemsWithContext.filter((i) => i.type !== "category");

if (categoryItems.length > 0) {
  await permissionsService.createPermissionsBatch(
    categoryItems.map((item) => ({
      entityType: item.type,
      entityId: String(item.id),
      allowed: groupId,
      inheritToChildren,
      contextPath: item.contextPath,
    }))
  );
}

const result = nonCategoryItems.length > 0
  ? await permissionsService.createPermissionsBatch(
      nonCategoryItems.map((item) => ({
        entityType: item.type,
        entityId: String(item.id),
        allowed: groupId,
        inheritToChildren,
        contextPath: item.contextPath,
      }))
    )
  : { data: { details: { failed: [], created: categoryItems } } };
      const failedItems = result.data?.details?.failed || [];
      const createdItems = result.data?.details?.created || [];
      if (failedItems.length > 0 && createdItems.length === 0) {
        const firstError = failedItems[0]?.reason || "לא ניתן לשחרר את הפריטים";
        toast.error(firstError);
        await load(false);
        setSelectedItems(new Map());
        setSelectedWithChildren(new Set());
        return;
      }
      if (failedItems.length > 0) {
        type FailedItem = {
          dto: {
            entityId: string;
            entityType?: string;
            allowed?: string;
            inheritToChildren?: boolean;
          };
          reason?: string;
        };

        const names: Record<string, string> = {};
        await Promise.all(
          failedItems.map(async (f: FailedItem) => {
            const details = await permissionsService.getEntityDetails(
              f.dto.entityType as "category" | "product",
              f.dto.entityId,
            );
            names[f.dto.entityId] = details.name;
          }),
        );

        toast.warning(
          <div >
            <div>
              {createdItems.length} פריטים שוחררו, {failedItems.length} נכשלו
            </div>

            <details className="mt-2">
              <summary className="cursor-pointer">הצג פרטים</summary>

              <ul className="max-h-[150px] overflow-y-auto mt-1 pl-4">
                {failedItems.map((f: FailedItem, i: number) => (
                  <li key={i} className="mb-1">
                    <span className="font-semibold">
                      {names[f.dto.entityId] ?? f.dto.entityId}
                    </span>

                    {f.reason && (
                      <div className="text-amber-700 text-xs mt-0.5">
                        {f.reason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </div>,
        );
        await load(true);
        setSelectedItems(new Map());
        setSelectedWithChildren(new Set());
        return;
      } else {
        toast.success("פריטים חסומים עודכנו בהצלחה");
      }
      await load(true);
            setSelectedItems(new Map());
            setSelectedWithChildren(new Set());
            toast.success("פריטים שוחררו בהצלחה");
          } catch (e: any) {
      console.error("Bulk unblock failed:", e);
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("שגיאה בשחרור הפריטים");
      }
      await load(false);
    } finally {
      setIsLoading(false);
    }
  };

    const getBlockSuccessMessage = (items: BannedItem[]) => {
    const productCount = items.filter((item) => item.type === "product").length;
    const categoryCount = items.filter((item) => item.type === "category").length;
    const totalCount = items.length;

    if (totalCount === 1) {
      if (productCount === 1) return "המוצר נחסם בהצלחה";
      if (categoryCount === 1) return "הקטגוריה נחסמה בהצלחה";
    }

    if (productCount > 0 && categoryCount === 0) {
      return `${productCount} ${productCount === 1 ? "מוצר" : "מוצרים"} נחסמו בהצלחה`;
    }

    if (categoryCount > 0 && productCount === 0) {
      return `${categoryCount} ${categoryCount === 1 ? "קטגוריה" : "קטגוריות"} נחסמו בהצלחה`;
    }

    return `${totalCount} פריטים נחסמו בהצלחה`;
  };

  const handleBulkAction = async (forcedMode?: "banned" | "available") => {
    const mode = forcedMode || activeTab;

  const items = Array.from(selectedItems.entries())
    .map(([itemId, contextPath]) => {
      const item = allItems.find((i) => i.id === itemId);

        if (!item) return undefined;
        return {
          ...item,
          contextPath: contextPath || item.contextPath,
        } as BannedItem;
      })
      .filter((item): item is BannedItem => item !== undefined);

    if (items.length === 0) {
      toast.error("לא נבחרו פריטים מתאימים");
      return;
    }

if (mode === "banned") {
  const itemsToUnblock: BannedItem[] = [];

items.forEach((item) => {
  if (item.type === "category" && selectedWithChildren.has(item.id)) {
    const isCategoryBlocked = localBannedItems.some((b) => b.id === item.id);
    if (isCategoryBlocked) {
      itemsToUnblock.push(item);
    }
    const blockedDescendants = getAllDescendants(item.id, unifiedTree)
      .filter((d) => localBannedItems.some((b) => b.id === d.id))
      .map((d) => localBannedItems.find((b) => b.id === d.id)!)
      .filter(Boolean);
    itemsToUnblock.push(...blockedDescendants);
  } else {
    itemsToUnblock.push(item);
  }
});

  if (itemsToUnblock.length === 0) {
    toast.info("אין פריטים חסומים לשחרור");
    return;
  }

  const hasCategories = itemsToUnblock.some((item) => item.type === "category");
  if (hasCategories) {
    setPendingUnblockItems(itemsToUnblock);
    setShowInheritanceModal(true);
  } else {
    await executeUnblock(itemsToUnblock, false);
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
      await load(true);
      toast.success("פריטים נחסמו בהצלחה");
      } catch (e: any) {
          console.error("Bulk block failed:", e);
          toast.error("שגיאה בחסימת הפריטים");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };
  const renderGridView = () => {
    const currentItems =
      activeTab === "banned" ? filteredBannedItems : availableItems;
    if (currentItems.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700 text-sm">
            {searchQuery ? "לא נמצאו פריטים תואמים" : "אין פריטים"}
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3.5 p-3">
        {currentItems.map((item) => (
          <div
            key={`${item.type}:${item.id}`}
            className={`group relative rounded overflow-visible transition-all cursor-pointer ${
              selectedItems.has(item.id)
                ? "ring-2 ring-blue-500 shadow-md"
                : "hover:shadow-md shadow-sm"
            }`}
            onClick={() => handleToggleSelection(item.id, false)}
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
                src={item.image || "/assets/images/default-product.jpg"}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
                }}
              />
            </div>
            <div className="p-1.5 bg-white">
              <div className="relative group/tooltip flex justify-center">
                <span
                  className="font-semibold text-gray-800 text-[10px] w-full line-clamp-2 text-center leading-tight"
                  style={{
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    direction: /[\u0590-\u05FF]/.test(item.name)
                      ? "rtl"
                      : "ltr",
                  }}
                  title=""
                >
                  {item.name}
                </span>

                {item.name.length > 20 && (
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-md">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTreeView = () => {
    const currentTree = filteredTree;
    if (currentTree.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700 text-sm">
            {searchQuery ? "לא נמצאו פריטים תואמים" : "אין פריטים"}
          </p>
        </div>
      );
    }
    return (
      <div className="min-w-max">
        <div className="space-y-1 p-4">
          {currentTree.map((node) => (
            <TreeNode
              key={`${node.type}-${node.id}`}
              node={node}
              level={0}
              selectedItems={selectedItems}
              selectedWithChildren={selectedWithChildren}
              onToggleSelection={handleToggleSelection}
              onToggleExpand={handleToggleExpand}
              expandedNodes={expandedNodes}
              isCategory={node.type === "category"}
              cardWidth={cardWidth}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0  bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto">
      <div
        className="bg-white rounded-xl w-full max-w-5xl shadow-2xl text-right flex flex-col my-auto h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-700 text-white p-3 flex justify-between items-center rounded-t-xl flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              ניהול פריטים חסומים
              <p className="text-slate-300 text-xs mt-2">קבוצה: {groupName}</p>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-center py-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ">
            <div className="relative group">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === "tree"
                    ? "bg-white text-slate-700 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <GitBranch className="w-4 h-4" />
              </button>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                תצוגת עץ
              </span>
            </div>

            <div className="relative group">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-700 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                תצוגת רשימה
              </span>
            </div>
          </div>
        </div>
        {viewMode === "grid" && (
          <>
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setActiveTab("banned");
                  setSelectedItems(new Map());
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
                  setSelectedItems(new Map());
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
          </>
        )}

        <div className="p-3 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
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
          </div>
          <div className="flex gap-3 mb-2 flex-wrap flex-shrink-0">
            {viewMode === "grid" && (
              <>
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
              </>
            )}
            {viewMode === "tree" && (
              <>
                {expandedNodes.size > 0 ? (
                  <button
                    onClick={collapseAll}
                    className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1"
                  >
                    <ChevronUp className="w-3 h-3" />
                    סגור הכל
                  </button>
                ) : (
                  <button
                    onClick={expandAll}
                    className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1"
                  >
                    <ChevronDown className="w-3 h-3" />
                    פתח הכל
                  </button>
                )}
              </>
            )}
          </div>

          {(viewMode === "tree"
            ? allItems.length
            : activeTab === "banned"
              ? filteredBannedItems.length
              : availableItems.length) > 0 && (
            <div className="flex gap-1 mb-2 items-center bg-gray-50 p-1 rounded-md flex-shrink-0">
              <button
                onClick={handleSelectAll}
                className="py-1 px-5 rounded-md text-[11px] font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
              >
                {allCurrentSelected ? "בטל בחירה" : "בחר הכל"}
              </button>

              {selectedItems.size > 0 && (
                <>
                  <span className="text-[11px] text-gray-500 bg-white px-2 py-0.5 rounded">
                    {selectedItems.size} נבחרו
                    {selectedWithChildren.size > 0 &&
                      ` (${selectedWithChildren.size} עם ילדים)`}
                  </span>
                  {viewMode === "grid" && (
                    <div className="relative group/tooltip">
                      <button
                        onClick={() => handleBulkAction()}
                        disabled={isLoading}
                        className={`py-1 px-3 rounded-md text-[11px] font-medium transition-all shadow-sm hover:shadow-md ${
                          activeTab === "banned"
                            ? "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                            : "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
                        }`}
                      >
                        {activeTab === "banned" ? (
                          <LockOpen className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                        {activeTab === "banned"
                          ? "שחרור פריטים נבחרים"
                          : "חסימת פריטים נבחרים"}
                      </span>
                    </div>
                  )}
                  {viewMode === "tree" && (
                    <div className="flex items-center gap-2">
                      {selectedItemsStatus.hasBlocked && (
                        <div className="flex items-center justify-center py-1 px-3 bg-green-500 hover:bg-green-600 rounded-md transition-colors">
                          <button onClick={() => handleBulkAction("banned")}>
                            <LockOpen className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      )}

                      {selectedItemsStatus.hasAvailable && (
                        <div className="flex items-center justify-center py-1 px-3 bg-red-500 hover:bg-red-600 rounded-md transition-colors">
                          <button onClick={() => handleBulkAction("available")}>
                            <Lock className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
              className="flex-1 overflow-y-auto overflow-x-auto min-h-0"
            >
              {viewMode === "tree" ? renderTreeView() : renderGridView()}
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
            (item) => item.type === "category",
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
