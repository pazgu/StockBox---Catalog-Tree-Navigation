import React, { useEffect, useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MapPin,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Switch } from "../../../ui/switch";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Label } from "../../../ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { permissionsService } from "../../../../services/permissions.service";
import { usePath } from "../../../../context/PathContext";
import { Spinner } from '../../../ui/spinner';

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

interface PathData {
  path: string;
  categoryId: string;
  categoryName: string;
  categoryImage: string | null;
  isRootLevel?: boolean;
  categoryPermissions: Array<{ _id: string; allowed: string }>;
  ancestorCategories: Array<{
    categoryId: string;
    categoryName: string;
    allowedIds: string[];
  }>;
}

interface PathPermissionState {
  users: ViewerUser[];
  groups: Group[];
  existingPermissions: Array<{ _id: string; allowed: string }>;
}

const ProductPermissions: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useUser();
  const { id } = useParams<{ id: string }>();
  const cleanId = useMemo(() => id?.replace(/^:/, ""), [id]);

  const [productData, setProductData] = useState<{
    _id: string;
    name: string;
    image: string | null;
  } | null>(null);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [expandedUsersMap, setExpandedUsersMap] = useState<
    Record<string, boolean>
  >({});
  const [expandedGroupsMap, setExpandedGroupsMap] = useState<
    Record<string, boolean>
  >({});
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});

  const [pathStates, setPathStates] = useState<
    Record<string, PathPermissionState>
  >({});
  const [productPermissions, setProductPermissions] = useState<
    Array<{ _id: string; allowed: string }>
  >([]);

  const [allUsers, setAllUsers] = useState<ViewerUser[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const {previousPath} = usePath();
  const savedPreviousPath = useRef<string | null>(null);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  if (previousPath && !savedPreviousPath.current) {
    savedPreviousPath.current = previousPath;
  }

  useEffect(() => {
  if (!role) return;

  if (role !== "editor") {
    navigate("/");
    return;
  }

  const loadData = async () => {
    try {
      if (!cleanId) return;

      const [productPathsData, viewersData, productPerms] = await Promise.all([
        permissionsService.getProductPathsWithPermissions(cleanId),
        permissionsService.getPotentialViewers(),
        permissionsService.getPermissionsByEntity(cleanId),
      ]);

      setProductData({
        _id: productPathsData.product._id,
        name: productPathsData.product.name,
        image: productPathsData.product.image,
      });
      setPaths(productPathsData.paths);
      setProductPermissions(productPerms);

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
          enabled: false,
        };
      });

      const mappedGroups: Group[] = rawGroups.map((g: any) => ({
        _id: g.id || g._id,
        groupName: g.groupName,
        members: false,
      }));

      setAllUsers(mappedUsers);
      setAllGroups(mappedGroups);

      const initialStates: Record<string, PathPermissionState> = {};
      const productAllowedIds = productPerms.map((p: any) => p.allowed);

      productPathsData.paths.forEach((pathData: PathData) => {
        const categoryAllowedIds = pathData.categoryPermissions.map(
          (p) => p.allowed,
        );

        initialStates[pathData.path] = {
          users: mappedUsers.map((u) => ({
            ...u,
            enabled:
              productAllowedIds.includes(u._id) &&
              categoryAllowedIds.includes(u._id),
          })),
          groups: mappedGroups.map((g) => ({
            ...g,
            members:
              productAllowedIds.includes(g._id) &&
              categoryAllowedIds.includes(g._id),
          })),
          existingPermissions: pathData.categoryPermissions,
        };
      });

      setPathStates(initialStates);

      const pathToOpen = savedPreviousPath.current || previousPath;
      if (pathToOpen && productPathsData.paths.length > 0) {
        let matchingPath = productPathsData.paths.find(
          (p: PathData) => p.path === pathToOpen,
        );
        if (!matchingPath) {
          matchingPath = productPathsData.paths.find(
            (p: PathData) =>
              p.path.includes(pathToOpen) || pathToOpen.includes(p.path),
          );
        }
        if (matchingPath) {
          setExpandedPath(matchingPath.path);
        } else {
          setExpandedPath(productPathsData.paths[0].path);
        }
      } else if (productPathsData.paths.length > 0) {
        setExpandedPath(productPathsData.paths[0].path);
      }
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("שגיאה בטעינת הנתונים");
    }
  };

  loadData();
}, [cleanId, role, navigate, previousPath]);

  const isBlockedInProduct = (allowedId: string, userGroupIds?: string[]): boolean => {
    if (productPermissions.some((p) => p.allowed === allowedId)) {
      return false;
    }
    if (userGroupIds && userGroupIds.length > 0) {
      const hasAllowedGroup = userGroupIds.some((groupId) =>
        productPermissions.some((p) => p.allowed === groupId)
      );
      if (hasAllowedGroup) {
        return false;
      }
    }   
    return true;
  };
  const isBlockedInCategory = (
    pathData: PathData,
    allowedId: string,
    userGroupIds?: string[]
  ): boolean => {
    const userHasPermission = pathData.categoryPermissions.some(
      (p) => p.allowed === allowedId,
    );  
    const groupHasPermission =
      userGroupIds &&
      userGroupIds.some((groupId) =>
        pathData.categoryPermissions.some((p) => p.allowed === groupId)
      );
    if (!userHasPermission && !groupHasPermission) {
      return true;
    }
    for (const ancestor of pathData.ancestorCategories) {
      const userAllowedInAncestor = ancestor.allowedIds.includes(allowedId);
      const groupAllowedInAncestor =
        userGroupIds &&
        userGroupIds.some((groupId) => ancestor.allowedIds.includes(groupId));
      if (!userAllowedInAncestor && !groupAllowedInAncestor) {
        return true;
      }
    }
    return false;
  };

  const handleToggle = (
    path: string,
    targetId: string,
    toggleType: "user" | "group",
  ) => {
    const pathState = pathStates[path];
    if (!pathState) return;
    const pathData = paths.find((p) => p.path === path);
    if (!pathData) return;
    const currentUser = pathState.users.find((u) => u._id === targetId);
    const currentGroup = pathState.groups.find((g) => g._id === targetId);
    const isCurrentlyEnabled =
      toggleType === "user" ? currentUser?.enabled : currentGroup?.members;
    if (!isCurrentlyEnabled) {
      if (toggleType === "user") {
        const userGroupIds = currentUser?.groupIds || [];
        if (isBlockedInCategory(pathData, targetId, userGroupIds)) {
          toast.error(
            "לא ניתן לשחרר - קטגורית האב חסומה. יש לשחרר את קטגורית האב תחילה",
          );
          return;
        }
      } else {
        if (isBlockedInCategory(pathData, targetId)) {
          toast.error(
            "לא ניתן לשחרר - קטגורית האב חסומה. יש לשחרר את קטגורית האב תחילה",
          );
          return;
        }
      }
    }
    setPathStates((prev) => {
      const pathState = prev[path];
      if (!pathState) return prev;

      if (toggleType === "user") {
        const usersWithGroupInfo = pathState.users.map((user) => {
          const userGroups = pathState.groups.filter((g) =>
            user.groupIds?.includes(g._id),
          );
          const blockedGroups = userGroups.filter((g) => !g.members);
          return {
            ...user,
            hasBlockedGroups: blockedGroups.length > 0,
          };
        });

        const user = usersWithGroupInfo.find(
          (u) => String(u._id) === String(targetId),
        );
        if (user?.hasBlockedGroups && !isCurrentlyEnabled) {
          toast.error("לא ניתן להעניק הרשאה כשמשתמש משויך לקבוצות חסומות");
          return prev;
        }

        return {
          ...prev,
          [path]: {
            ...pathState,
            users: pathState.users.map((u) =>
              String(u._id) === String(targetId)
                ? { ...u, enabled: !u.enabled }
                : u,
            ),
          },
        };
      } else {
        return {
          ...prev,
          [path]: {
            ...pathState,
            groups: pathState.groups.map((g) =>
              String(g._id) === String(targetId)
                ? { ...g, members: !g.members }
                : g,
            ),
          },
        };
      }
    });
  };

  const handleEnableAllForPath = (path: string, enabled: boolean) => {
    const pathData = paths.find((p) => p.path === path);
    if (!pathData) return;
    if (enabled) {
      const pathState = pathStates[path];
      if (!pathState) return;
      const allIds = [
        ...pathState.users.map((u) => u._id),
        ...pathState.groups.map((g) => g._id),
      ];
      const blockedByCategory = allIds.filter((id) =>
        isBlockedInCategory(pathData, id),
      );
      if (blockedByCategory.length > 0) {
        toast.error(
          "לא ניתן לשחרר לכולם - חלק מהמשתמשים/קבוצות חסומים בקטגורית האב",
        );
        return;
      }
      const blockedByProduct = allIds.filter((id) => isBlockedInProduct(id));
      if (blockedByProduct.length > 0) {
        toast.error(
          "לא ניתן לשחרר לכולם - חלק מהמשתמשים/קבוצות חסומים במוצר",
        );
        return;
      }
    }
    setPathStates((prev) => {
      const pathState = prev[path];
      if (!pathState) return prev;

      return {
        ...prev,
        [path]: {
          ...pathState,
          users: pathState.users.map((u) => ({ ...u, enabled })),
          groups: pathState.groups.map((g) => ({ ...g, members: enabled })),
        },
      };
    });
  };

  const savePermissionsForPath = async (pathData: PathData) => {
    setSavingPath(pathData.path);
    try {
      const pathState = pathStates[pathData.path];
      if (!pathState) return;

      const usersToAllow = pathState.users
        .filter((u) => u.enabled)
        .map((u) => u._id);
      const groupsToAllow = pathState.groups
        .filter((g) => g.members)
        .map((g) => g._id);
      const finalAllowedIds = [...usersToAllow, ...groupsToAllow];

      const currentProductIds = productPermissions.map((p) => p.allowed);
      const toCreate = finalAllowedIds.filter((id) => !currentProductIds.includes(id));
      const toDelete = productPermissions.filter(
        (p) => !finalAllowedIds.includes(p.allowed),
      );

      const isBlocking = toDelete.length > 0 && toCreate.length === 0;
      for (const ancestor of pathData.ancestorCategories) {
        for (const allowedId of toCreate) {
          if (!ancestor.allowedIds.includes(allowedId)) {
            toast.error(
              `לא ניתן להעניק הרשאה - קטגורית האב "${ancestor.categoryName}" חסומה`,
            );
            return;
          }
        }
      }

      const createResults = await Promise.allSettled(
        toCreate.map((allowedId) =>
          permissionsService.createPermission(
            "product",
            cleanId!,
            allowedId,
            false,
            pathData.path,
          ),
        ),
      );

      const failures = createResults.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        const firstError = (failures[0] as any).reason?.response?.data?.message;
        toast.error(firstError || "שגיאה בשמירת ההרשאות");
        return;
      }

      await Promise.all(
        toDelete.map((p) => permissionsService.deletePermission(p._id)),
      );

      if (isBlocking) {
        toast.success(`המוצר נחסם בהצלחה בכל המיקומים`, { duration: 4000 });
      } else {
        toast.success(`המוצר שוחרר בהצלחה`);
      }
      const [updatedData, updatedProductPerms] = await Promise.all([
        permissionsService.getProductPathsWithPermissions(cleanId!),
        permissionsService.getPermissionsByEntity(cleanId!),
      ]);
      setProductPermissions(updatedProductPerms);
      setPaths(updatedData.paths);
      const newProductAllowedIds = updatedProductPerms.map((p: any) => p.allowed);
      const newPathStates: Record<string, PathPermissionState> = {};
      updatedData.paths.forEach((updatedPath: PathData) => {
        const categoryAllowedIds = updatedPath.categoryPermissions.map(
          (p: any) => p.allowed,
        );
        newPathStates[updatedPath.path] = {
          ...pathStates[updatedPath.path],
          users: pathStates[updatedPath.path].users.map((u) => ({
            ...u,
            enabled:
              newProductAllowedIds.includes(u._id) &&
              categoryAllowedIds.includes(u._id),
          })),
          groups: pathStates[updatedPath.path].groups.map((g) => ({
            ...g,
            members:
              newProductAllowedIds.includes(g._id) &&
              categoryAllowedIds.includes(g._id),
          })),
          existingPermissions: updatedPath.categoryPermissions,
        };
      });
      setPathStates(newPathStates);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשמירה");
    } finally {
      setSavingPath(null);
    }
  };

  const getUsersWithGroupInfo = (path: string, pathData: PathData) => {
    const pathState = pathStates[path];
    if (!pathState) return [];

    return pathState.users.map((user) => {
      const userGroups = pathState.groups.filter((g) =>
        user.groupIds?.includes(g._id),
      );
      const enabledGroups = userGroups.filter((g) => g.members);
      const blockedGroups = userGroups.filter((g) => !g.members);

      const allGroupsEnabled =
        userGroups.length > 0 && blockedGroups.length === 0;
      const hasBlockedGroups = blockedGroups.length > 0;
      const enabledGroupIds = enabledGroups.map(g => g._id);
      const blockedByProduct = isBlockedInProduct(user._id, enabledGroupIds);
      const blockedByCategory = isBlockedInCategory(pathData, user._id, enabledGroupIds);

      return {
        ...user,
        userGroups,
        enabledGroups,
        blockedGroups,
        allGroupsEnabled,
        hasBlockedGroups,
        blockedByProduct,
        blockedByCategory,
        effectiveEnabled: user.enabled || allGroupsEnabled,
      };
    });
  };

  const hasChangesForPath = (path: string): boolean => {
    const pathState = pathStates[path];
    if (!pathState) return false;

    const usersToAllow = pathState.users
      .filter((u) => u.enabled)
      .map((u) => u._id);
    const groupsToAllow = pathState.groups
      .filter((g) => g.members)
      .map((g) => g._id);
    const finalAllowedIds = [...usersToAllow, ...groupsToAllow];
    const currentProductIds = productPermissions.map((p) => p.allowed);

    return (
      finalAllowedIds.length !== currentProductIds.length ||
      finalAllowedIds.some((id) => !currentProductIds.includes(id))
    );
  };

  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

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
                src={productData.image || "/placeholder-image.png"}
                className="w-24 h-24 rounded-xl border-2 border-white shadow-lg object-cover bg-white"
                alt={productData.name}
              />
              <span className="absolute -bottom-2 -left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                מוצר
              </span>
            </div>
            <div className="flex-1 text-right">
              <h2 className="text-xl font-bold text-gray-800">
                ניהול הרשאות מוצר:{" "}
                <span className="text-blue-700">{productData.name}</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
  המוצר נמצא ב-{paths.length} {paths.length === 1 ? "מיקום" : "מיקומים"}
