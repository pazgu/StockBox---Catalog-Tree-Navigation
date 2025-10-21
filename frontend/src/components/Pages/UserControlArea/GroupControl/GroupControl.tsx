import React, { useState, useMemo, useEffect } from 'react';
import { Users, Save, UserMinus, CheckCircle2, Trash2, Edit, Plus } from 'lucide-react';
import GroupList from './GroupList';
import UsersList from '../AllUsers/UsersList';
import BannedItems from '../Permissions/BannedItems';
import AddUsersModal from './AddUsersModal';
import { Group, User, mockBannedItems } from '../../../../types/types';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';

const GroupControl: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState("group1");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // modal state for delete confirmation
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const navigate = useNavigate();
  const { role } = useUser();
  
  useEffect(() => {
    if (role !== "admin") {
      navigate("/");
    }
  }, [role, navigate]);

  const [groups, setGroups] = useState<Group[]>([
    {
      id: "group1",
      name: "קבוצה 1",
      permissions: [],
      bannedItems: [mockBannedItems[0], mockBannedItems[2]],
    },
    {
      id: "group2",
      name: "קבוצה 2",
      permissions: [],
      bannedItems: [mockBannedItems[1], mockBannedItems[3], mockBannedItems[2]],
    },
    {
      id: "group3",
      name: "קבוצה 3",
      permissions: [],
      bannedItems: [],
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "ג׳ון סמית׳",
      email: "john.smith@system.com",
      avatar: "JS",
      groups: ["group1", "group2"],
    },
    {
      id: "2",
      name: "שרה מילר",
      email: "sarah.miller@system.com",
      avatar: "SM",
      groups: ["group1"],
    },
    {
      id: "3",
      name: "רוברט ג׳ונסון",
      email: "robert.j@system.com",
      avatar: "RJ",
      groups: ["group1"],
    },
    {
      id: "4",
      name: "אמה וילסון",
      email: "emma.w@system.com",
      avatar: "EW",
      groups: ["group1"],
    },
    {
      id: "5",
      name: "מייקל בראון",
      email: "michael.b@system.com",
      avatar: "MB",
      groups: ["group1", "group3"],
    },
  ]);

  const currentGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroup),
    [groups, selectedGroup]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const inGroup = user.groups.includes(selectedGroup);
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return inGroup && matchesSearch;
    });
  }, [users, selectedGroup, searchQuery]);


  const totalUsers = useMemo(
    () => new Set(users.map((u) => u.id)).size,
    [users]
  );


  const handleSelectGroup = (id: string) => {
    setSelectedGroup(id);
    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleRemoveUsersFromGroup = () => {
    if (selectedUsers.size === 0) return;
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (selectedUsers.has(u.id)) {
          return {
            ...u,
            groups: u.groups.filter((gid) => gid !== selectedGroup),
          };
        }
        return u;
      })
    );

    setSelectedUsers(new Set());
    setSaveMessage(`${selectedUsers.size} משתמשים הוסרו מהקבוצה`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleAddUsers = (groupId: string, userIds: string[]) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (userIds.includes(u.id) && !u.groups.includes(groupId)) {
          return {
            ...u,
            groups: [...u.groups, groupId],
          };
        }
        return u;
      })
    );

    setSaveMessage(`${userIds.length} משתמשים נוספו בהצלחה לקבוצה`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSaveChanges = () => {
    setSaveMessage("השינויים נשמרו בהצלחה");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleAddGroup = () => {};

  const handleEditGroup = (group: Group) => {};

  const handleDeleteGroup = (group: Group) => {
    setGroupToDelete(group);
  };

  const closeDeleteModal = () => setGroupToDelete(null);

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;

    setGroups(prevGroups => prevGroups.filter(g => g.id !== groupToDelete.id));

    setUsers(prevUsers =>
      prevUsers.map(u => ({
        ...u,
        groups: u.groups.filter(gid => gid !== groupToDelete.id)
      }))
    );

    setSelectedGroup(prevSelected => {
      if (prevSelected === groupToDelete.id) {
        const remainingGroups = groups.filter(g => g.id !== groupToDelete.id);
        return remainingGroups.length > 0 ? remainingGroups[0].id : "";
      }
      return prevSelected;
    });

    setSaveMessage(`הקבוצה "${groupToDelete.name}" נמחקה בהצלחה`);
    setTimeout(() => setSaveMessage(""), 3000);

    setGroupToDelete(null);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 p-4 sm:p-8 md:p-12 lg:p-16 pt-28 font-sans"
    >
      {saveMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {saveMessage}
        </div>
      )}

      <div className="mb-8 text-right mt-10">
        <h2 className="text-4xl sm:text-5xl font-light text-slate-700 mb-2 tracking-tight">
          ניהול קבוצות והרשאות
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-l from-slate-700 to-slate-600 text-white p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <Users className="w-8 h-8" />
              <h3 className="text-2xl font-medium">מרכז ניהול קבוצות</h3>
            </div>

            <div className="flex gap-4 sm:gap-12 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <div className="text-sm opacity-90">משתמשים בסה״כ</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">{groups.length}</div>
                <div className="text-sm opacity-90">מספר קבוצות</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12">
          <GroupList
            groups={groups}
            users={users}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddGroup={handleAddGroup}
          />

          <UsersList
            users={users}
            groups={groups}
            filteredUsers={filteredUsers}
            selectedUsers={selectedUsers}
            searchQuery={searchQuery}
            currentGroupName={currentGroup?.name || ""}
            selectedGroup={selectedGroup}
            onToggleUser={toggleUserSelection}
            onSelectAll={handleSelectAll}
            onAddUsers={() => setShowAddUsersModal(true)}
            onSearchChange={setSearchQuery}
          />
          <BannedItems
            currentGroupName={currentGroup?.name || ""}
            bannedItems={currentGroup?.bannedItems || []}
          />
        </div>
        <div className="bg-white border-t border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            <span className="text-gray-700 text-base font-medium">
              {selectedUsers.size === 0
                ? "לא נבחרו משתמשים"
                : `${selectedUsers.size} משתמשים נבחרו`}
            </span>

            <div className="flex gap-4 w-full sm:w-auto justify-center">
              <button
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:shadow-none"
                onClick={handleRemoveUsersFromGroup}
                disabled={selectedUsers.size === 0}
              >
                <UserMinus className="w-4 h-4" />
                הסר מהקבוצה
              </button>

              <button
                className="px-8 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                onClick={handleSaveChanges}
              >
                <Save className="w-4 h-4" />
                שמור שינויים
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddUsersModal && currentGroup && (
        <AddUsersModal
          group={currentGroup}
          allUsers={users}
          onClose={() => setShowAddUsersModal(false)}
          onAddUsers={handleAddUsers}
        />
      )}

     {/* Delete Modal */}
      {groupToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center shadow-lg">
            <p className="text-slate-700 mb-3">
              האם את/ה בטוח/ה שברצונך למחוק את הקבוצה "{groupToDelete.name}"?
            </p>
            <small className="text-gray-500">
              לא ניתן לבטל פעולה זו לאחר מכן
            </small>

            <div className="flex justify-between gap-3 mt-5">
              <button
                onClick={closeDeleteModal}
                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:translate-y-[-1px] hover:shadow-md active:translate-y-0"
              >
                ביטול
              </button>

              <button
                onClick={confirmDeleteGroup}
                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-red-600 text-white shadow-md hover:bg-red-700 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupControl;