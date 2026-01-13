import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "../../../ui/switch";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { permissionsService } from "../../../../services/permissions.service";

interface Group {
  _id: string;
  groupName: string;
  enabled: boolean;
}

interface ViewerUser {
  _id: string;
  userName: string;
  enabled: boolean;
}

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useUser();
  const { type, id } = useParams<{ type: string; id: string }>();
  const cleanId = useMemo(() => id?.replace(/^:/, ""), [id]);
  const [isExpandedUsers, setIsExpandedUsers] = useState(false);
  const [isExpandedGroups, setIsExpandedGroups] = useState(false);
  const [users, setUsers] = useState<ViewerUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [existingPermissions, setExistingPermissions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [generalAccess, setGeneralAccess] = useState(false);
  const [entityData, setEntityData] = useState<{
    name: string;
    image: string;
  } | null>(null);

  useEffect(() => {
    if (role !== "editor") {
      navigate("/");
      return;
    }
    const loadData = async () => {
      try {
        if (!cleanId || !type) return;

        const [perms, viewersData, entity] = await Promise.all([
          permissionsService.getPermissionsByEntity(cleanId),
          permissionsService.getPotentialViewers(),
          permissionsService.getEntityDetails(type as any, cleanId),
        ]);

        setEntityData(entity);
        setExistingPermissions(perms);

        const { users: rawUsers, groups: rawGroups } = viewersData;

        setUsers(
          rawUsers.map((u: any) => ({
            ...u,
            enabled: !perms.some((p: any) => p.allowed === u._id),
          }))
        );

        setGroups(
          rawGroups.map((g: any) => ({
            ...g,
            _id: g._id || g.id, 
            enabled: !perms.some((p: any) => p.allowed === (g._id || g.id)),
          }))
        );
      } catch (err) {
        console.error("Load Error:", err);
        toast.error("שגיאה בטעינת הנתונים");
      }
    };

    loadData();
  }, [cleanId, type, role, navigate]);

  const handleGeneralAccessToggle = () => {
    setGeneralAccess((prev) => !prev);
    setUsers((prev) => prev.map((u) => ({ ...u, enabled: !u.enabled })));
    setGroups((prev) => prev.map((g) => ({ ...g, enabled: !g.enabled })));
  };

  const handleToggle = (targetId: string, toggleType: "user" | "group") => {
    if (toggleType === "user") {
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u._id || (u as any).id; 
          return String(uId) === String(targetId)
            ? { ...u, enabled: !u.enabled }
            : u;
        })
      );
    } else {
      setGroups((prev) =>
        prev.map((g) => {
          const gId = g._id || (g as any).id; 
          return String(gId) === String(targetId)
            ? { ...g, enabled: !g.enabled }
            : g;
        })
      );
    }
  };

  const handleSave = async () => {
    try {
      if (!cleanId || !type) return;

      const usersToAllow = users
        .filter((u) => (generalAccess ? u.enabled : !u.enabled))
        .map((u) => u._id);
      const groupsToAllow = groups
        .filter((g) => (generalAccess ? g.enabled : !g.enabled))
        .map((g) => g._id);
      const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

      const currentDbIds = existingPermissions.map((p) => p.allowed);
      const toCreate = finalAllowedIds.filter(
        (allowedId) => !currentDbIds.includes(allowedId)
      );
      const toDelete = existingPermissions.filter(
        (p) => !finalAllowedIds.includes(p.allowed)
      );

      await Promise.all([
        ...toCreate.map((allowedId) =>
          permissionsService.createPermission(type, cleanId, allowedId)
        ),
        ...toDelete.map((p) => permissionsService.deletePermission(p._id)),
      ]);

      toast.success("השינויים נשמרו בהצלחה");
      navigate(-1);
    } catch (err) {
      toast.error("שגיאה בשמירת השינויים");
    }
  };

  return (
    <div
      className="rtl px-5 md:px-16 py-20 flex justify-center font-sans my-16"
      dir="rtl"
    >
      <Card className="w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-xl shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={entityData?.image || "/placeholder-image.png"}
                className="w-20 h-20 rounded-xl border-2 border-white shadow-lg object-cover bg-white"
                alt="entity-icon"
              />
              <span className="absolute -bottom-2 -left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                {type === "category" ? "קטגוריה" : "מוצר"}
              </span>
            </div>
            <div className="flex-1 text-right">
              <h2 className="text-xl font-bold text-gray-800">
                ניהול הרשאות עבור:{" "}
                <span className="text-blue-700">
                  {entityData?.name || "טוען..."}
                </span>
              </h2>
              <div className="flex justify-between items-center p-3 bg-white border rounded-lg mt-3 shadow-sm">
                <div className="flex flex-col">
                  <Label className="font-bold text-blue-900">
                    מוסתר מכל המשתמשים
                  </Label>
                  <span className="text-xs text-gray-500">
                    {generalAccess ? " מצב רשימת רשאים (כולם חוץ מ-)" : " מצב רשימת חסומים (כולם חוץ מ-)"}
                  </span>
                </div>
                <Switch
                  checked={generalAccess}
                  onCheckedChange={handleGeneralAccessToggle}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-between bg-white border"
              onClick={() => setIsExpandedUsers(!isExpandedUsers)}
            >
              <span className="font-medium">
                {generalAccess ? "משתמשים מורשי צפייה:" : "משתמשים לחסימה:"}
              </span>
              {isExpandedUsers ? <ChevronUp /> : <ChevronDown />}
            </Button>
            <AnimatePresence>
              {isExpandedUsers && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <input
                    className="w-full p-2 mb-2 border rounded shadow-sm text-right"
                    placeholder="חפש משתמש..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
                    {users
                      .filter((u) =>
                        u.userName.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((user) => (
                        <div
                          key={user._id}
                          className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors"
                        >
                          <Label className="cursor-pointer font-medium">
                            {user.userName}
                          </Label>
                          <Switch
                            checked={user.enabled}
                            onCheckedChange={() =>
                              handleToggle(user._id, "user")
                            }
                          />
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Group Section */}
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-between bg-white border"
              onClick={() => setIsExpandedGroups(!isExpandedGroups)}
            >
              <span className="font-medium">
                {generalAccess ? "קבוצות מורשי צפייה:" : "קבוצות לחסימה:"}
              </span>
              {isExpandedGroups ? <ChevronUp /> : <ChevronDown />}
            </Button>
            <AnimatePresence>
              {isExpandedGroups && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden mt-2"
                >
                  <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
                    {groups.map((group, index) => {
                      const groupId = group._id || (group as any).id;

                      return (
                        <div
                          key={groupId || index} 
                          className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors"
                        >
                          <Label className="cursor-pointer font-medium">
                            {group.groupName}
                          </Label>
                          <Switch
                            checked={group.enabled}
                            onCheckedChange={() =>
                              handleToggle(groupId, "group")
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="px-6"
              onClick={() => navigate(-1)}
            >
              ביטול
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700 px-10 shadow-lg"
              onClick={handleSave}
            >
              שמירה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;
