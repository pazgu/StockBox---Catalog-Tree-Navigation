import React from "react";
import { Search, Users, Plus, UserMinus } from "lucide-react";
import { User, Group } from "../../../../types/types";

interface UsersListProps {
  users: User[];
  groups: Group[];
  filteredUsers: User[];
  selectedUsers: Set<string>;
  searchQuery: string;
  currentGroupName: string;
  selectedGroup: string;
  onToggleUser: (id: string) => void;
  onSelectAll: () => void;
  onAddUsers: () => void;
  onSearchChange: (query: string) => void;
  onRemoveUsers: () => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  groups,
  filteredUsers,
  selectedUsers,
  searchQuery,
  currentGroupName,
  selectedGroup,
  onToggleUser,
  onSelectAll,
  onAddUsers,
  onSearchChange,
  onRemoveUsers,
}) => {
  return (
    <div className="col-span-12 lg:col-span-5 p-2 border-r border-gray-200 text-right">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          משתמשים ב
          <span className="text-slate-700 ">{currentGroupName || "..."}</span>
        </h3>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="חפש משתמש לפי שם או אימייל..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 transition-all duration-200"
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={onSelectAll}
          className="text-sm text-slate-700 hover:text-slate-600 font-medium underline"
          disabled={filteredUsers.length === 0}
        >
          {selectedUsers.size === filteredUsers.length &&
          filteredUsers.length > 0
            ? "בטל בחירה"
            : "בחר הכל"}
        </button>
        <span className="text-sm text-gray-600">
          {selectedUsers.size > 0 
            ? `${selectedUsers.size} נבחרו מתוך ${filteredUsers.length}`
            : `נמצאו ${filteredUsers.length} משתמשים`
          }
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={onAddUsers}
          disabled={!selectedGroup}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          הוסף משתמשים
        </button>

        <button
          onClick={onRemoveUsers}
          disabled={selectedUsers.size === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <UserMinus className="w-4 h-4" />
          הסר מהקבוצה
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>אין משתמשים בקבוצה זו</p>
          {searchQuery && <p className="text-sm mt-2">נסי חיפוש אחר</p>}
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => onToggleUser(user.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                selectedUsers.has(user.id)
                  ? "bg-slate-50 border-slate-400 shadow-md"
                  : "bg-white border-gray-200 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedUsers.has(user.id)}
                onChange={() => onToggleUser(user.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-slate-700 rounded focus:ring-slate-700"
              />

              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.avatar}
              </div>

              <div className="flex-1 text-right min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {user.groups.map((groupId) => {
                  const group = groups.find((g) => g.id === groupId);
                  return group ? (
                    <span
                      key={groupId}
                      className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${
                        groupId === selectedGroup
                          ? "bg-slate-700 text-white font-medium"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {group.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;
