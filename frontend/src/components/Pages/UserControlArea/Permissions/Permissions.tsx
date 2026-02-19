import React, { useEffect, useState, useMemo, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowRight, RefreshCcw } from "lucide-react";
import { Switch } from "../../../ui/switch";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { permissionsService } from "../../../../services/permissions.service";
import InheritanceModal from "../../SharedComponents/DialogModal/DialogModal";
import { usePath } from "../../../../context/PathContext";
import { Spinner } from "../../../ui/spinner";

interface Group {
  _id: string;
  groupName: string;
  members: boolean;
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
  const { type, id } = useParams<{ type: "product" | "category"; id: string }>();
  const entityType = type ?? "category";
  const cleanId = useMemo(() => id?.replace(/^:/, ""), [id]);
  const [showInheritanceModal, setShowInheritanceModal] = useState(false);
  const [isExpandedUsers, setIsExpandedUsers] = useState(false);
  const [isExpandedGroups, setIsExpandedGroups] = useState(false);
  const [users, setUsers] = useState<ViewerUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [existingPermissions, setExistingPermissions] = useState<Permission[]>(
    [],
  );
  const [inheritanceApplied, setInheritanceApplied] = useState(false);
  const [isSyncingChildren, setIsSyncingChildren] = useState(false);
  const {previousPath}=usePath();
  const [search, setSearch] = useState("");
  const [entityData, setEntityData] = useState<{
    name: string;
    image: string;
    permissionsInheritedToChildren: boolean; 

  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  

  useEffect(() => {
    if (!role) return; 

if (role !== "editor") {
  navigate("/");
  return;
}

    const loadData = async () => {
      try {
        if (!cleanId) return;

        const [permsRaw, viewersData, entity] = await Promise.all([
          permissionsService.getPermissionsByEntity(cleanId),
          permissionsService.getPotentialViewers(),
          permissionsService.getEntityDetails(entityType, cleanId),
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
          members: perms.some((p) => p.allowed === (g.id || g._id)),
        }));

        setUsers(mappedUsers);
        setGroups(mappedGroups);
      } catch (err) {
        console.error("Load Error:", err);
        toast.error("שגיאה בטעינת הנתונים");
      }
    };

    loadData();
  }, [cleanId, entityType, role, navigate, previousPath]);


  const enabledGroupIds = useMemo(() => {
    return new Set(groups.filter((g) => g.members).map((g) => g._id));
  }, [groups]);

