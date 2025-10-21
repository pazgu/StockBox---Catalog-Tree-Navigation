import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Trash2, Package, FolderTree, Tag } from 'lucide-react';
import { BannedItem } from '../../../../types/types';

interface ManageBannedItemsModalProps {
  groupName: string;
  bannedItems: BannedItem[];
  onClose: () => void;
  onUpdateBannedItems: (items: BannedItem[]) => void;
}

// Mock data לכל הפריטים האפשריים במערכת
const allAvailableItems: BannedItem[] = [
  { id: 1, name: "מצלמה דיגיטלית Canon EOS 250D DSLR", type: "product" },
  { id: 2, name: "מצלמה Sony Alpha A6400", type: "product" },
  { id: 3, name: "מצלמה Nikon D5600", type: "product" },
  { id: 4, name: "מצלמה דיגיטלית ללא מראה Canon EOS R100", type: "product" },
  { id: 5, name: "עדשה Canon EF 50mm f/1.8", type: "product" },
  { id: 6, name: "חצובה Manfrotto MT055", type: "product" },
  { id: 7, name: "מיקרופון Rode VideoMic Pro", type: "product" },
  { id: 8, name: "פלאש Godox V860II", type: "product" },
  { id: 9, name: "תיק מצלמה Lowepro ProTactic", type: "product" },
  { id: 10, name: "כרטיס זיכרון SanDisk 128GB", type: "product" },
  { id: "cat_1", name: "מצלמות", type: "category" },
  { id: "cat_2", name: "הקלטה", type: "category" },
  { id: "cat_3", name: "תאורה", type: "category" },
  { id: "cat_4", name: "אביזרים", type: "category" },
  { id: "cat_5", name: "אחסון", type: "category" },
  { id: "sub_cat_1", name: "מצלמות DSLR", type: "subcategory" },
  { id: "sub_cat_2", name: "מצלמות Mirrorless", type: "subcategory" },
  { id: "sub_cat_3", name: "מצלמות אקשן", type: "subcategory" },
  { id: "sub_cat_4", name: "מיקרופונים", type: "subcategory" },
  { id: "sub_cat_5", name: "חצובות", type: "subcategory" },
  { id: "sub_cat_6", name: "פלאשים", type: "subcategory" },
  { id: "sub_cat_7", name: "עדשות EF", type: "subcategory" },
  { id: "sub_cat_8", name: "עדשות RF", type: "subcategory" },
  { id: "sub_cat_9", name: "תיקים", type: "subcategory" },
  { id: "sub_cat_10", name: "כרטיסי זיכרון", type: "subcategory" },
];

const ManageBannedItemsModal: React.FC<ManageBannedItemsModalProps> = ({
  groupName,
  bannedItems,
  onClose,
  onUpdateBannedItems,
}) => {
  const [localBannedItems, setLocalBannedItems] = useState<BannedItem[]>(bannedItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'banned' | 'available'>('banned');

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'category':
        return <FolderTree className="w-4 h-4" />;
      case 'subcategory':
        return <Tag className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'מוצר';
      case 'category':
        return 'קטגוריה';
      case 'subcategory':
        return 'תת-קטגוריה';
      default:
        return type;
    }
  };

  const filteredBannedItems = useMemo(() => {
    return localBannedItems.filter((item) =>
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localBannedItems, searchQuery]);

  const availableItems = useMemo(() => {
    const bannedIds = new Set(localBannedItems.map(item => String(item.id)));
    return allAvailableItems
      .filter(item => !bannedIds.has(String(item.id)))
      .filter(item =>
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [localBannedItems, searchQuery]);

  const handleRemoveItem = (itemId: string | number) => {
    setLocalBannedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddItem = (item: BannedItem) => {
    setLocalBannedItems(prev => [...prev, item]);
    setSearchQuery('');
  };

  const handleSave = () => {
    onUpdateBannedItems(localBannedItems);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl shadow-2xl text-right flex flex-col my-8"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-700 to-slate-600 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-medium">ניהול פריטים חסומים</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-2">קבוצה: {groupName}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('banned')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'banned'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            פריטים חסומים ({localBannedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'available'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            הוסף חסימה ({availableItems.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'banned' ? 'חפש בפריטים חסומים...' : 'חפש פריט להוספה...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-2">
            {activeTab === 'banned' ? (
              filteredBannedItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">
                    {searchQuery ? 'לא נמצאו פריטים תואמים' : 'אין פריטים חסומים'}
                  </p>
                  <p className="text-sm mt-1">
                    {!searchQuery && 'לחץ על "הוסף חסימה" כדי להתחיל'}
                  </p>
                </div>
              ) : (
                filteredBannedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        {getItemIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">{getItemTypeLabel(item.type)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="הסר חסימה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            ) : (
              availableItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">
                    {searchQuery ? 'לא נמצאו פריטים תואמים' : 'כל הפריטים כבר חסומים'}
                  </p>
                </div>
              ) : (
                availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleAddItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                        {getItemIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-xs text-gray-500">{getItemTypeLabel(item.type)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddItem(item);
                      }}
                      className="p-2 text-gray-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="הוסף לחסימה"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium shadow-md"
            >
              שמור שינויים
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-white text-gray-600 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBannedItemsModal;