import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Users, Shield, FileText, Settings, Trash2, Eye, Database, BarChart, Save, ChevronLeft, AlertCircle, Zap, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for the links

// --- NEW DATA STRUCTURES FOR BANNED ITEMS ---
// ---------------------------------------------
type BannedEntityType = 'product' | 'category' | 'subcategory';

interface BannedItem {
  id: number | string;
  name: string;
  type: BannedEntityType;
}

// Mock data for banned items (combining names from your mock data)
const mockBannedItems: BannedItem[] = [
  { id: 1, name: "מצלמה דיגיטלית Canon EOS 250D DSLR", type: 'product' },
  { id: 4, name: "מצלמה דיגיטלית ללא מראה Canon EOS R100", type: 'product' },
  { id: "cat_2", name: "הקלטה", type: 'category' },
  { id: "sub_cat_7", name: "עדשות EF", type: 'subcategory' },
];

// --- INTERFACES (UPDATED GROUP INTERFACE) ---
// --------------------------------------------
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  groups: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  // NEW: The list of items blocked for this group
  bannedItems: BannedItem[];
}

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

// --- NEW MODAL COMPONENT ---
// ---------------------------

interface AddUsersModalProps {
    group: Group;
    allUsers: User[];
    onClose: () => void;
    onAddUsers: (groupId: string, userIds: string[]) => void;
}

