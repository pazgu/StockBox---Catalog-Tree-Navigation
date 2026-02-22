import React, { useState } from "react";
import {
  ChevronDown,
  Package,
  FolderTree,
  Settings,
  Users,
  Ban,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePath } from "../../../../context/PathContext";

interface TreeItem {
  id: string | number;
  name: string;
  type: "product" | "category";
  image: string | null;
  children?: TreeItem[];
  products?: TreeItem[];
  groupId: string;
  contextPath?: string;
  isBlocked?: boolean;
}

interface TreeNodeProps {
  node: TreeItem;
  level: number;
  selectedItems: Map<string | number, string | undefined>;
  selectedWithChildren: Set<string | number>;
  onToggleSelection: (
    itemId: string | number,
    withChildren: boolean,
    contextPath?: string,
  ) => void;
  onToggleExpand: (itemId: string | number) => void;
  expandedNodes: Set<string | number>;
  isCategory?: boolean;
  parentHovered?: boolean;
  parentBulkSelected?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  selectedItems,
  selectedWithChildren,
  onToggleSelection,
  onToggleExpand,
  expandedNodes,
  isCategory = true,
  parentHovered = false,
  parentBulkSelected = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPreviousPath } = usePath();

  const [isHoveringSelectWithChildren, setIsHoveringSelectWithChildren] =
    useState(false);

  const hasChildren =
    (node.children?.length ?? 0) > 0 || (node.products?.length ?? 0) > 0;
  const isExpanded = expandedNodes.has(node.id);

  const isSelected = selectedItems.has(node.id) || parentBulkSelected;
  const isSelectedWithChildren =
    selectedWithChildren.has(node.id) || parentBulkSelected;
  const isBlocked = node.isBlocked === true;

  const shouldHighlightFromParent =
    parentHovered ||
    isHoveringSelectWithChildren ||
    isSelectedWithChildren ||
    parentBulkSelected;

  const styles = isBlocked
    ? {
        container: "bg-rose-50/40 border-rose-100 hover:bg-rose-50",
        text: "text-rose-900",
        badge: "text-rose-600 bg-rose-100/50",
        icon: <Ban className="w-3.5 h-3.5" />,
        statusText: "חסום",
      }
    : {
        container: "bg-white border-gray-100 hover:bg-emerald-50/30",
        text: "text-emerald-900",
        badge: "text-emerald-600 bg-emerald-100/50",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        statusText: "זמין",
      };

  const handlePermissionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviousPath(location.pathname);
    navigate(`/permissions/${node.type}/${node.id}`);
  };

  return (
    <div className="select-none relative">
      {level > 0 && (
        <div
          className="absolute border-r-2 border-gray-200/60"
          style={{
            right: `${level * 32 - 20}px`,
            top: "-4px",
            bottom: isExpanded ? "auto" : "22px",
            height: isExpanded ? "28px" : "auto",
          }}
        />
      )}

      <div
        className={`flex items-center gap-3 py-2 px-3 my-1 rounded-2xl border transition-all duration-300 group relative
          ${styles.container}
          ${isSelected || isSelectedWithChildren ? `ring-2 ring-blue-500 shadow-md z-10` : "shadow-sm"}
          ${shouldHighlightFromParent ? "!bg-blue-50/60 !border-blue-200" : ""}
        `}
        style={{ marginRight: `${level * 32}px` }}
      >
        {level > 0 && (
          <div
            className="absolute w-5 border-t-2 border-gray-200/60"
            style={{ right: "-20px", top: "50%" }}
          />
        )}

        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-1 rounded-lg hover:bg-white transition-colors shadow-sm border border-gray-100"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-auto" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(node.id, false, node.contextPath);
              }}
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                ${
                  isSelected && !isSelectedWithChildren
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-transparent hover:border-blue-400 hover:text-blue-400"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              בחר
            </div>
          </div>

          {isCategory && (
            <div className="relative group/btn">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelection(node.id, true, node.contextPath);
                }}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                  ${
                    isSelectedWithChildren
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-gray-300 text-gray-400 hover:border-indigo-400"
                  }`}
              >
                <Users className="w-4 h-4" />
              </button>
              <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                בחר עם צאצאים
              </div>
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50 shadow-inner">
          <img
            src={node.image || "/assets/images/default-product.jpg"}
            alt={node.name}
            className={`w-full h-full object-cover transition-all duration-500 ${isBlocked ? "grayscale opacity-60 contrast-75" : ""}`}
            onError={(e) =>
              (e.currentTarget.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100")
            }
          />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex flex-col">
            <span className={`text-sm font-bold truncate ${styles.text}`}>
              {node.name}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
              {node.type === "product" ? (
                <Package className="w-3 h-3" />
              ) : (
                <FolderTree className="w-3 h-3" />
              )}
              {node.type === "product" ? "מוצר" : "קטגוריה"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm ${styles.badge}`}
            >
              {styles.icon}
              <span className="hidden sm:inline">{styles.statusText}</span>
            </div>
            <button
              onClick={handlePermissionsClick}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          {node.children?.map((child: TreeItem) => (
            <TreeNode
              key={`cat-${child.id}`}
              node={child}
              level={level + 1}
              selectedItems={selectedItems}
              selectedWithChildren={selectedWithChildren}
              onToggleSelection={onToggleSelection}
              onToggleExpand={onToggleExpand}
              expandedNodes={expandedNodes}
              isCategory={true}
              parentHovered={shouldHighlightFromParent}
              parentBulkSelected={parentBulkSelected || isSelectedWithChildren}
            />
          ))}
          {node.products?.map((product: TreeItem) => (
            <TreeNode
              key={`prod-${product.id}`}
              node={product}
              level={level + 1}
              selectedItems={selectedItems}
              selectedWithChildren={selectedWithChildren}
              onToggleSelection={onToggleSelection}
              onToggleExpand={onToggleExpand}
              expandedNodes={expandedNodes}
              isCategory={false}
              parentHovered={shouldHighlightFromParent}
              parentBulkSelected={parentBulkSelected || isSelectedWithChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
