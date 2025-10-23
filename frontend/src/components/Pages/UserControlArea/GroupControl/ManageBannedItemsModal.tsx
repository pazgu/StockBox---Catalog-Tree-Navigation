import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Trash2, Package, FolderTree, Tag } from 'lucide-react';
import { BannedItem } from '../../../../types/types';
import canoneos2000d from "../../../../assets/canon-eos2000d.png";
import headphones from "../../../../assets/headphones.png";
import audio from "../../../../assets/audio.png";
import camera from "../../../../assets/camera.png";
import video from "../../../../assets/video.png";

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
  { id: "cat_1", name: "שמיעה", type: "category", image: headphones, },
  { id: "cat_2", name: "הקלטה", type: "category", image: audio },
  { id: "cat_3", name: "וידיאו", type: "category", image: video },
  { id: "cat_4", name: "צילום", type: "category", image: camera },
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
  const [filterType, setFilterType] = useState<'all' | 'product' | 'category' | 'subcategory'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

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
      (searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterType === 'all' || item.type === filterType)
    );
  }, [localBannedItems, searchQuery, filterType]);

  const availableItems = useMemo(() => {
    const bannedIds = new Set(localBannedItems.map(item => String(item.id)));
    return allAvailableItems
      .filter(item => !bannedIds.has(String(item.id)))
      .filter(item =>
        (searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterType === 'all' || item.type === filterType)
      );
  }, [localBannedItems, searchQuery, filterType]);

  const handleRemoveItem = (itemId: string | number) => {
    setLocalBannedItems(prev => prev.filter(item => String(item.id) !== String(itemId)));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleAddItem = (item: BannedItem) => {
    setLocalBannedItems(prev => [...prev, item]);
    setSearchQuery('');
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  };

  const handleToggleSelection = (itemId: string | number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const currentItems = activeTab === 'banned' ? filteredBannedItems : availableItems;
    const allIds = currentItems.map(item => item.id);
    
    if (selectedItems.size === currentItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  };

  const handleBulkAction = () => {
    if (activeTab === 'banned') {
      setLocalBannedItems(prev => 
        prev.filter(item => !selectedItems.has(item.id))
      );
    } else {
      const itemsToAdd = availableItems.filter(item => selectedItems.has(item.id));
      setLocalBannedItems(prev => [...prev, ...itemsToAdd]);
    }
    setSelectedItems(new Set());
  };

  const handleSave = () => {
    onUpdateBannedItems(localBannedItems);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-5xl shadow-2xl text-right flex flex-col my-4"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
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
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('banned')}
            className={`flex-1 py-2.5 px-4.5 text-sm font-medium transition-colors ${
              activeTab === 'banned'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            פריטים חסומים ({filteredBannedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2.5 px-4.5 text-sm font-medium transition-colors ${
              activeTab === 'available'
                ? 'text-slate-700 border-b-2 border-slate-700 bg-slate-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            הוסף חסימה ({availableItems.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Search */}
          <div className="relative mb-2 flex-shrink-0">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder={activeTab === 'banned' ? 'חפש...' : 'חפש פריט...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-7 pl-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all"
              autoFocus
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-2 flex-shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-0.5 ${
                filterType === 'product'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-2.5 h-2.5" />
              מוצרים
            </button>
            <button
              onClick={() => setFilterType('category')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-0.5 ${
                filterType === 'category'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FolderTree className="w-2.5 h-2.5" />
              קטגוריות
            </button>
            <button
              onClick={() => setFilterType('subcategory')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-0.5 ${
                filterType === 'subcategory'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              תתי-קטגוריות
            </button>
          </div>

          {/* Select All and Bulk Actions */}
          {((activeTab === 'banned' && filteredBannedItems.length > 0) || 
            (activeTab === 'available' && availableItems.length > 0)) && (
            <div className="flex gap-1 mb-2 flex-shrink-0 items-center bg-gradient-to-r from-slate-50 to-gray-50 p-1.5 rounded-lg border border-gray-200">
              <button
                onClick={handleSelectAll}
                className="py-1 px-5 rounded-md text-[11px] font-medium bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
              >
                {selectedItems.size === (activeTab === 'banned' ? filteredBannedItems.length : availableItems.length)
                  ? 'בטל הכל'
                  : 'בחר הכל'}
              </button>
              {selectedItems.size > 0 && (
                <>
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    <span className="text-[11px] font-semibold text-slate-700">{selectedItems.size}</span>
                    <span className="text-[11px] text-gray-500">נבחרו</span>
                  </div>
                  <button
                    onClick={handleBulkAction}
                    className={`py-1 px-3 rounded-md text-[11px] font-medium transition-all shadow-sm hover:shadow-md ${
                      activeTab === 'banned'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {activeTab === 'banned' ? 'הסר' : 'הוסף'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto min-h-0">
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
                <div className="grid grid-cols-6 gap-2">
                  {filteredBannedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col rounded-lg border-2 transition-all group relative overflow-hidden cursor-pointer ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                      }`}
                      style={{ aspectRatio: '1' }}
                      onClick={() => handleToggleSelection(item.id)}
                    >
                      {/* תמונה */}
                      <div className="relative w-full h-3/4.25 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <img 
                          src={item.image || '/assets/images/default-product.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                          }}
                        />
                        {/* Checkbox בחירה */}
                        <div className={`absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all shadow-sm ${
                          selectedItems.has(item.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white/95 border-gray-400'
                        }`}>
                          {selectedItems.has(item.id) && (
                            <svg className="w-2 h-2 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        {/* כפתור מחיקה */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          className="absolute top-1 left-1 p-0.5 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          title="הסר חסימה"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {/* תג סוג */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[9px] rounded-full flex items-center gap-0.5 shadow-sm">
                          <div className="w-3 h-3">{getItemIcon(item.type)}</div>
                          <span className="text-[10px] font-medium">{getItemTypeLabel(item.type)}</span>
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
                <div className="grid grid-cols-6 gap-2">
                  {availableItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col rounded-lg border-2 transition-all group relative overflow-hidden cursor-pointer ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-slate-400 hover:shadow-md'
                      }`}
                      style={{ aspectRatio: '1' }}
                      onClick={() => handleToggleSelection(item.id)}
                    >
                      {/* תמונה */}
                      <div className="relative w-full h-3/4 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <img 
                          src={item.image || '/assets/images/default-product.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                          }}
                        />
                        {/* Checkbox בחירה */}
                        <div className={`absolute top-1 right-1 w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all shadow-sm ${
                          selectedItems.has(item.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white/95 border-gray-400'
                        }`}>
                          {selectedItems.has(item.id) && (
                            <svg className="w-2 h-2 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        {/* כפתור הוספה */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddItem(item);
                          }}
                          className="absolute top-1 left-1 p-0.5 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-md"
                          title="הוסף לחסימה"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {/* תג סוג */}
                        <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-slate-600/90 backdrop-blur-sm text-white text-[9px] rounded-full flex items-center gap-0.5 shadow-sm">
                          <div className="w-3 h-3">{getItemIcon(item.type)}</div>
                          <span className="text-[10px] font-medium">{getItemTypeLabel(item.type)}</span>
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
        <div className="border-t border-gray-200 p-2 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium shadow-md text-[12px]"
            >
              שמור שינויים
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-white text-gray-600 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-[12px]"
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