  const usersWithGroupInfo = useMemo(() => {
    return users.map((user) => {
      const userGroups = groups.filter((g) => user.groupIds?.includes(g._id));
      const enabledGroups = userGroups.filter((g) => g.members);
      const blockedGroups = userGroups.filter((g) => !g.members);

      const allGroupsEnabled =
        userGroups.length > 0 && blockedGroups.length === 0;
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
  }, [users, groups, enabledGroupIds]);

  const handleToggle = (targetId: string, toggleType: "user" | "group") => {
    if (toggleType === "user") {
      const user = usersWithGroupInfo.find(
        (u) => String(u._id) === String(targetId),
      );
      if (user?.hasBlockedGroups) {
        toast.error("לא ניתן להעניק הרשאה כשמשתמש משויך לקבוצות חסומות");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          String(u._id) === String(targetId)
            ? { ...u, enabled: !u.enabled }
            : u,
        ),
      );
    } else {
      setGroups((prev) =>
        prev.map((g) =>
          String(g._id) === String(targetId)
            ? { ...g, members: !g.members }
            : g,
        ),
      );
    }
  };
  const hasAddedPermissions = useMemo(() => {
    const usersToAllow = users.filter((u) => u.enabled).map((u) => u._id);
    const groupsToAllow = groups.filter((g) => g.members).map((g) => g._id);
    const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

    const currentDbIds = existingPermissions.map((p) => p.allowed);
    const toCreate = finalAllowedIds.filter(
      (id) => !currentDbIds.includes(id),
    );

    return toCreate.length > 0;
  }, [users, groups, existingPermissions]);

  const handleSyncToChildren = async () => {
  if (!cleanId) return;

  if (entityType !== "category") {
    toast.info("החלת הרשאות לצאצאים זמינה רק עבור קטגוריות");
    return;
  }

  try {
    setIsSyncingChildren(true);
    await permissionsService.syncCategoryPermissionsToChildren(cleanId);
    toast.success("הרשאות הוחלו בהצלחה על כל הצאצאים");
    setInheritanceApplied(true);
  } catch (err) {
    toast.error("שגיאה בהחלת הרשאות על הצאצאים");
  } finally {
    setIsSyncingChildren(false);
  }
};

  const hasLocalChanges = useMemo(() => {
  const usersToAllow = users.filter(u => u.enabled).map(u => u._id);
  const groupsToAllow = groups.filter(g => g.members).map(g => g._id);
  const finalAllowedIds = [...usersToAllow, ...groupsToAllow];
  const currentDbIds = existingPermissions.map(p => p.allowed);

  const addedOrRemoved = finalAllowedIds.length !== currentDbIds.length
    || finalAllowedIds.some(id => !currentDbIds.includes(id));

  return addedOrRemoved;
}, [users, groups, existingPermissions]);


  const savePermissions = async (inheritToChildren: boolean) => {
    setIsSaving(true);
    try {
      if (!cleanId) return;

      const usersToAllow = users.filter((u) => u.enabled).map((u) => u._id);
      const groupsToAllow = groups.filter((g) => g.members).map((g) => g._id);
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
  entityType,
  cleanId,
  allowedId,
  inheritToChildren,
  previousPath ?? undefined
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
     if (inheritToChildren) {
      setInheritanceApplied(true);
    }
    } catch (err) {
      toast.error("שגיאה בשמירה");
    } finally {
      setIsSaving(false);
    }
  };
  const handleSave = async () => {
    if (!cleanId) return;

    const usersToAllow = users.filter((u) => u.enabled).map((u) => u._id);
    const groupsToAllow = groups.filter((g) => g.members).map((g) => g._id);
    const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

    const currentDbIds = existingPermissions.map((p) => p.allowed);
    const toCreate = finalAllowedIds.filter((id) => !currentDbIds.includes(id));
    const toDelete = existingPermissions.filter(
      (p) => !finalAllowedIds.includes(p.allowed),
    );

    if (toCreate.length === 0 && toDelete.length > 0) {
      setIsSaving(true);
      await savePermissions(false);
      setIsSaving(false);
      return;
    }

    setShowInheritanceModal(true);
  };

const showManualInheritButton =
  entityData?.permissionsInheritedToChildren === false &&
  existingPermissions.length > 0 &&
  !hasLocalChanges; 


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
              className="px-6 flex items-center gap-2 border-2 border-blue-300 shadow-md transition-all duration-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg"
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
                קטגוריה
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
                usersWithGroupInfo.length > 0 &&
                usersWithGroupInfo.every((u) => u.effectiveEnabled) &&
                groups.every((g) => g.members)
              }
              onCheckedChange={(checked) => {
                setUsers((prev) =>
                  prev.map((u) => ({ ...u, enabled: checked })),
                );
                setGroups((prev) =>
                  prev.map((g) => ({ ...g, members: checked })),
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
                    placeholder="חפש/י משתמש..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
                    {usersWithGroupInfo
                      .filter((u) =>
                        u.userName.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((user) => (
                        <div
                          key={user._id}
                          className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center flex-wrap gap-1">
                            <Label className="font-medium ml-2">
                              {user.userName}
                            </Label>

                            {user.allGroupsEnabled &&
                              user.userGroups.length > 0 && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  מורשה משייוך לקבוצה/קבוצות:{" "}
                                  {user.enabledGroups
                                    .map((g) => g.groupName)
                                    .join(", ")}
                                </span>
                              )}

                            {user.hasBlockedGroups && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                חסום בגלל הקבוצה/קבוצות:{" "}
                                {user.blockedGroups
                                  .map((g) => g.groupName)
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={user.effectiveEnabled}
                            disabled={user.hasBlockedGroups}
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
                          checked={group.members}
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
            onDismiss={() => {
              setShowInheritanceModal(false);
            }}
            onDecline={() => {
              setShowInheritanceModal(false);
              savePermissions(false);
            }}
            onConfirm={() => {
              setShowInheritanceModal(false);
              savePermissions(true);
            }}
          />

             <div className="mt-6 flex justify-between items-start gap-3">
                <div className="min-w-[240px]">
                {showManualInheritButton && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 font-medium shadow-sm"
                    disabled={isSyncingChildren}
                    onClick={handleSyncToChildren}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isSyncingChildren
                      ? "מעדכן הרשאות לצאצאים..."
                      : "החלת הרשאות על כל הצאצאים"}
                  </Button>
                )}
              </div>

              <div className="flex flex-row-reverse gap-3">
                <Button
                  variant="outline"
                  className="px-8 py-2 border-gray-300 hover:bg-gray-300 transition-all font-medium"
                  onClick={() => navigate(-1)}
                >
                  ביטול
                </Button>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 px-10 shadow-lg disabled:opacity-50"
                  onClick={handleSave}
                  disabled={!hasLocalChanges}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner className="size-4 text-white" />
                      שומר...
                    </span>
                  ) : (
                    'שמירה'
                  )}
                </Button>
              </div>
            </div>


                        
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;