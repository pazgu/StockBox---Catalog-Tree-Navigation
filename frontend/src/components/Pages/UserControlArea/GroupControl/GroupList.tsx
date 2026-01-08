import React, { useState } from "react";
import { Users, Trash2, Plus, Pen } from "lucide-react";
import { Group} from "../../../models/group.models";
import { User } from "../../../models/user.models";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="col-span-12 lg:col-span-3 bg-gray-50 border-l lg:border-r border-gray-200 p-6 text-right">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">קבוצות</h3>
        <button
          onClick={onAddGroup}
          title="ליצירת קבוצה חדשה"
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">קבוצה חדשה</span>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="חפש קבוצה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-right"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>אין קבוצות במערכת</p>
          <p className="text-sm">לחצי על "קבוצה חדשה" כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(5*64px)] overflow-y-auto px-0">

          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`w-full box-border p-4 rounded-xl cursor-pointer transition-all relative group text-right shadow-sm ${
                selectedGroup === group.id
                  ? "bg-gradient-to-l from-slate-100 to-gray-100 border-2 border-slate-400"
                  : "bg-white border border-gray-100 hover:shadow-md hover:-translate-x-1"
              }`}
              title="לצפייה ועריכה"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 w-16">{group.name}</h4>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full whitespace-nowrap">
                    {group.members.length} משתמשים
                  </span>
                </div>

                <div className="flex items-center gap-">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditGroup(group);
                    }}
                    className="p-1 rounded-full bg-white hover:bg-gray-300 hover:text-white transition-colors"
                    title="עריכת שם קבוצה"
                  >
                    <Pen size={14} className="text-slate-600" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGroup(group);
                    }}
                    className="p-1.5 rounded-full bg-white hover:bg-red-600 hover:text-white transition-colors"
                    title="מחק קבוצה"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList;