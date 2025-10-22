import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Trash2, Package, FolderTree, Tag } from 'lucide-react';
import { BannedItem } from '../../../../types/types';
import canoneos2000d from "../../../../assets/canon-eos2000d.png";

interface ManageBannedItemsModalProps {
  groupName: string;
  bannedItems: BannedItem[];
  onClose: () => void;
  onUpdateBannedItems: (items: BannedItem[]) => void;
}

// Mock data לכל הפריטים האפשריים במערכת
const allAvailableItems: BannedItem[] = [
  { id: 1, name: "מצלמה דיגיטלית Canon EOS 250D DSLR", type: "product", image: canoneos2000d },
  { id: 2, name: "מצלמה Sony Alpha A6400", type: "product", image: "/assets/images/camera-sony-a6400.jpg" },
  { id: 3, name: "מצלמה Nikon D5600", type: "product", image: "/assets/images/camera-nikon-d5600.jpg" },
  { id: 4, name: "מצלמה דיגיטלית ללא מראה Canon EOS R100", type: "product", image: "/assets/images/camera-canon-r100.jpg" },
  { id: 5, name: "עדשה Canon EF 50mm f/1.8", type: "product", image: "/assets/images/lens-canon-50mm.jpg" },
  { id: 6, name: "חצובה Manfrotto MT055", type: "product", image: "/assets/images/tripod-manfrotto.jpg" },
  { id: 7, name: "מיקרופון Rode VideoMic Pro", type: "product", image: "/assets/images/microphone-rode.jpg" },
  { id: 8, name: "פלאש Godox V860II", type: "product", image: "/assets/images/flash-godox.jpg" },
  { id: 9, name: "תיק מצלמה Lowepro ProTactic", type: "product", image: "/assets/images/bag-lowepro.jpg" },
  { id: 10, name: "כרטיס זיכרון SanDisk 128GB", type: "product", image: "/assets/images/memory-card-sandisk.jpg" },
  { id: "cat_1", name: "מצלמות", type: "category", image: "/assets/images/category-cameras.jpg" },
  { id: "cat_2", name: "הקלטה", type: "category", image: "/assets/images/category-recording.jpg" },
  { id: "cat_3", name: "תאורה", type: "category", image: "/assets/images/category-lighting.jpg" },
  { id: "cat_4", name: "אביזרים", type: "category", image: "/assets/images/category-accessories.jpg" },
  { id: "cat_5", name: "אחסון", type: "category", image: "/assets/images/category-storage.jpg" },
  { id: "sub_cat_1", name: "מצלמות DSLR", type: "subcategory", image: "/assets/images/subcat-dslr.jpg" },
  { id: "sub_cat_2", name: "מצלמות Mirrorless", type: "subcategory", image: "/assets/images/subcat-mirrorless.jpg" },
  { id: "sub_cat_3", name: "מצלמות אקשן", type: "subcategory", image: "/assets/images/subcat-action.jpg" },
  { id: "sub_cat_4", name: "מיקרופונים", type: "subcategory", image: "/assets/images/subcat-microphones.jpg" },
  { id: "sub_cat_5", name: "חצובות", type: "subcategory", image: "/assets/images/subcat-tripods.jpg" },
  { id: "sub_cat_6", name: "פלאשים", type: "subcategory", image: "/assets/images/subcat-flashes.jpg" },
  { id: "sub_cat_7", name: "עדשות EF", type: "subcategory", image: "/assets/images/subcat-lenses-ef.jpg" },
  { id: "sub_cat_8", name: "עדשות RF", type: "subcategory", image: "/assets/images/subcat-lenses-rf.jpg" },
  { id: "sub_cat_9", name: "תיקים", type: "subcategory", image: "/assets/images/subcat-bags.jpg" },
  { id: "sub_cat_10", name: "כרטיסי זיכרון", type: "subcategory", image: "/assets/images/subcat-memory.jpg" },
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
        return <Package className="w-3 h-3" />;
      case 'category':
        return <FolderTree className="w-3 h-3" />;
      case 'subcategory':
        return <Tag className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
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
    setLocalBannedItems(prev => prev.filter(item => String(item.id) !== String(itemId)));
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
        <div className="bg-gradient-to-l from-slate-700 to-slate-600 text-white p-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium">ניהול פריטים חסומים - {groupName}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('banned')}
            className={`flex-1 py-3 px-5 text-sm font-medium transition-colors ${
              activeTab === 'banned'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            פריטים חסומים ({localBannedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3.5 px-5 text-sm font-medium transition-colors ${
              activeTab === 'available'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            הוסף חסימה ({availableItems.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder={activeTab === 'banned' ? 'חפש...' : 'חפש פריט...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all"
              autoFocus
            />
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
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
                <div className="grid grid-cols-4 gap-2">
                  {filteredBannedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group relative overflow-hidden aspect-square"
                    >
                      {/* תמונה */}
                      <div className="relative w-full h-2/3 bg-gray-100 overflow-hidden">
                        <img 
                          src={item.image || '/assets/images/default-product.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                          }}
                        />
                        {/* כפתור מחיקה */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="absolute top-1 left-1 p-0.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          title="הסר חסימה"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {/* תג סוג */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-0.5">
                          {getItemIcon(item.type)}
                          <span className="text-[10px]">{getItemTypeLabel(item.type)}</span>
                        </div>
                      </div>
                      {/* פרטי הפריט */}
                      <div className="p-1.5 flex-1 flex flex-col justify-center bg-white">
                        <h4 className="font-medium text-gray-800 text-[11px] line-clamp-2 text-center leading-tight">{item.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="grid grid-cols-4 gap-2">
                  {availableItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-lg border border-gray-200 hover:border-slate-400 hover:shadow-md transition-all group relative overflow-hidden aspect-square cursor-pointer"
                      onClick={() => handleAddItem(item)}
                    >
                      {/* תמונה */}
                      <div className="relative w-full h-2/3 bg-gray-100 overflow-hidden">
                        <img 
                          src={item.image || '/assets/images/default-product.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                          }}
                        />
                        {/* כפתור הוספה */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddItem(item);
                          }}
                          className="absolute top-1 left-1 p-0.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          title="הוסף לחסימה"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {/* תג סוג */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-slate-600 text-white text-xs rounded-full flex items-center gap-0.5">
                          {getItemIcon(item.type)}
                          <span className="text-[10px]">{getItemTypeLabel(item.type)}</span>
                        </div>
                      </div>
                      {/* פרטי הפריט */}
                      <div className="p-1.5 flex-1 flex flex-col justify-center bg-white">
                        <h4 className="font-medium text-gray-800 text-[11px] line-clamp-2 text-center leading-tight">{item.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium shadow-md text-sm"
            >
              שמור שינויים
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-white text-gray-600 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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