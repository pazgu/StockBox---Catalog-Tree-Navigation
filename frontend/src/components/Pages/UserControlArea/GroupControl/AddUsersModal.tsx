import React, { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { Group } from '../../../models/group.models';
import { User } from '../../../models/user.models';
interface AddUsersModalProps {
  group: Group;
  allUsers: User[];
  onClose: () => void;
  onAddUsers: (groupId: string, userIds: string[]) => void;
}

const AddUsersModal: React.FC<AddUsersModalProps> = ({ group, allUsers, onClose, onAddUsers }) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');

  const usersNotInGroup = useMemo(() => {
    return allUsers
      .filter((user) => !group.members.includes(user._id!) && user.role === 'viewer')
      .filter(
        (user) =>
          modalSearch === '' ||
          user.userName.toLowerCase().includes(modalSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(modalSearch.toLowerCase())
      );
  }, [allUsers, group.members, modalSearch]);

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === usersNotInGroup.length) {
    // אם כולם נבחרו, בטל את הבחירה
      setSelectedUserIds([]);
    } else {
    // בחר את כולם
      setSelectedUserIds(usersNotInGroup.map((user) => user._id!));
    }
  };
  const handleAdd = () => {
    onAddUsers(group.id, selectedUserIds);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl w-full sm:w-[500px] max-w-[90%] shadow-2xl text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight text-center">
          הוסף משתמשים לקבוצת {group.name}
        </h4>

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="חפש משתמש להוספה..."
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 transition-all duration-200"
            autoFocus
          />
        </div>
        {usersNotInGroup.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 mb-3 text-sm font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all shadow-sm hover:shadow-md"
          >
            {selectedUserIds.length === usersNotInGroup.length ? 'בטל בחירה' : 'בחר את כל המשתמשים'}
          </button>
        )}

        <div className="max-h-64 overflow-y-auto space-y-2 mb-6 pr-2">
          {usersNotInGroup.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>
                {modalSearch
                  ? 'לא נמצאו משתמשים תואמים.'
                  : 'כל המשתמשים הפוטנציאליים כבר בקבוצה זו.'}
              </p>
            </div>
          ) : (
            usersNotInGroup.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleCheckboxChange(user._id!)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user._id!)}
                    onChange={() => handleCheckboxChange(user._id!)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 text-slate-700 rounded focus:ring-slate-700"
                  />
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                  </div>
                  <div className="text-sm text-gray-700">
                    <h4 className="font-medium">{user.userName}</h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={handleAdd}
            disabled={selectedUserIds.length === 0}
            className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            הוסף משתמשים ({selectedUserIds.length})
          </button>
          <button
            onClick={onClose}
            className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-300"
          >
            בטל
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUsersModal;