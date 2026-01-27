import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Switch } from "../../../ui/switch";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { permissionsService } from "../../../../services/permissions.service";
import InheritanceModal from "../../SharedComponents/DialogModal/DialogModal";

interface Group {
  _id: string;
  groupName: string;
  memebers: boolean;
}

interface ViewerUser {
  _id: string;
  userName: string;
  enabled: boolean;
  groupIds: string[];
}

interface Permission {
  _id: string;
  allowed: string;
}

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useUser();
  const { type, id } = useParams<{ type: string; id: string }>();
  const cleanId = useMemo(() => id?.replace(/^:/, ""), [id]);
  const [showInheritanceModal, setShowInheritanceModal] = useState(false);
  const [isExpandedUsers, setIsExpandedUsers] = useState(false);
  const [isExpandedGroups, setIsExpandedGroups] = useState(false);
  const [users, setUsers] = useState<ViewerUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [existingPermissions, setExistingPermissions] = useState<Permission[]>(
    [],
  );
  const [search, setSearch] = useState("");
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

        const [permsRaw, viewersData, entity] = await Promise.all([
          permissionsService.getPermissionsByEntity(cleanId),
          permissionsService.getPotentialViewers(),
          permissionsService.getEntityDetails(type as any, cleanId),
        ]);

        const perms: Permission[] = permsRaw;
        setEntityData(entity);
        setExistingPermissions(perms);

        const { users: rawUsers, groups: rawGroups } = viewersData;
        const userToGroupsMap = new Map<string, string[]>();
        rawGroups.forEach((group: any) => {
          const groupId = group.id || group._id;
          (group.members || []).forEach((member: any) => {
            const userId = member._id || member.id;
            if (!userId) return;
            if (!userToGroupsMap.has(userId)) userToGroupsMap.set(userId, []);
            userToGroupsMap.get(userId)!.push(groupId);
          });
        });

        const mappedUsers: ViewerUser[] = rawUsers.map((u: any) => {
          const userId = u._id || u.id;
          return {
            _id: userId,
            userName: u.userName,
            groupIds: userToGroupsMap.get(userId) || [],
            enabled: perms.some((p) => p.allowed === userId),
          };
        });

        const mappedGroups: Group[] = rawGroups.map((g: any) => ({
          _id: g.id || g._id,
          groupName: g.groupName,
          memebers: perms.some((p) => p.allowed === (g.id || g._id)),
        }));

        setUsers(mappedUsers);
        setGroups(mappedGroups);
      } catch (err) {
        console.error("Load Error:", err);
        toast.error("שגיאה בטעינת הנתונים");
      }
    };

    loadData();
  }, [cleanId, type, role, navigate]);

const usersWithGroupInfo = useMemo(() => {
  return users.map((user) => {
    const userGroups = groups.filter(g => user.groupIds?.includes(g._id));
    const enabledGroups = userGroups.filter(g => g.memebers);
    const blockedGroups = userGroups.filter(g => !g.memebers);
    
    const allGroupsEnabled = userGroups.length > 0 && blockedGroups.length === 0;
    const hasBlockedGroups = blockedGroups.length > 0;
    
    return {
      ...user,
      userGroups,
      enabledGroups,
      blockedGroups,
      allGroupsEnabled,
      hasBlockedGroups,
      effectiveEnabled: user.enabled || allGroupsEnabled,
    };
  });
}, [users, groups]);

