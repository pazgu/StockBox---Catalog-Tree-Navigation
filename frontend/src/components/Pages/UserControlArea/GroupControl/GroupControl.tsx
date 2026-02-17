import React, { useState, useMemo, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import GroupList from "./GroupList";
import UsersList from "../AllUsers/UsersList";
import BannedItems from "./BannedItems";
import AddUsersModal from "./AddUsersModal";
import { BannedItem, BannedEntityType } from "../../../../types/types";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { Group } from "../../../models/group.models";
import { categoriesService } from "../../../../services/CategoryService";

import { groupService } from "../../../../services/GroupService";
import { permissionsService } from "../../../../services/permissions.service";

const GroupControl: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);

  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { role, users } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [editedGroupName, setEditedGroupName] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [isBannedLoading, setIsBannedLoading] = useState(false);
  const MAX_GROUP_NAME_LEN = 30;
  const SELECTED_GROUP_STORAGE_KEY = "groupControl:selectedGroupId";

  useEffect(() => {
    if (selectedGroup) {
      loadBlockedItemsForGroup(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (!role) return;
    if (role !== "editor") {
      navigate("/", { replace: true });
    }
  }, [navigate, role]);

  useEffect(() => {
    const savedGroupId = localStorage.getItem(SELECTED_GROUP_STORAGE_KEY);
    if (savedGroupId) setSelectedGroup(savedGroupId);
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem(SELECTED_GROUP_STORAGE_KEY, selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (showAddGroupModal && inputRef.current) inputRef.current.focus();
  }, [showAddGroupModal]);

  useEffect(() => {
    fetchGroups();
  }, []);
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const transformedGroups = await groupService.getGroups();

      setGroups(transformedGroups);

      const savedGroupId = localStorage.getItem(SELECTED_GROUP_STORAGE_KEY);
      const exists =
        savedGroupId && transformedGroups.some((g) => g.id === savedGroupId);

      if (!selectedGroup) {
        if (exists) setSelectedGroup(savedGroupId!);
        else if (transformedGroups.length > 0)
          setSelectedGroup(transformedGroups[0].id);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("שגיאה בטעינת קבוצות");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlockedItemsForGroup = async (groupId: string) => {
    try {
      setIsBannedLoading(true);

      const data = await permissionsService.getBlockedItemsForGroup(groupId);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, bannedItems: data.blocked } : g,
        ),
      );
    } catch (err) {
      console.error("Failed loading blocked items:", err);
      toast.error("שגיאה בטעינת פריטים חסומים");
    } finally {
      setIsBannedLoading(false);
    }
  };

  const currentGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroup),
    [groups, selectedGroup],
  );
  const openAddGroupModal = () => setShowAddGroupModal(true);
  const closeAddGroupModal = () => {
    setShowAddGroupModal(false);
    setNewGroupName("");
  };

  const saveNewGroup = async () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;

    if (trimmedName.length > MAX_GROUP_NAME_LEN) {
      toast.error(`שם הקבוצה ארוך מדי (מקסימום ${MAX_GROUP_NAME_LEN} תווים)`);
      return;
    }

    if (groups.some((g) => g.name === trimmedName)) {
      toast.error("כבר קיימת קבוצה עם שם זה. נא לבחור שם אחר.");
      return;
    }

    try {
      const newGroup = await groupService.createGroup(trimmedName);

      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroup(newGroup.id);
      toast.success(`הקבוצה "${trimmedName}" נוצרה בהצלחה`);
      closeAddGroupModal();
    } catch (error: any) {
      console.error("Error creating group:", error);
      if (error.response?.status === 409) {
        toast.error("הקבוצה כבר קיימת במערכת");
      } else {
        toast.error("שגיאה ביצירת קבוצה");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return [];

    return users.filter((user) => {
      const inGroup = group.members.includes(user._id!);
      const matchesSearch =
        searchQuery === "" ||
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return inGroup && matchesSearch;
    });
  }, [users, groups, selectedGroup, searchQuery]);

  const totalUsers = useMemo(() => users.length, [users]);

  const handleSelectGroup = (id: string) => {
    setSelectedGroup(id);
    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) newSelection.delete(userId);
      else newSelection.add(userId);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedUsers((prev) =>
      prev.size === filteredUsers.length
        ? new Set()
        : new Set(filteredUsers.map((u) => u._id!)),
    );
  };

  const handleRemoveUsersFromGroup = async () => {
    if (selectedUsers.size === 0 || !currentGroup) return;

    try {
      const userIdsArray = Array.from(selectedUsers);
      const newMembers = currentGroup.members.filter(
        (memberId) => !userIdsArray.includes(memberId),
      );

      await groupService.updateGroupMembers(selectedGroup, newMembers);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup ? { ...g, members: newMembers } : g,
        ),
      );

      toast.info(`${selectedUsers.size} משתמשים הוסרו מהקבוצה`);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error removing users:", error);
      toast.error("שגיאה בהסרת משתמשים");
    }
  };

  const handleAddUsers = async (groupId: string, userIds: string[]) => {
    try {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      const newMembers = Array.from(new Set([...group.members, ...userIds]));
      const updatedMembers = await groupService.updateGroupMembers(
        groupId,
        newMembers,
      );

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, members: updatedMembers } : g,
        ),
      );

      toast.success(`${userIds.length} משתמשים נוספו בהצלחה לקבוצה`);
    } catch (error) {
      console.error("Error adding users:", error);
      toast.error("שגיאה בהוספת משתמשים");
    }
  };

  const handleUpdateBannedItems = (groupId: string, items: BannedItem[]) => {
    setGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id === groupId) {
          return { ...g, bannedItems: items };
        }
        return g;
      }),
    );
    toast.success("פריטים חסומים עודכנו בהצלחה");
  };

  const handleEditGroup = (group: Group) => {
    setGroupToEdit(group);
    setEditedGroupName(group.name);
  };

  const saveEditedGroup = async () => {
    if (!groupToEdit) return;
    const trimmedName = editedGroupName.trim();

    if (!trimmedName) {
      toast.error("שם הקבוצה לא יכול להיות ריק");
      return;
    }

    if (trimmedName.length > MAX_GROUP_NAME_LEN) {
      toast.error(`שם הקבוצה ארוך מדי (מקסימום ${MAX_GROUP_NAME_LEN} תווים)`);
      return;
    }

    if (groups.some((g) => g.name === trimmedName && g.id !== groupToEdit.id)) {
      toast.error("כבר קיימת קבוצה עם שם זה");
      return;
    }

    try {
      await groupService.updateGroupName(groupToEdit.id, trimmedName);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupToEdit.id ? { ...g, name: trimmedName } : g,
        ),
      );

      toast.success("שם הקבוצה עודכן בהצלחה");
      setGroupToEdit(null);
      setEditedGroupName("");
    } catch (error: any) {
      console.error("Error updating group:", error);
      if (error.response?.status === 409) {
        toast.error("הקבוצה כבר קיימת במערכת");
      } else {
        toast.error("שגיאה בעדכון שם הקבוצה");
      }
    }
  };

  const handleDeleteGroup = (group: Group) => setGroupToDelete(group);
  const closeDeleteModal = () => setGroupToDelete(null);

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await groupService.deleteGroup(groupToDelete.id);

      setGroups((prevGroups) => {
        const newGroups = prevGroups.filter((g) => g.id !== groupToDelete.id);
        setSelectedGroup((prev) =>
          prev === groupToDelete.id ? newGroups[0]?.id || "" : prev,
        );
        return newGroups;
      });

      toast.info(`הקבוצה "${groupToDelete.name}" נמחקה בהצלחה`);
      setGroupToDelete(null);
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("שגיאה במחיקת הקבוצה");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffaf1] flex items-center justify-center">
        <div className="text-slate-700 text-xl">טוען קבוצות...</div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#fffaf1] p-4 sm:p-8 md:p-12 lg:p-16 pt-28 font-sans mt-12"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[5000px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-700 to-slate-600 text-white p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <Users className="w-8 h-8" />
              <h3 className="text-2xl font-medium">מרכז ניהול קבוצות</h3>
            </div>

            <div className="flex gap-4 sm:gap-12 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <div className="text-sm opacity-90">משתמשים בכל המערכת</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{groups.length}</div>
                <div className="text-sm opacity-90">מספר קבוצות</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-12">
          <GroupList
            groups={groups}
            users={users}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddGroup={openAddGroupModal}
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
            onRemoveUsers={handleRemoveUsersFromGroup}
          />
          <BannedItems
            currentGroupId={selectedGroup}
            currentGroupName={currentGroup?.name || ""}
            bannedItems={currentGroup?.bannedItems || []}
            onUpdateBannedItems={(items: BannedItem[]) =>
              handleUpdateBannedItems(selectedGroup, items)
            }
          />
        </div>
      </div>

      {/* Modals */}
      {showAddUsersModal && currentGroup && (
        <AddUsersModal
          group={currentGroup}
          allUsers={users}
          onClose={() => setShowAddUsersModal(false)}
          onAddUsers={handleAddUsers}
        />
      )}

      {showAddGroupModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeAddGroupModal}
        >
          <div
            className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="flex justify-start w-full mb-6">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
                <Users className="w-7 h-7" />
                <span>יצירת קבוצה חדשה</span>
              </h3>
            </div>

            {/* Input */}
            <div className="group mb-2">
              <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                שם הקבוצה
              </label>

              <input
                ref={inputRef}
                type="text"
                value={newGroupName}
                maxLength={MAX_GROUP_NAME_LEN}
                onChange={(e) =>
                  setNewGroupName(e.target.value.slice(0, MAX_GROUP_NAME_LEN))
                }
                placeholder="שם הקבוצה"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md text-right"
                aria-label="שם הקבוצה החדשה"
              />

              <div className="text-xs text-gray-500 mb-3">
                {newGroupName.length}/{MAX_GROUP_NAME_LEN}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={closeAddGroupModal}
                className="px-6 h-12 rounded-xl border-2 border-gray-300 transition-colors font-bold bg-white text-gray-700 hover:bg-gray-50"
              >
                ביטול
              </button>

              <button
                type="button"
                onClick={saveNewGroup}
                disabled={!newGroupName.trim()}
                className={`px-8 h-12 rounded-xl text-white transition-colors font-bold shadow-lg
            ${
              !newGroupName.trim()
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0D305B] to-[#15457a] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl"
            }`}
              >
                הוסף קבוצה
              </button>
            </div>
          </div>
        </div>
      )}

      {groupToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-start w-full mb-4">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
                <Users className="w-7 h-7" />
                <span>מחיקת קבוצה</span>
              </h3>
            </div>

            <p className="text-slate-700 mb-2">
              האם ברצונך למחוק את הקבוצה "{groupToDelete.name}"?
            </p>
            <small className="text-gray-500 block mb-6">
              לא ניתן לבטל פעולה זו לאחר מכן
            </small>

            {/* aligned buttons (no jump) */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 h-12 rounded-xl border-2 border-gray-300 font-bold bg-white text-gray-700 transition-colors hover:bg-gray-50"
              >
                ביטול
              </button>

              <button
                type="button"
                onClick={confirmDeleteGroup}
                className="flex-1 h-12 rounded-xl font-bold text-white transition-colors shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
              >
                מחיקה
              </button>
            </div>
          </div>
        </div>
      )}

      {groupToEdit && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setGroupToEdit(null)}
        >
          <div
            className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-start w-full mb-6">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
                <Users className="w-7 h-7" />
                <span>עריכת שם הקבוצה</span>
              </h3>
            </div>

            <input
              type="text"
              value={editedGroupName}
              maxLength={MAX_GROUP_NAME_LEN}
              onChange={(e) =>
                setEditedGroupName(e.target.value.slice(0, MAX_GROUP_NAME_LEN))
              }
              placeholder="שם חדש לקבוצה"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md text-right"
            />

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => setGroupToEdit(null)}
                className="px-6 h-12 rounded-xl border-2 border-gray-300 transition-colors font-bold bg-white text-gray-700 hover:bg-gray-50"
              >
                ביטול
              </button>

              <button
                type="button"
                onClick={saveEditedGroup}
                className="px-8 h-12 rounded-xl text-white transition-colors font-bold shadow-lg bg-gradient-to-r from-[#0D305B] to-[#15457a] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupControl;
