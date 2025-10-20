import React from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Group, User } from '../../../../types/types';

interface GroupListProps {
  groups: Group[];
  users: User[];
  selectedGroup: string;
  onSelectGroup: (id: string) => void;
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
  onAddGroup: () => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  users,
  selectedGroup,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onAddGroup,
}) => {
  return (
    <div className="col-span-12 lg:col-span-3 bg-gray-50 border-l lg:border-r border-gray-200 p-6 text-right">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">קבוצות</h3>
        <button
          onClick={onAddGroup}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">קבוצה חדשה</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>אין קבוצות במערכת</p>
          <p className="text-sm">לחצי על "קבוצה חדשה" כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] lg:max-h-[700px] overflow-y-auto pr-2">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              onDoubleClick={() => onEditGroup(group)}
              className={`p-4 rounded-xl cursor-pointer transition-all relative group text-right shadow-sm ${
                selectedGroup === group.id
                  ? 'bg-gradient-to-l from-slate-100 to-gray-100 border-2 border-slate-400'
                  : 'bg-white border border-gray-100 hover:shadow-md hover:-translate-x-1'
              }`}
              title="לחיצה כפולה לעריכה"
            >
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group);
                  }}
                  className="p-1.5 rounded-full bg-white shadow-md hover:bg-red-600 hover:text-white transition-colors"
                  title="מחק קבוצה"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-right">
                  <h4 className="font-semibold text-gray-800">{group.name}</h4>
                  <p className="text-sm text-gray-600 mt-1 truncate max-w-[150px]">
                    {group.description}
                  </p>
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full whitespace-nowrap">
                  {users.filter((u) => u.groups.includes(group.id)).length} משתמשים
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;