import React, { useState, useMemo, useEffect } from 'react';
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

  useEffect(() => {
  // 1) save current scroll position
  const scrollY = window.scrollY;

  // 2) cache previous styles
  const prevBodyOverflow = document.body.style.overflow;
  const prevBodyPosition = document.body.style.position;
  const prevBodyTop = document.body.style.top;
  const prevBodyWidth = document.body.style.width;

  const prevHtmlOverflow = document.documentElement.style.overflow;

  // 3) some apps scroll on #root / #app instead of body/html
  const scrollContainer =
    (document.getElementById("root") as HTMLElement | null) ||
    (document.getElementById("app") as HTMLElement | null);

  const prevRootOverflow = scrollContainer?.style.overflow;

  // 4) lock everything
  document.documentElement.style.overflow = "hidden";

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  if (scrollContainer) {
    scrollContainer.style.overflow = "hidden";
  }

  // 5) restore on close
  return () => {
    document.documentElement.style.overflow = prevHtmlOverflow;

    document.body.style.overflow = prevBodyOverflow;
    document.body.style.position = prevBodyPosition;
    document.body.style.top = prevBodyTop;
    document.body.style.width = prevBodyWidth;

    if (scrollContainer) {
      scrollContainer.style.overflow = prevRootOverflow ?? "";
    }

    // restore scroll position
    window.scrollTo(0, scrollY);
  };
}, []);




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
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(usersNotInGroup.map((user) => user._id!));
    }
  };
  const handleAdd = () => {
    onAddUsers(group.id, selectedUserIds);
    onClose();
  };

  return (
   <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"

  onClick={onClose}
>

      <div
        className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-6 sm:p-8 w-[min(720px,calc(100vw-2rem))] shadow-2xl border border-gray-100 text-right flex flex-col  max-h-[min(820px,calc(100vh-2rem))] min-h-[520px]"


        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-start w-full mb-6">
  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
    <Users className="w-7 h-7" />
    <span>הוסף משתמשים</span>
  </h3>
</div>

<div className="text-sm text-gray-600 mb-5">
  לקבוצה: <span className="font-bold text-gray-800">{group.name}</span>
</div>


        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="חפש משתמש להוספה..."
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
            autoFocus
          />
        </div>
        {usersNotInGroup.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="mb-4 px-4 h-10 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            {selectedUserIds.length === usersNotInGroup.length ? 'בטל בחירה' : 'בחר את כל המשתמשים'}
          </button>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mb-6 pr-2">


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
                className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
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

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t-2 border-gray-200">

          <button
            onClick={handleAdd}
            disabled={selectedUserIds.length === 0}
            className={`flex-1 h-12 rounded-xl text-white transition-colors font-bold shadow-lg
  ${
    selectedUserIds.length === 0
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-gradient-to-r from-[#0D305B] to-[#15457a] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl"
  }`}

          >
            הוסף משתמשים ({selectedUserIds.length})
          </button>
          <button
            onClick={onClose}
           className="flex-1 h-12 rounded-xl border-2 border-gray-300 transition-colors font-bold bg-white text-gray-700 hover:bg-gray-50"

          >
            בטל
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUsersModal;