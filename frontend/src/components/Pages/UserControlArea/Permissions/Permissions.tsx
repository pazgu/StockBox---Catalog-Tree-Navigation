import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "../../../ui/switch";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useNavigate } from "react-router-dom";

import camera from '../../../../assets/camera.png'
import AddGroup from '../AddGroup/AddGroup/AddGroup';
import { useUser } from "../../../../context/UserContext";


interface Group {
  name: string;
  members: string[];
  enabled: boolean;
}

interface User {
  name: string;
  enabled: boolean;
}

interface PermissionItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface UserPermissions {
  generalAccess: boolean;
  specificUsers: string;
  onlyRegistered: boolean;
  permissions: PermissionItem[];
}

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const [isExpandedUsers, setIsExpandedUsers] = useState(false);
  const [isExpandedGroups, setIsExpandedGroups] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([
    { name: "Alice", enabled: false },
    { name: "Bob", enabled: false },
    { name: "Charlie", enabled: false },
    { name: "Dana", enabled: false },
  ]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    generalAccess: false,
    specificUsers: "",
    onlyRegistered: true,
    permissions: [
      { id: "finance", label: "פיננסים", enabled: false },
      { id: "hr", label: "משאבי אנוש", enabled: false },
      { id: "security", label: "אבטחה", enabled: false },
    ],
  });
  const [isOpen, setIsOpen] = useState(false);
  const {role}=useUser();

useEffect(() => {

    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handlePermissionToggle = (permissionId: string) => {
    setUserPermissions((prev) => ({
      ...prev,
      permissions: prev.permissions.map((permission) =>
        permission.id === permissionId
          ? { ...permission, enabled: !permission.enabled }
          : permission
      ),
    }));
  };

  const handleUserToggle = (name: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.name === name ? { ...user, enabled: !user.enabled } : user
      )
    );
  };

  const handleGroupToggle = (groupName: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.name === groupName ? { ...group, enabled: !group.enabled } : group
      )
    );
  };

  const handleGeneralAccessToggle = () => {
    setUserPermissions((prev) => ({
      ...prev,
      generalAccess: !prev.generalAccess,
    }));
    setIsExpandedUsers(false);
    setIsExpandedGroups(false);
  };

  const handleOnlyRegisteredToggle = () => {
    setUserPermissions((prev) => ({
      ...prev,
      onlyRegistered: !prev.onlyRegistered,
    }));

  };

  return (
    <div className="rtl px-5 md:px-16 py-[149px] md:py-40 min-h-screen flex justify-center font-sans">
      <Card className="w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-xl shadow-md">
        <CardContent className="p-6 md:p-6">
          {/* Header with Avatar */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-5">
            <div className="flex-shrink-0">
              <img
                src={camera}
                alt="User permissions"
                className="w-20 h-20 md:w-20 md:h-20 rounded-full object-cover border-3 border-white shadow-md"
              />
            </div>
            <div className="flex-1 text-right">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                ניהול הרשאות עבור: קטגורית שמע
              </h2>

              <Label className="block mb-3 font-bold text-gray-800 text-base">
                מוסתרת מ:
              </Label>
              <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
                <Label
                  htmlFor="general-access"
                  className="text-sm font-medium text-gray-700"
                >
                  כל המשתמשים
                </Label>
                <Switch
                  id="general-access"
                  checked={userPermissions.generalAccess}
                  onCheckedChange={handleGeneralAccessToggle}
                  className="ltr"
                />
              </div>
            </div>
          </div>

          {!userPermissions.generalAccess && (
            <>
          {/* Expand Users */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => setIsExpandedUsers(!isExpandedUsers)}
              className="flex justify-between items-center w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>משתמשים ספציפיים:</span>
              {isExpandedUsers ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <AnimatePresence>
              {isExpandedUsers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2"
                >
                  <Label
                    htmlFor="user-search"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    חפש משתמש:
                  </Label>
                  <input
                    id="user-search"
                    type="text"
                    placeholder="הקלד שם..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full p-2 mb-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-900 focus:border-indigo-900"
                  />
                  <Label
                    htmlFor="only-registered"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    מוסתרת מהמשתמשים:
                  </Label>
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.name}
                        className="flex justify-between items-center px-4 py-3 border-b last:border-b-0"
                      >
                        <Label
                          htmlFor={user.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          {user.name}
                        </Label>
                        <Switch
                          id={user.name}
                          checked={user.enabled}
                          onCheckedChange={() => handleUserToggle(user.name)}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expand Groups */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => setIsExpandedGroups(!isExpandedGroups)}
              className="flex justify-between items-center w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>קבוצות ספציפיות:</span>
              {isExpandedGroups ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <AnimatePresence>
              {isExpandedGroups && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2"
                >
                  <Label className="block mb-2 text-sm font-medium text-gray-700">
                    מוסתרת מהקבוצות:
                  </Label>
                  <div className="bg-white border border-gray-200 rounded-lg">
                    {userPermissions.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex justify-between items-center px-4 py-3 border-b last:border-b-0"
                      >
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium text-gray-700"
                        >
                          {permission.label}
                        </Label>
                        <Switch
                          id={permission.id}
                          checked={permission.enabled}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.id)
                          }
                        />
                      </div>
                    ))}
                    {groups.map((group, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center px-4 py-3 border-b last:border-b-0"
                      >
                        <Label
                          htmlFor={`group-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          {group.name}
                        </Label>
                        <Switch
                          id={`group-${index}`}
                          checked={group.enabled}
                          onCheckedChange={() => handleGroupToggle(group.name)} // Use the new group-specific handler
                          disabled={!userPermissions.generalAccess}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add Group Button */}
                  <div className="flex justify-center mt-4">
                  <button
    className="px-2 py-1 bg-indigo-900 text-white text-sm rounded-sm hover:bg-indigo-800 transition"
    onClick={() => setIsOpen(true)}
>
    לחץ להוסיף קבוצה
</button>
                    {isOpen && (
                    <AddGroup
                        onClose={() => setIsOpen(false)}
                        onSave={(newGroup: Group) => {
                          setGroups(prev => [...prev, { ...newGroup, enabled: false }]); 
                          setIsOpen(false);
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row md:justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="px-6 py-2 w-full md:w-auto border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400"
              onClick={() => navigate(-1)}
            >
              ביטול
            </Button>
            <Button className="px-6 py-2 w-full md:w-auto bg-green-500 text-white rounded hover:bg-green-600">
              שמירה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;
