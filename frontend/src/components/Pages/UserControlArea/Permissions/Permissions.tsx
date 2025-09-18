
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleGeneralAccessToggle = () => {
    setUserPermissions(prev => ({
      ...prev,
      generalAccess: !prev.generalAccess
    }));
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

          {/* Specific Users Input */}
          <div className="input-section">
            <Label htmlFor="specific-users" className="input-label">
              המלקה מוסתרת מ:
            </Label>
            <Input
              id="specific-users"
              value={userPermissions.specificUsers}
              onChange={(e) => handleSpecificUsersChange(e.target.value)}
              className="users-input"
              placeholder="הכנס שמות משתמשים..."
            />
          </div>

          {/* Expand/Collapse Button */}
          <div className="expand-section">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            >
              <span>משתמשים ספציפיים:</span>
              {isExpanded ? (
                <ChevronUp className="expand-icon" />
              ) : (
                <ChevronDown className="expand-icon" />
              )}
            </Button>
          </div>

          {/* Only Registered Toggle */}
          <div className="registered-section">
            <Label htmlFor="only-registered" className="registered-label">
              רק למשתמשי הקבוצות:
            </Label>
            <Switch
              id="only-registered"
              checked={userPermissions.onlyRegistered}
              onCheckedChange={handleOnlyRegisteredToggle}
              className="registered-switch"
            />
          </div>

          {/* Expandable Permissions */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="permissions-list-container"
              >
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
                        className="permission-switch"
                      />
                    </div>
                  ))}
                </div>
               
                {/* Additional Options */}
                <div className="additional-options">
                  <span className="options-text">ללחץ ליצירת קבוצה</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Button variant="outline" className="cancel-button">
              ביטול
            </Button>
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