const handleToggle = (targetId: string, toggleType: "user" | "group") => {
  if (toggleType === "user") {
    const user = usersWithGroupInfo.find(u => String(u._id) === String(targetId));
    if (user?.hasBlockedGroups) {
      toast.error("לאניתן להעניק הרשאה כאשר למשתמש יש קבוצות חסומות");
      return;
    }
    
    setUsers((prev) =>
      prev.map((u) =>
        String(u._id) === String(targetId) ? { ...u, enabled: !u.enabled } : u
      )
    );
  } else {
    setGroups((prev) =>
      prev.map((g) =>
        String(g._id) === String(targetId) ? { ...g, memebers: !g.memebers } : g
      )
    );
  }
};

  const savePermissions = async (inheritToChildren: boolean) => {
    try {
      if (!cleanId || !type) return;

      const usersToAllow = users.filter((u) => u.enabled).map((u) => u._id);
      const groupsToAllow = groups.filter((g) => g.memebers).map((g) => g._id);
      const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

      const currentDbIds = existingPermissions.map((p) => p.allowed);
      const toCreate = finalAllowedIds.filter(
        (id) => !currentDbIds.includes(id),
      );
      const toDelete = existingPermissions.filter(
        (p) => !finalAllowedIds.includes(p.allowed),
      );

      const createResults = await Promise.allSettled(
        toCreate.map((allowedId) =>
          permissionsService.createPermission(
            type,
            cleanId,
            allowedId,
            inheritToChildren,
          ),
        ),
      );

      const failures = createResults.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        const firstError = (failures[0] as any).reason?.response?.data?.message;
        toast.error(
          firstError || "חלק מההרשאות לא נוצרו בשל קטגוריות אב חסומות",
        );
        return;
      }

      await Promise.all(
        toDelete.map((p) => permissionsService.deletePermission(p._id)),
      );

      const successCount = createResults.filter(
        (r) => r.status === "fulfilled",
      ).length;
      if (successCount > 0 || toDelete.length > 0) {
        toast.success("השינויים נשמרו בהצלחה");
        setTimeout(() => navigate(-1), 500);
      } else {
        navigate(-1);
      }
    } catch (err) {
      toast.error("שגיאה בשמירה");
    }
  };
  const handleSave = async () => {
    if (!cleanId || !type) return;

    const usersToAllow = users.filter((u) => u.enabled).map((u) => u._id);
    const groupsToAllow = groups.filter((g) => g.memebers).map((g) => g._id);
    const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

    const currentDbIds = existingPermissions.map((p) => p.allowed);
    const toCreate = finalAllowedIds.filter((id) => !currentDbIds.includes(id));
    const toDelete = existingPermissions.filter(
      (p) => !finalAllowedIds.includes(p.allowed),
    );

    if (toCreate.length === 0 && toDelete.length > 0) {
      await savePermissions(false);
      return;
    }

    if (type === "category") {
      setShowInheritanceModal(true);
    } else {
      savePermissions(false);
    }
  };

  return (
    <div
      className="rtl px-5 md:px-16 py-20 flex justify-center font-sans mt-8"
      dir="rtl"
    >
      <Card className="w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-xl shadow-md">
        <CardContent className="p-4">
          <div className="mb-4">
            <Button
              variant="outline"
              className="px-6 flex items-center gap-2 hover:bg-gray-300 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזרה</span>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={entityData?.image || "/placeholder-image.png"}
                className="w-20 h-20 rounded-xl border-2 border-white shadow-lg object-cover bg-white"
                alt="entity"
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
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-white border rounded-lg mb-4 shadow-sm border-blue-100">
            <Label className="font-bold text-blue-900 text-sm">
              אפשר לכולם
            </Label>
            <Switch
              checked={
                users.length > 0 &&
                users.every((u) => u.enabled) &&
                groups.every((g) => g.memebers)
              }
              onCheckedChange={(checked) => {
                setUsers((prev) =>
                  prev.map((u) => ({ ...u, enabled: checked })),
                );
                setGroups((prev) =>
                  prev.map((g) => ({ ...g, memebers: checked })),
                );
              }}
            />
          </div>
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-between bg-white border"
              onClick={() => setIsExpandedUsers(!isExpandedUsers)}
            >
              <span className="font-medium">משתמשים:</span>
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
                    {usersWithGroupInfo
                      .filter((u) => u.userName.toLowerCase().includes(search.toLowerCase()))
                      .map((user) => (
                    <div key={user._id} className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors">
                      <div className="flex items-center flex-wrap gap-1">
                        <Label className="font-medium ml-2">{user.userName}</Label>
                        
                        {user.allGroupsEnabled && user.userGroups.length > 0 && (
                          <>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                              הרשאה מקבוצה/קבוצות:
                            </span>
                            {user.enabledGroups.map(g => (
                              <span key={g._id} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {g.groupName}
                              </span>
                            ))}
                          </>
                        )}
                        
                        {user.hasBlockedGroups && (
                          <>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                              חסום בגלל הקבוצה/קבוצות:
                            </span>
                            {user.blockedGroups.map(g => (
                              <span key={g._id} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {g.groupName}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                      <Switch
                        checked={user.effectiveEnabled}
                        disabled={user.hasBlockedGroups}
                        onCheckedChange={() => handleToggle(user._id, "user")}
                      />
                    </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-between bg-white border"
              onClick={() => setIsExpandedGroups(!isExpandedGroups)}
            >
              <span className="font-medium">קבוצות:</span>
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
                    {groups.map((group) => (
                      <div
                        key={group._id}
                        className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors"
                      >
                        <Label className="font-medium">{group.groupName}</Label>
                        <Switch
                          checked={group.memebers}
                          onCheckedChange={() =>
                            handleToggle(group._id, "group")
                          }
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <InheritanceModal
            open={showInheritanceModal}
            onClose={() => {
              setShowInheritanceModal(false);
              savePermissions(false);
            }}
            onConfirm={() => {
              setShowInheritanceModal(false);
              savePermissions(true);
            }}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="px-8 py-2 border-gray-300 hover:bg-gray-300 transition-all font-medium"
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
