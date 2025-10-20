import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Shield, Database } from 'lucide-react';

type BannedEntityType = 'product' | 'category' | 'subcategory';

interface BannedItem {
  id: string | number;
  name: string;
  type: BannedEntityType;
}

interface BannedItemsProps {
  currentGroupName: string;
  bannedItems: BannedItem[];
}

const BannedItems: React.FC<BannedItemsProps> = ({ currentGroupName, bannedItems }) => {
  const navigate = useNavigate(); 

  const getTypeDisplayName = useCallback((type: BannedEntityType): string => {
    switch (type) {
      case 'product':
        return 'מוצר';
      case 'category':
        return 'קטגוריה';
      case 'subcategory':
        return 'תת קטגוריה';
      default:
        return '';
    }
  }, []);

  return (
    <div className="col-span-12 lg:col-span-4 bg-gray-50 p-6 text-right">
      <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Ban className="w-5 h-5 text-red-600" />
        ניהול הרשאות (חסימת משאבים)
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        רשימת הפריטים (מוצרים, קטגוריות, תת־קטגוריות) ש **חסומים** לקבוצה זו.
      </p>

      <div className="bg-white rounded-xl p-5 shadow-lg max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-2">
        <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
          חסימות עבור: <span className="text-slate-700">{currentGroupName || '...'}</span>
        </h4>

        {bannedItems.length > 0 ? (
          <ul className="space-y-3 list-disc pr-5">
            {bannedItems.map((item) => (
              <li key={item.id} className="text-sm">
                <span className="font-medium text-red-600 ml-1">חסום: </span>
                <a
                  href={`/Permissions?id=${item.id}&type=${item.type}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    navigate(`/Permissions?id=${item.id}&type=${item.type}`);
                  }}
                  className="text-slate-700 hover:text-slate-600 underline transition-colors cursor-pointer"
                >
                  {item.name}
                </a>
                <span className="text-gray-500 text-xs mr-2">
                  ({getTypeDisplayName(item.type as BannedEntityType)})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
            <p>אין חסימות פעילות בקבוצה זו.</p>
            <p className="text-xs mt-1">ברירת המחדל היא **גישה מלאה**.</p>
          </div>
        )}

        <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-md text-sm font-medium">
          <Database className="w-4 h-4" />
          נהל פריטים חסומים
        </button>
      </div>
    </div>
  );
};

export default BannedItems;