const AddUsersModal: React.FC<AddUsersModalProps> = ({ group, allUsers, onClose, onAddUsers }) => {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [modalSearch, setModalSearch] = useState('');

    // Users not in the current group, filtered by search
    const usersNotInGroup = useMemo(() => {
        return allUsers
            .filter(user => !user.groups.includes(group.id))
            .filter(user => 
                modalSearch === '' || 
                user.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
                user.email.toLowerCase().includes(modalSearch.toLowerCase())
            );
    }, [allUsers, group.id, modalSearch]);

    const handleCheckboxChange = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
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

                <div className="max-h-64 overflow-y-auto space-y-2 mb-6 pr-2">
                    {usersNotInGroup.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>{modalSearch ? 'לא נמצאו משתמשים תואמים.' : 'כל המשתמשים הפוטנציאליים כבר בקבוצה זו.'}</p>
                        </div>
                    ) : (
                        usersNotInGroup.map(user => (
                            <div 
                                key={user.id} 
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleCheckboxChange(user.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => handleCheckboxChange(user.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-5 h-5 text-slate-700 rounded focus:ring-slate-700"
                                    />
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                        {user.avatar}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <h4 className="font-medium">{user.name}</h4>
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


// --- MAIN COMPONENT ---
// ----------------------

const GroupControl = () => {
    const navigate = useNavigate();
    const [selectedGroup, setSelectedGroup] = useState('group1');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddGroupModal, setShowAddGroupModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // NEW: State for the "Add Users" modal
    const [showAddUsersModal, setShowAddUsersModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
    const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
    const [saveMessage, setSaveMessage] = useState('');

    const [groups, setGroups] = useState<Group[]>([
        { id: 'group1', name: 'קבוצה 1', description: 'קבוצת גישה ראשית', userCount: 12, permissions: [], bannedItems: [mockBannedItems[0], mockBannedItems[2]] },
        { id: 'group2', name: 'קבוצה 2', description: 'קבוצת גישה משנית', userCount: 28, permissions: [], bannedItems: [mockBannedItems[1], mockBannedItems[3], mockBannedItems[2]] },
        { id: 'group3', name: 'קבוצה 3', description: 'קבוצת משתמשים סטנדרטית', userCount: 45, permissions: [], bannedItems: [] },
        { id: 'group4', name: 'קבוצה 4', description: 'קבוצת גישה מוגבלת', userCount: 71, permissions: [], bannedItems: [mockBannedItems[1]] },
        { id: 'group5', name: 'קבוצה 5', description: 'קבוצת גישה מותאמת', userCount: 15, permissions: [], bannedItems: [mockBannedItems[0], mockBannedItems[3]] },
    ]);

    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'ג׳ון סמית׳', email: 'john.smith@system.com', avatar: 'JS', groups: ['group1', 'group2'] },
        { id: '2', name: 'שרה מילר', email: 'sarah.miller@system.com', avatar: 'SM', groups: ['group1'] },
        { id: '3', name: 'רוברט ג׳ונסון', email: 'robert.j@system.com', avatar: 'RJ', groups: ['group1', 'group5'] },
        { id: '4', name: 'אמה וילסון', email: 'emma.w@system.com', avatar: 'EW', groups: ['group1'] },
        { id: '5', name: 'מייקל בראון', email: 'michael.b@system.com', avatar: 'MB', groups: ['group1', 'group3'] },
        { id: '6', name: 'ליסה דייוויס', email: 'lisa.d@system.com', avatar: 'LD', groups: ['group1'] },
        { id: '7', name: 'יואב כהן', email: 'yoav.c@system.com', avatar: 'YK', groups: ['group2'] },
        { id: '8', name: 'נטע לוי', email: 'neta.l@system.com', avatar: 'NL', groups: ['group3', 'group4'] },
        { id: '9', name: 'איתי מזרחי', email: 'itay.m@system.com', avatar: 'AM', groups: [] }, // User not in any group
    ]);

    // Permissions logic remains the same
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([
        {
            name: 'ניהול משתמשים',
            icon: <Shield className="w-4 h-4" />,
            permissions: [
                { id: 'create_users', category: 'user_mgmt', name: 'יצירת משתמשים', description: '', icon: <Users className="w-4 h-4" />, enabled: false },
                { id: 'edit_users', category: 'user_mgmt', name: 'עריכת משתמשים', description: '', icon: <ChevronLeft className="w-4 h-4" />, enabled: false },
                { id: 'delete_users', category: 'user_mgmt', name: 'מחיקת משתמשים', description: '', icon: <Trash2 className="w-4 h-4" />, enabled: false },
            ]
        },
        {
            name: 'תכנים',
            icon: <FileText className="w-4 h-4" />,
            permissions: [
                { id: 'view_content', category: 'content', name: 'צפייה בתוכן', description: '', icon: <Eye className="w-4 h-4" />, enabled: false },
                { id: 'create_content', category: 'content', name: 'יצירת תוכן', description: '', icon: <FileText className="w-4 h-4" />, enabled: false },
                { id: 'publish_content', category: 'content', name: 'פרסום תוכן', description: '', icon: <Save className="w-4 h-4" />, enabled: false },
            ]
        },
        {
            name: 'מערכת',
            icon: <Settings className="w-4 h-4" />,
            permissions: [
                { id: 'system_settings', category: 'system', name: 'הגדרות מערכת', description: '', icon: <Settings className="w-4 h-4" />, enabled: false },
                { id: 'view_analytics', category: 'system', name: 'צפייה באנליטיקה', description: '', icon: <BarChart className="w-4 h-4" />, enabled: false },
                { id: 'database_access', category: 'system', name: 'גישה לבסיס נתונים', description: '', icon: <Database className="w-4 h-4" />, enabled: false },
            ]
        }
    ]);

    // Get the currently selected group object
    const currentGroup = useMemo(() => groups.find(g => g.id === selectedGroup), [groups, selectedGroup]);

    // Memoized list of users currently in the selected group and matching search query
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const inGroup = user.groups.includes(selectedGroup);
            const matchesSearch = searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            return inGroup && matchesSearch;
        });
    }, [users, selectedGroup, searchQuery]);

    // Calculation of totals
    const totalUsers = useMemo(() => new Set(users.map(u => u.id)).size, [users]);
    const activeBlocksCount = useMemo(() => 
        permissionCategories.reduce((total, category) => total + category.permissions.filter(p => p.enabled).length, 0), 
        [permissionCategories]
    );

    // Function to determine the display name for the Banned Item type
    const getTypeDisplayName = useCallback((type: BannedEntityType): string => {
        switch (type) {
            case 'product': return 'מוצר';
            case 'category': return 'קטגוריה';
            case 'subcategory': return 'תת קטגוריה';
            default: return '';
        }
    }, []);

    // --- HANDLERS ---

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
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleRemoveUsersFromGroup = () => {
        if (selectedUsers.size === 0) return;
        
        // Update users: remove selectedGroup from their groups array
        setUsers(prevUsers => prevUsers.map(u => {
            if (selectedUsers.has(u.id)) {
                return {
                    ...u,
                    groups: u.groups.filter(gid => gid !== selectedGroup)
                };
            }
            return u;
        }));
        
        setSelectedUsers(new Set());
        setSaveMessage(`${selectedUsers.size} משתמשים הוסרו מהקבוצה`);
        setTimeout(() => setSaveMessage(''), 3000);
    };

    // NEW: Handler for adding users from the modal
    const handleAddUsers = (groupId: string, userIds: string[]) => {
        // 1. Update users: add groupId to the groups array of selected users
        setUsers(prevUsers => prevUsers.map(u => {
            if (userIds.includes(u.id) && !u.groups.includes(groupId)) {
                return {
                    ...u,
                    groups: [...u.groups, groupId]
                };
            }
            return u;
        }));

        setSaveMessage(`${userIds.length} משתמשים נוספו בהצלחה לקבוצה`);
        setTimeout(() => setSaveMessage(''), 3000);
    };


    const handleSaveChanges = () => {
        // Here you would save group permissions and user membership changes
        setSaveMessage('השינויים נשמרו בהצלחה');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const closeAllModals = () => {
        setShowAddGroupModal(false);
        setShowDeleteModal(false);
        setShowEditModal(false);
        // NEW: Close Add Users Modal
        setShowAddUsersModal(false); 
        // ... (other resets)
        setGroupToDelete(null);
        setGroupToEdit(null);
        setNewGroupName('');
        setNewGroupDescription('');
    };

    // Handlers for Delete/Edit/Create group remain the same...

    const handleDeleteGroup = (group: Group) => {
        setGroupToDelete(group);
        setShowDeleteModal(true);
    };

    const confirmDeleteGroup = () => {
        if (groupToDelete) {
            setUsers(users.map(user => ({
                ...user,
                groups: user.groups.filter(g => g !== groupToDelete.id)
            })));
            
            const remainingGroups = groups.filter(g => g.id !== groupToDelete.id);
            setGroups(remainingGroups);
            
            if (selectedGroup === groupToDelete.id && remainingGroups.length > 0) {
                setSelectedGroup(remainingGroups[0].id);
            } else if (remainingGroups.length === 0) {
                setSelectedGroup('');
            }
        }
        setShowDeleteModal(false);
        setGroupToDelete(null);
        setSaveMessage('הקבוצה נמחקה בהצלחה');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleEditGroup = (group: Group) => {
        setGroupToEdit({ ...group });
        setShowEditModal(true);
    };

    const handleSaveEditGroup = () => {
        if (groupToEdit && groupToEdit.name.trim()) {
            setGroups(groups.map(g => g.id === groupToEdit.id ? groupToEdit : g));
            setShowEditModal(false);
            setGroupToEdit(null);
            setSaveMessage('הקבוצה עודכנה בהצלחה');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleSaveNewGroup = () => {
        if (newGroupName.trim()) {
            const newGroup: Group = {
                id: `group${Date.now()}`,
                name: newGroupName.trim(),
                description: newGroupDescription.trim(),
                userCount: 0,
                permissions: [],
                bannedItems: [] // New groups start with no banned items
            };
            setGroups([...groups, newGroup]);
            setShowAddGroupModal(false);
            setNewGroupName('');
            setNewGroupDescription('');
            setSaveMessage('הקבוצה נוספה בהצלחה');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };


    // The togglePermission logic is not strictly needed for this column change, but kept for completeness
    const togglePermission = (categoryIndex: number, permissionIndex: number) => {
        const newCategories = [...permissionCategories];
        newCategories[categoryIndex].permissions[permissionIndex].enabled =
            !newCategories[categoryIndex].permissions[permissionIndex].enabled;
        setPermissionCategories(newCategories);
    };


    return (
        <div dir="rtl" className="min-h-screen bg-gray-100 p-4 sm:p-8 md:p-12 lg:p-16 pt-28 font-sans">
            {/* הודעת הצלחה */}
            {saveMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse">
                    <Save className="w-5 h-5" />
                    {saveMessage}
                </div>
            )}

            <div className="mb-8 text-right">
                <h2 className="text-4xl sm:text-5xl font-light text-slate-700 mb-2 tracking-tight">ניהול קבוצות והרשאות</h2>
                <p className="text-sm text-gray-500">מערכת לקביעת מי יכול לצפות ולאיזה משאבים — ברירת המחדל: כולם רואים. כאן חוסמים גישה.</p>
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
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {activeBlocksCount > 0 && (
                                        <span className="text-red-300">{activeBlocksCount}/</span>
                                    )}
                                    {permissionCategories.reduce((acc, c) => acc + c.permissions.length, 0)}
                                </div>
                                <div className="text-sm opacity-90">חסימות פעילות</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12">
                    {/* עמודה 1: ניווט קבוצות (Groups List) */}
                    <div className="col-span-12 lg:col-span-3 bg-gray-50 border-l lg:border-r border-gray-200 p-6 text-right order-1 lg:order-1">
                        {/* ... (Group list rendering remains the same) ... */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-700">קבוצות</h3>
                            <button
                                onClick={() => setShowAddGroupModal(true)}
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
                                        onClick={() => setSelectedGroup(group.id)}
                                        onDoubleClick={() => handleEditGroup(group)}
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
                                                    handleDeleteGroup(group);
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
                                                <p className="text-sm text-gray-600 mt-1 truncate max-w-[150px]">{group.description}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full whitespace-nowrap">
                                                {users.filter(u => u.groups.includes(group.id)).length} משתמשים
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* עמודה 2: רשימת משתמשים בקבוצה (Users List) */}
                    <div className="col-span-12 lg:col-span-5 p-6 border-r border-gray-200 text-right order-2 lg:order-2">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                משתמשים ב־<span className="text-slate-700 underline">{currentGroup?.name || '...'}</span>
                            </h3>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="חפש משתמש לפי שם או אימייל..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="mb-4 flex justify-between items-center">
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-slate-700 hover:text-slate-600 font-medium underline"
                                disabled={filteredUsers.length === 0}
                            >
                                {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? 'בטל בחירה' : 'בחר הכל'}
                            </button>
                            <span className="text-sm text-gray-600">
                                נמצאו {filteredUsers.length} משתמשים
                            </span>
                        </div>
                        
                        {/* NEW: Button for adding users */}
                        <button
                            onClick={() => currentGroup && setShowAddUsersModal(true)}
                            disabled={!currentGroup}
                            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            הוסף משתמשים לקבוצה
                        </button>
                        
                        {/* Users List Rendering */}
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
                                        onClick={() => toggleUserSelection(user.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                            selectedUsers.has(user.id)
                                                ? 'bg-slate-50 border-slate-400 shadow-md'
                                                : 'bg-white border-gray-200 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-5 h-5 text-slate-700 rounded focus:ring-slate-700"
                                        />

                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {user.avatar}
                                        </div>

                                        <div className="flex-1 text-right min-w-0">
                                            <h4 className="font-semibold text-gray-800 truncate">{user.name}</h4>
                                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                        </div>

                                        <div className="flex flex-wrap justify-end gap-2">
                                            {user.groups.map((groupId) => {
                                                const group = groups.find(g => g.id === groupId);
                                                return group ? (
                                                    <span
                                                        key={groupId}
                                                        className={`px-2 py-1 text-xs rounded-md whitespace-nowrap ${groupId === selectedGroup ? 'bg-slate-700 text-white font-medium' : 'bg-gray-100 text-gray-700'}`}
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

                    {/* עמודה 3: ניהול הרשאות (Banned Items Column) */}
                    <div className="col-span-12 lg:col-span-4 bg-gray-50 p-6 text-right order-3 lg:order-3">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Ban className="w-5 h-5 text-red-600" />
                            ניהול הרשאות (חסימת משאבים)
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">רשימת הפריטים (מוצרים, קטגוריות, תת־קטגוריות) ש **חסומים** לקבוצה זו.</p>

                        <div className="bg-white rounded-xl p-5 shadow-lg max-h-[500px] lg:max-h-[700px] overflow-y-auto pr-2">
                            <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                                חסימות עבור: <span className="text-slate-700">{currentGroup?.name || '...'}</span>
                            </h4>
                            
                            {currentGroup && currentGroup.bannedItems.length > 0 ? (
                                <ul className="space-y-3 list-disc pr-5">
                                    {currentGroup.bannedItems.map((item) => (
                                        <li key={item.id} className="text-sm">
                                            <span className="font-medium text-red-600 ml-1">חסום:</span>
                                            {/* Link to permissions page: jump to /Permissions for now */}
                                            <a
                                                href={`/Permissions?id=${item.id}&type=${item.type}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/Permissions?id=${item.id}&type=${item.type}`);
                                                }}
                                                className="text-slate-700 hover:text-slate-600 underline transition-colors cursor-pointer"
                                            >
                                                {item.name}
                                            </a>
                                            <span className="text-gray-500 text-xs mr-2">
                                                ({getTypeDisplayName(item.type)})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Shield className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                                    <p>אין חסימות פעילות בקבוצה זו.</p>
                                    <p className="text-xs mt-1">ברירת המחדל היא **גישה מלאה**.</p>
                                </div>
                            )}

                            {/* Placeholder for adding/managing banned items (Database pull) */}
                            <button
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 shadow-md text-sm font-medium"
                            >
                                <Database className="w-4 h-4" />
                                נהל פריטים חסומים 
                            </button>
                        </div>
                    </div>
                </div>

                {/* פוטר פעולות המוניות */}
                <div className="bg-white border-t border-gray-200 px-4 sm:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-gray-600 text-sm">
                            {selectedUsers.size === 0
                                ? 'לא נבחרו משתמשים'
                                : `${selectedUsers.size} משתמשים נבחרו`}
                        </span>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                className="flex-1 sm:flex-none px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                                onClick={handleRemoveUsersFromGroup}
                                disabled={selectedUsers.size === 0}
                            >
                                הסר מהקבוצה
                            </button>

                            <button
                                className="flex-1 sm:flex-none px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 hover:shadow-lg transition-all text-sm font-medium"
                                onClick={handleSaveChanges}
                            >
                                שמור שינויים
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* מודל הוספת משתמשים (NEW) */}
            {showAddUsersModal && currentGroup && (
                <AddUsersModal
                    group={currentGroup}
                    allUsers={users}
                    onClose={() => setShowAddUsersModal(false)}
                    onAddUsers={handleAddUsers}
                />
            )}

            {/* מודל הוספת קבוצה (Existing) */}
            {showAddGroupModal && (
                // ... (Add Group Modal JSX) ...
                <div
                    className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4"
                    onClick={closeAllModals}
                >
                    <div
                        className="bg-white p-8 rounded-xl w-full sm:w-96 max-w-[90%] shadow-2xl transform transition-all text-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight text-center">
                            הוספת קבוצה חדשה
                        </h4>

                        <input
                            type="text"
                            placeholder="שם הקבוצה"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
                            autoFocus
                        />

                        <textarea
                            placeholder="תיאור הקבוצה"
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 resize-none"
                            rows={3}
                        />

                        <div className="flex justify-between gap-3">
                            <button
                                onClick={handleSaveNewGroup}
                                disabled={!newGroupName.trim()}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                שמור
                            </button>
                            <button
                                onClick={closeAllModals}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                בטל
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* מודל עריכת קבוצה (Existing) */}
            {showEditModal && groupToEdit && (
                // ... (Edit Group Modal JSX) ...
                <div
                    className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4"
                    onClick={closeAllModals}
                >
                    <div
                        className="bg-white p-8 rounded-xl w-full sm:w-96 max-w-[90%] shadow-2xl transform transition-all text-right"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="m-0 mb-5 text-xl text-slate-700 font-semibold tracking-tight text-center">
                            עריכת קבוצה: {groupToEdit.name}
                        </h4>

                        <input
                            type="text"
                            placeholder="שם הקבוצה"
                            value={groupToEdit.name}
                            onChange={(e) => setGroupToEdit({ ...groupToEdit, name: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10"
                            autoFocus
                        />

                        <textarea
                            placeholder="תיאור הקבוצה"
                            value={groupToEdit.description}
                            onChange={(e) => setGroupToEdit({ ...groupToEdit, description: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-5 text-base transition-all duration-200 outline-none focus:border-slate-700 focus:ring focus:ring-slate-700 focus:ring-opacity-10 resize-none"
                            rows={3}
                        />

                        <div className="flex justify-between gap-3">
                            <button
                                onClick={handleSaveEditGroup}
                                disabled={!groupToEdit.name.trim()}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-slate-700 text-white shadow-md hover:bg-slate-600 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                שמור שינויים
                            </button>
                            <button
                                onClick={closeAllModals}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                בטל
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* מודל מחיקת קבוצה (Existing) */}
            {showDeleteModal && groupToDelete && (
                // ... (Delete Group Modal JSX) ...
                <div
                    className="fixed inset-0 bg-slate-900 bg-opacity-85 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4"
                    onClick={closeAllModals}
                >
                    <div
                        className="bg-white p-8 rounded-xl w-full sm:w-96 max-w-[90%] shadow-2xl text-center transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h4 className="m-0 mb-3 text-xl text-slate-700 font-semibold tracking-tight">
                            מחיקת קבוצה
                        </h4>
                        <p className="text-slate-700 mb-2 text-right">
                            האם את בטוחה שברצונך למחוק את קבוצת <strong className="font-bold text-red-600">{groupToDelete.name}</strong>?
                        </p>
                        <p className="text-sm text-gray-500 mb-5 text-right">
                            פעולה זו היא בלתי הפיכה ותסיר את הקבוצה מכל המשתמשים המשויכים אליה.
                        </p>

                        <div className="flex justify-between gap-3">
                            <button
                                onClick={confirmDeleteGroup}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-red-600 text-white shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                מחק לצמיתות
                            </button>
                            <button
                                onClick={closeAllModals}
                                className="flex-1 p-3 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-300 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                בטל
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupControl;