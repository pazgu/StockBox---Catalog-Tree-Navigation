
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '../../../ui/switch';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';

import './Permissions.css';
import camera from '../../../../assets/camera.png'
import AddCat from '../../CatArea/AddCat/AddCat';
interface Group {
  name: string;
  members: string[];
  enabled: boolean;

}

interface User {
  name: string;
  enabled: boolean
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
  const [isExpandedUsers, setIsExpandedUsers] = useState(false);
    const [isExpandedGroups, setIsExpandedGroups] = useState(false);
const [userSearch, setUserSearch] = useState('');

    const [groups, setGroups] = useState<Group[]>([]);
const [users, setUsers] = useState<User[]>([
  { name: "Alice",enabled:true },
  { name: "Bob" ,enabled:true },
  { name: "Charlie" ,enabled:true },
  { name: "Dana" ,enabled:true },
]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    generalAccess: true,
    specificUsers: '',
    onlyRegistered: true,
    permissions: [
      { id: 'finance', label: 'פיננסים', enabled: true },
      { id: 'hr', label: 'משאבי אנוש', enabled: true },
      { id: 'security', label: 'אבטחה', enabled: true }
    ]
  });
  const [isOpen, setIsOpen] = useState(false);
const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(userSearch.toLowerCase())
);

  const handlePermissionToggle = (permissionId: string) => {
    setUserPermissions(prev => ({
      ...prev,
      permissions: prev.permissions.map(permission =>
        permission.id === permissionId
          ? { ...permission, enabled: !permission.enabled }
          : permission
      )
    }));
  };
   const handleUserToggle = (name: string) => {
  setUsers(prev =>
    prev.map(user =>
      user.name === name ? { ...user, enabled: !user.enabled } : user
    )
  );
};

  const handleGeneralAccessToggle = () => {
  setUserPermissions(prev => {
    const newGeneralAccess = !prev.generalAccess;

    // // Disable all users if generalAccess is turned off
    // setUsers(prevUsers =>
    //   prevUsers.map(user => ({
    //     ...user,
    //     enabled: newGeneralAccess ? user.enabled : false,
    //   }))
    // );

    // // Disable all groups if generalAccess is turned off
    // setGroups(prevGroups =>
    //   prevGroups?.map(group => ({
    //     ...group,
    //     enabled: newGeneralAccess ? group.enabled : false, // make sure group has an enabled property
    //   }))
    // );

    return { ...prev, generalAccess: newGeneralAccess };
  });
};


  const handleOnlyRegisteredToggle = () => {
    setUserPermissions(prev => ({
      ...prev,
      onlyRegistered: !prev.onlyRegistered
    }));
  };

  const handleSpecificUsersChange = (value: string) => {
    setUserPermissions(prev => ({
      ...prev,
      specificUsers: value
    }));
  };

  return (
    <div className="permissions-container">
      <Card className="permissions-card">
        <CardContent className="permissions-content">
          {/* Header with Avatar */}
          <div className="permissions-header">
            <div className="avatar-container">
              <img
                src={camera}
                alt="User permissions"
                className="avatar-image"
              />
            </div>
            <div className="header-text">
              <h2 className="permissions-title">ניהול הרשאות עבור: קטגורית שמע</h2>
             
              {/* General Access Toggle */}
             <Label className="mb-20 text-base font-bold text-gray-800">
          מוסתרת מ:
        </Label>

              <div className="access-control">
                 
                <Label htmlFor="general-access" className="access-label">
                  כל המשתמשים
                </Label>
                <Switch
                  id="general-access"
                  checked={userPermissions.generalAccess}
                  onCheckedChange={handleGeneralAccessToggle}
                  className="access-switch"
                />
              </div>
            </div>
          </div>

         

          {/* Expand/Collapse Button */}
          <div className="expand-section">
            <Button
              variant="ghost"
              onClick={() => setIsExpandedUsers(!isExpandedUsers)}
              className="expand-button"
            >
              <span>משתמשים ספציפיים:</span>
              {isExpandedUsers ? (
                <ChevronUp className="expand-icon" />
              ) : (
                <ChevronDown className="expand-icon" />
              )}
            </Button>
          
            
          </div>
          <AnimatePresence>
  {isExpandedUsers && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="permissions-list-container"
    >
      <Label htmlFor="user-search" className="registered-label mb-5">
        חפש משתמש:
      </Label>
      <input
        id="user-search"
        type="text"
        placeholder="הקלד שם..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        className="mb-3 mt-3 p-2 border border-gray-300 rounded w-full text-sm"
      />

      <Label htmlFor="only-registered" className="registered-label mb-2">
        מוסתרת מהמשתמשים:
      </Label>

      <div className="permissions-list">
        {filteredUsers.map((user) => (
          <div key={user.name} className="permission-item">
            <Label htmlFor={user.name} className="permission-label">
              {user.name}
            </Label>
            <Switch
              id={user.name}
              checked={user.enabled}
              onCheckedChange={() => handleUserToggle(user.name)}
              disabled={!userPermissions.generalAccess}
              className="permission-switch"
            />
          </div>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>


          {/* Only Registered Toggle */}
          
            <div className="expand-section">
            <Button
              variant="ghost"
              onClick={() => setIsExpandedGroups(!isExpandedGroups)}
              className="expand-button"
            >
              <span>קבוצות ספציפיות:</span>
              {isExpandedGroups ? (
                <ChevronUp className="expand-icon" />
              ) : (
                <ChevronDown className="expand-icon" />
              )}
            </Button>
          </div>
          {/* Expandable Permissions */}
        
          <AnimatePresence>
            {isExpandedGroups
            
            &&(
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="permissions-list-container"
              >
                  <Label htmlFor="only-registered" className="registered-label">
                    מוסתרת מהקבוצות:
            </Label>
            
                <div className="permissions-list">
                  {userPermissions.permissions.map((permission) => (
                    <div key={permission.id} className="permission-item">
                      <Label
                        htmlFor={permission.id}
                        className="permission-label"
                      >
                        {permission.label}
                      </Label>
                      <Switch
                        id={permission.id}
                        checked={permission.enabled}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                          disabled={!userPermissions.generalAccess}

                        className="permission-switch"
                      />
                    </div>
                  ))}
                    {/* Render dynamic groups */}
                    {groups.map((group, index) => (
                      <div key={index} className="permission-item">
                        <Label htmlFor={`group-${index}`} className="permission-label">
                          {group.name}
                        </Label>
                        <Switch
                          id={`group-${index}`}
                          checked={userPermissions.onlyRegistered} // <-- or a per-group toggle if you want
                          onCheckedChange={handleOnlyRegisteredToggle}
                            disabled={!userPermissions.generalAccess}
                          className="permission-switch"
                        />
                      </div>
                    ))}
                </div>
               
                <div>
                  <div className="flex items-center justify-center mt-5">
                        <button
                          className="px-1 py-1 bg-blue-600 text-white text-sm rounded-sm"
                          onClick={() => setIsOpen(true)}
                        >
                          לחץ להוסיף קבוצה
                        </button>
                      </div>
                 {isOpen && (
                      <AddCat 
                        onClose={() => setIsOpen(false)} 
                        onSave={(newGroup: Group) => {
                          setGroups(prev => [...prev, newGroup]);
                          setIsOpen(false);
                        }} 
                      />
                    )}

            </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="action-buttons">
            <a href='/categories'>
            <Button variant="outline" className="cancel-button">
              ביטול
            </Button></a>
            <Button className="save-button">
              שמירה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;