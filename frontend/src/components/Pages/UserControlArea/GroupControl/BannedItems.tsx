import React, { useState } from "react";
import { ShieldBan, Package, FolderTree, Settings } from "lucide-react";
import ManageBannedItemsModal from "./ManageBannedItemsModal";
import { BannedItem } from "../../../../types/types";

interface BannedItemsProps {
  currentGroupId: string;
  currentGroupName: string;
  bannedItems: BannedItem[];
  onUpdateBannedItems?: (items: BannedItem[]) => void;
}

const BannedItems: React.FC<BannedItemsProps> = ({
  currentGroupId,
  currentGroupName,
  bannedItems,
  onUpdateBannedItems,
}) => {
  const [showManageModal, setShowManageModal] = useState(false);

  const getItemIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="w-4 h-4 text-red-500" />;
      case "category":
        return <FolderTree className="w-4 h-4 text-orange-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="col-span-12 lg:col-span-4 bg-gray-50 p-6 text-right border-t lg:border-t-0 lg:border-r border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ShieldBan className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-700">פריטים חסומים</h3>
        </div>
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-md text-sm"
          title="נהל פריטים חסומים"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">נהל פריטים</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600 mb-4">
          קבוצה:{" "}
          <span className="font-semibold text-gray-800">
            {currentGroupName}
          </span>
        </p>

        {bannedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShieldBan className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">אין פריטים חסומים</p>
            <p className="text-sm mt-1">לחצ/י על "נהל פריטים" להוספת חסימות</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {bannedItems.map((item) => (
              <div
                key={`${item.type}:${item.id}`}
                className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="mt-0.5">{getItemIcon(item.type)}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {getItemTypeLabel(item.type)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>סה״כ :</span>
            <span className="font-semibold text-red-600">
              {bannedItems.length}
            </span>
          </div>
        </div>
      </div>

      {showManageModal && onUpdateBannedItems && (
        <ManageBannedItemsModal
          groupId={currentGroupId}
          groupName={currentGroupName}
          bannedItems={bannedItems}
          onClose={() => setShowManageModal(false)}
          onUpdateBannedItems={onUpdateBannedItems}
        />
      )}
    </div>
  );
};

export default BannedItems;