</span>

              </div>
            </div>
          </div>

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>שים לב:</strong> מוצר מאושר רק אם{" "}
              <strong>גם המוצר וגם קטגורית האב</strong> מאושרים. חסימת מוצר
              בנתיב אחד תחסום אותו בכל המיקומים.
            </div>
          </div>

          <div className="space-y-4">
            {paths.map((pathData) => {
              const isExpanded = expandedPath === pathData.path;
              const pathState = pathStates[pathData.path];
              const hasChanges = hasChangesForPath(pathData.path);
              const usersWithGroupInfo = getUsersWithGroupInfo(pathData.path,pathData,);

              return (
                <div
                  key={pathData.path}
                  className={`border-2 rounded-lg bg-white transition-all ${
                    isExpanded
                      ? "border-blue-300 shadow-lg"
                      : "border-gray-200"
                  }`}
                >
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setExpandedPath(isExpanded ? null : pathData.path)
                    }
                    className="w-full justify-between p-4 hover:bg-gray-50 h-auto"
                  >
                    <div className="flex items-center gap-3 flex-1 text-right min-w-0">
                      {!pathData.isRootLevel && (
                        <img
                          src={pathData.categoryImage || "/placeholder-image.png"}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          alt={pathData.categoryName}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {pathData.categoryName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono break-all">
                          {pathData.path}
                        </div>
                        {hasChanges && (
                          <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                            שינויים שלא נשמרו
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mr-2">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </Button>

                  <AnimatePresence>
                    {isExpanded && pathState && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex justify-between items-center p-4 bg-white border rounded-lg mb-4 shadow-sm border-blue-100">
                            <Label className="font-bold text-blue-900 text-sm">
                              אפשר לכולם
                            </Label>
                            <Switch
                              checked={
                                pathState.users.length > 0 &&
                                pathState.users.every((u) => u.enabled) &&
                                pathState.groups.every((g) => g.members)
                              }
                              onCheckedChange={(checked) =>
                                handleEnableAllForPath(pathData.path, checked)
                              }
                            />
                          </div>

                          {/* Users Section */}
                          <div className="mb-4">
                            <Button
                              variant="ghost"
                              className="w-full justify-between bg-white border"
                              onClick={() =>
                                setExpandedUsersMap((prev) => ({
                                  ...prev,
                                  [pathData.path]: !prev[pathData.path],
                                }))
                              }
                            >
                              <span className="font-medium">משתמשים:</span>
                              {expandedUsersMap[pathData.path] ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </Button>
                            <AnimatePresence>
                              {expandedUsersMap[pathData.path] && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  exit={{ height: 0 }}
                                  className="overflow-hidden mt-2"
                                >
                                  <input
                                    className="w-full p-2 mb-2 border rounded shadow-sm text-right"
                                    placeholder="חפש משתמש..."
                                    value={searchMap[pathData.path] || ""}
                                    onChange={(e) =>
                                      setSearchMap((prev) => ({
                                        ...prev,
                                        [pathData.path]: e.target.value,
                                      }))
                                    }
                                  />
                                  <div className="bg-white border rounded-lg max-h-48 overflow-y-auto overflow-x-hidden">
                                    {usersWithGroupInfo
                                      .filter((u) =>
                                        u.userName
                                          .toLowerCase()
                                          .includes(
                                            (
                                              searchMap[pathData.path] || ""
                                            ).toLowerCase(),
                                          ),
                                      )
                                      .map((user) => {
                                        const isDisabledDueToGroup = user.allGroupsEnabled && !user.enabled;
                                        const isDisabled = user.hasBlockedGroups || user.blockedByCategory || isDisabledDueToGroup;
                                        return (
                                          <div
                                            key={user._id}
                                            className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors overflow-visible"
                                          >
                                            <div className="flex items-center flex-wrap gap-1 overflow-hidden">
                                              <Label className="font-medium ml-2">
                                                {user.userName}
                                              </Label>

                                              {user.blockedByProduct && !user.effectiveEnabled && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                                                  <Lock className="w-3 h-3" />
                                                  חסום במוצר
                                                </span>
                                              )}
                                              {user.blockedByCategory && !user.effectiveEnabled && (
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                                  חסום בקטגוריה
                                                </span>
                                              )}
                                              {!user.blockedByProduct &&
                                                !user.blockedByCategory &&
                                                user.allGroupsEnabled &&
                                                user.userGroups.length > 0 && (
                                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                                    מורשה משייוך לקבוצה:{" "}
                                                    {user.enabledGroups
                                                      .map((g) => g.groupName)
                                                      .join(", ")}
                                                  </span>
                                                )}

                                              {user.hasBlockedGroups && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                                  חסום בגלל קבוצה:{" "}
                                                  {user.blockedGroups
                                                    .map((g) => g.groupName)
                                                    .join(", ")}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex-shrink-0">
                                              <Switch
                                                checked={user.effectiveEnabled}
                                                disabled={isDisabled}
                                                onCheckedChange={() =>
                                                  handleToggle(pathData.path, user._id, "user")
                                                }
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Groups Section */}
                          <div className="mb-4">
                            <Button
                              variant="ghost"
                              className="w-full justify-between bg-white border"
                              onClick={() =>
                                setExpandedGroupsMap((prev) => ({
                                  ...prev,
                                  [pathData.path]: !prev[pathData.path],
                                }))
                              }
                            >
                              <span className="font-medium">קבוצות:</span>
                              {expandedGroupsMap[pathData.path] ? (
                                <ChevronUp />
                              ) : (
                                <ChevronDown />
                              )}
                            </Button>
                            <AnimatePresence>
                              {expandedGroupsMap[pathData.path] && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  exit={{ height: 0 }}
                                  className="overflow-hidden mt-2"
                                >
                                  <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
                                    {pathState.groups.map((group) => {
                                      const blockedByProduct =
                                        isBlockedInProduct(group._id);
                                      const blockedByCategory =
                                        isBlockedInCategory(pathData, group._id);
                                      return (
                                        <div
                                          key={group._id}
                                          className="flex justify-between p-3 border-b hover:bg-slate-50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Label className="font-medium">
                                              {group.groupName}
                                            </Label>
                                            {blockedByProduct && (
                                              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                                                <Lock className="w-3 h-3" />
                                                חסום במוצר
                                              </span>
                                            )}
                                            {blockedByCategory && (
                                              <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                חסום בקטגוריה
                                              </span>
                                            )}
                                          </div>
                                          <Switch
                                            checked={group.members}
                                            disabled={blockedByCategory}
                                            onCheckedChange={() =>
                                              handleToggle(
                                                pathData.path,
                                                group._id,
                                                "group",
                                              )
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

                          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              onClick={() => {
                                const productAllowedIds = productPermissions.map(
                                  (p) => p.allowed,
                                );
                                const categoryAllowedIds =
                                  pathData.categoryPermissions.map(
                                    (p) => p.allowed,
                                  );
                                setPathStates((prev) => ({
                                  ...prev,
                                  [pathData.path]: {
                                    ...prev[pathData.path],
                                    users: allUsers.map((u) => ({
                                      ...u,
                                      enabled:
                                        productAllowedIds.includes(u._id) &&
                                        categoryAllowedIds.includes(u._id),
                                    })),
                                    groups: allGroups.map((g) => ({
                                      ...g,
                                      members:
                                        productAllowedIds.includes(g._id) &&
                                        categoryAllowedIds.includes(g._id),
                                    })),
                                  },
                                }));
                                toast.info("השינויים בוטלו");
                              }}
                            >
                              ביטול
                            </Button>
                            <Button
                              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                              onClick={() => savePermissionsForPath(pathData)}
                              disabled={!hasChanges || savingPath === pathData.path}
                            >
                              {savingPath === pathData.path ? (
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPermissions;