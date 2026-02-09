import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Package,
  FolderTree,
  Settings,
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
}

interface TreeNodeProps {
  node: TreeItem;
  level: number;
  selectedItems: Map<string | number, string | undefined>;
  selectedWithChildren: Set<string | number>;
  onToggleSelection: (itemId: string | number, withChildren: boolean, contextPath?: string) => void;
  onToggleExpand: (itemId: string | number) => void;
  expandedNodes: Set<string | number>;
  isCategory?: boolean;
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
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPreviousPath } = usePath();
  const hasChildren = (node.children?.length ?? 0) > 0 || (node.products?.length ?? 0) > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedItems.has(node.id);
  const isSelectedWithChildren = selectedWithChildren.has(node.id);
  const getTypeColor = (type: string) => {
    return type === "product" ? "bg-blue-500" : "bg-purple-500";
  };
  const getItemIcon = (type: string) => {
    return type === "product" ? (
      <Package className="w-3 h-3" />
    ) : (
      <FolderTree className="w-3 h-3" />
    );
  };
  const handlePermissionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviousPath(location.pathname);
    navigate(`/permissions/${node.type}/${node.id}`);
  };
  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded transition-colors group ${
          isSelected ? "bg-blue-50" : ""
        }`}
        style={{ paddingRight: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5 flex-shrink-0" />
        )}
        <div
          onClick={() => onToggleSelection(node.id, false, (node as any).contextPath)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
            isSelected || isSelectedWithChildren
              ? "bg-blue-500 border-blue-500"
              : "bg-white border-gray-300 hover:border-blue-400"
          }`}
        >
          {(isSelected || isSelectedWithChildren) && (
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
        {isCategory && hasChildren && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection(node.id, true, (node as any).contextPath);
            }}
            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
              isSelectedWithChildren
                ? "bg-green-500 border-green-500"
                : "bg-white border-gray-400 hover:border-green-400"
            }`}
            title="כולל ילדים"
          >
            {isSelectedWithChildren && (
              <svg
                className="w-2.5 h-2.5 text-white"
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
        )}
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={node.image || "/assets/images/default-product.jpg"}
            alt={node.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
            }}
          />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 truncate">
            {node.name}
          </span>
          <span
            className={`px-2 py-0.5 ${getTypeColor(
              node.type
            )} text-white text-[10px] font-bold rounded-full flex items-center gap-1 flex-shrink-0`}
          >
            {getItemIcon(node.type)}
            <span>{node.type === "product" ? "מוצר" : "קטגוריה"}</span>
          </span>
        </div>
        <button
          onClick={handlePermissionsClick}
          className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded transition-all flex items-center gap-1 flex-shrink-0"
          title="נהל הרשאות"
        >
          <Settings className="w-3 h-3" />
          הרשאות
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div className="border-r-2 border-gray-200 mr-3">
          {node.children?.map((child) => (
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
            />
          ))}
          {node.products?.map((product) => (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;