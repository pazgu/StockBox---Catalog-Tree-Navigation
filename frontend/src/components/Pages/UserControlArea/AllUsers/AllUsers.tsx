import React, { FC, useEffect, useState } from "react";
import Header from "../../../LayoutArea/Header/Header";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../../services/UserService";
import { toast } from "sonner";
import { Ban } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { User } from "../../../models/user.models";
import { groupService } from "../../../../services/GroupService";
import isEmail from "validator/lib/isEmail";
import { useUser } from "../../../../context/UserContext";
const ROLE_OPTIONS: Array<{ value: User["role"]; label: string }> = [
  { value: "editor", label: "עורך" },
  { value: "viewer", label: "צופה" },
];

const roleLabel = (r: User["role"]) =>
  ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r;

const MODAL_OVERLAY =
  "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4";

const MODAL_CARD =
  "bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 text-right";

const MODAL_FOOTER =
  "flex justify-end gap-4 mt-6 pt-6 border-t-2 border-gray-200";

const BTN_CANCEL =
  "px-6 h-12 rounded-xl border-2 border-gray-300 transition-colors font-bold bg-white text-gray-700 hover:bg-gray-50";

const BTN_PRIMARY =
  "px-8 h-12 rounded-xl text-white transition-colors font-bold shadow-lg bg-gradient-to-r from-[#0D305B] to-[#15457a] hover:from-[#15457a] hover:to-[#1e5a9e] hover:shadow-xl";

const BTN_DANGER =
  "px-8 h-12 rounded-xl font-bold text-white transition-colors shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl";

const BTN_SUCCESS =
  "px-8 h-12 rounded-xl font-bold text-white transition-colors shadow-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl";


interface AllUsersProps { }

const AllUsers: FC<AllUsersProps> = () => {
  const navigate = useNavigate();
  const { id } = useUser();  

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    userService.getAll().then(setUsers);
  }, []);
  const isMe = (userId: string | undefined) => userId === id;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteUserIndex, setDeleteUserIndex] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [blockUserIndex, setBlockUserIndex] = useState<number | null>(null);
  const [approveUserIndex, setApproveUserIndex] = useState<number | null>(null);
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof User, string>>>({});
  const usersPerPage = 8;

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const filteredUsers = users
    .filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => Number(a.approved) - Number(b.approved));


  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage,
  );

  const handleAddClick = () => navigate("/new-user");

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteUserIndex(index);
  };

  const confirmDelete = async () => {
    if (deleteUserIndex !== null) {
      const userIdToDelete = currentUsers[deleteUserIndex]._id;
      if (!userIdToDelete) return;

      await userService.remove(userIdToDelete);

      setUsers((prev) => prev.filter((u) => u._id !== userIdToDelete));

      if (
        currentPage > Math.ceil((users.length - 1) / usersPerPage) &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }

      setDeleteUserIndex(null);
      toast.info("המשתמש נמחק בהצלחה!");
    }
  };
  const confirmBlock = async () => {
    if (blockUserIndex !== null) {
      const user = currentUsers[blockUserIndex];
      const userId = user._id;
      if (!userId) return;

      const currentBlockStatus = user.isBlocked || false;

      try {
        const updatedUser = await userService.block(
          userId,
          !currentBlockStatus,
        );

        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u)),
        );

        toast.success(
          currentBlockStatus ? "המשתמש שוחרר מהחסימה" : "המשתמש נחסם בהצלחה",
        );
      } catch (error) {
        toast.error("אירעה שגיאה בעדכון סטטוס החסימה");
        console.error("Block error:", error);
      }

      setBlockUserIndex(null);
    }
  };
  const handleApproveClick = (index: number) => setApproveUserIndex(index);
  const confirmApprove = async () => {
    if (approveUserIndex !== null) {
      const user = currentUsers[approveUserIndex];
      const userId = user._id;
      if (!userId) {
        return;
      }

      try {
        const updatedUser = await userService.update(userId, {
          approved: true,
        });

        if (user.role === "viewer") {
          const groups = await groupService.getGroups();
          const newUsersGroup = groups.find((g) => g.name === "New Users");

          const userIdStr = String(userId);

          if (newUsersGroup && !newUsersGroup.members.includes(userIdStr)) {
            await groupService.updateGroupMembers(newUsersGroup.id, [
              ...newUsersGroup.members,
              userIdStr,
            ]);
          }

        }

        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u)),
        );

        toast.success("המשתמש אושר בהצלחה!");
        setApproveUserIndex(null);
      } catch (error) {
        console.error("Error approving user:", error);
        toast.error("שגיאה באישור המשתמש");
      }
    }
  };

  const cancelDelete = () => setDeleteUserIndex(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

const handleEditChange = (field: keyof User, value: string) => {
  if (userToEdit) {
    setUserToEdit({ ...userToEdit, [field]: value });

    const hebrewOnly = /^[א-ת\s]+$/;
    const englishOnly = /^[a-zA-Z\s]+$/;
    const arabicOnly = /^[\u0600-\u06FF\s]+$/;
    const validChars = /^[א-תa-zA-Z\u0600-\u06FF\s]+$/;
    const validUserNameChars = /^[א-תa-zA-Z\u0600-\u06FF0-9]+$/;
    const validUserNameLang = /^[א-ת0-9]+$|^[a-zA-Z0-9]+$|^[\u0600-\u06FF0-9]+$/;

    let error = "";
    const trimmed = value.trim();

    if (field === "firstName" || field === "lastName") {
      if (!trimmed) {
        error = field === "firstName" ? "שם פרטי הוא שדה חובה" : "שם משפחה הוא שדה חובה";
      } else if (!validChars.test(trimmed)) {
        error = "רק אותיות";
      } else if (!hebrewOnly.test(trimmed) && !englishOnly.test(trimmed) && !arabicOnly.test(trimmed)) {
        error = "לא ניתן לערבב שפות";
      } else if (trimmed.length < 2) {
        error = field === "firstName" ? "שם פרטי חייב להכיל לפחות 2 אותיות" : "שם משפחה חייב להכיל לפחות 2 אותיות";
      }
    }

    if (field === "userName") {
      if (!trimmed) {
        error = "שם משתמש הוא שדה חובה";
      } else if (!validUserNameChars.test(trimmed)) {
        error = "רק אותיות ומספרים";
      } else if (!validUserNameLang.test(trimmed)) {
        error = "לא ניתן לערבב שפות";
      } else if ((trimmed.match(/[א-תa-zA-Z\u0600-\u06FF]/g) || []).length < 2) {
        error = "חייב להכיל לפחות 2 אותיות";
      }
    }

    if (field === "email") {
      if (!trimmed) {
        error = "כתובת מייל היא שדה חובה";
      } else if (!isEmail(trimmed)) {
        error = "כתובת מייל לא תקינה";
      }
    }

    setEditErrors((prev) => ({ ...prev, [field]: error }));
  }
};

const handleSaveEdit = async () => {
  if (!userToEdit || !userToEdit._id) return;

  const hasErrors = Object.values(editErrors).some((e) => e !== "");
  if (hasErrors) return;

  try {
    const updatedUser = await userService.update(userToEdit._id, userToEdit);
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
    );
    toast.success("המשתמש עודכן בהצלחה!");
    setShowEditModal(false);
    setUserToEdit(null);
  } catch (error: any) {
    console.error("שגיאה בעדכון משתמש:", error);
    const status = error?.response?.status;
    if (status === 409) {
      toast.error("שם משתמש או אימייל כבר קיימים במערכת");
    } else {
      toast.error("שגיאה בעדכון המשתמש");
    }
  }
};

const handleCancelEdit = () => {
  setShowEditModal(false);
  setUserToEdit(null);
  setEditErrors({});
};

  return (
    <div className=" font-sans text-[#0D305B] rtl bg-[#fffaf1]">
      <Header />
      <main className="px-7 md:px-5  relative pb-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-right flex-1">
            <h1 className="text-3xl font-bold mb-4">כל המשתמשים</h1>

            <div className="relative max-w-xs">
              <input
                type="text"
                placeholder="חיפוש לפי שם או אימייל..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent text-right bg-[#fffdf8]"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div
            className="w-15 h-15 bg-[#2c3e50] rounded-full flex items-center justify-center text-white text-3xl font-light cursor-pointer transition-transform hover:bg-[#34495e]"
            onClick={handleAddClick}
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>

        {searchTerm && (
          <div className="text-right mb-4 text-gray-600">
            נמצאו {filteredUsers.length} תוצאות
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentUsers.map((user, index) => (
            <div
              key={user._id}
              className={`rounded-xl p-4 text-center shadow-sm relative min-h-[110px] transition-transform hover:-translate-y-1 hover:shadow-md border-gray-100 ${user.approved ? "bg-[#fffdf8]" : "bg-gray-100"
                }`}
            >
              {!user.approved && (
                <div
                  className="absolute top-2 left-2 text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-red-200 "
                  onClick={() => handleApproveClick(index)}
                >
                  ממתין לאישור
                </div>
              )}

              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  className="p-1 w-6 h-6 rounded hover:bg-gray-100 opacity-60 hover:opacity-100 transition"
                  onClick={() => handleEditClick(user)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {user._id != id && (
                  <button
                  className="w-6 h-6 rounded flex items-center justify-center
             hover:bg-red-500 hover:text-white
             opacity-60 hover:opacity-100 transition"
                  onClick={() => handleDeleteClick(index)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 2h4M4 4h8M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                ) }
              

                {user.approved && user.role !== "editor" && (
  <button
    className={`p-1 rounded transition ${
      user.isBlocked
        ? "bg-red-600 text-white hover:bg-red-700"
        : "hover:bg-gray-100 opacity-60 hover:opacity-100"
    }`}
    onClick={() => setBlockUserIndex(index)}
  >
    <Ban size={14} />
  </button>
)}

              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 mx-auto flex items-center justify-center mb-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <div className="text-sm text-gray-600">{user.approved ? "שם:" : "שם משתמש:"}</div>
                <div className="font-semibold text-[#0D305B]">
                  {user.approved ? user.firstName : user.userName}
                </div>

                <div className="text-sm text-gray-600">{user.email}</div>

                <div
                  className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-semibold ${user.isBlocked
                      ? "bg-red-200 text-red-700"
                      : isMe(user._id)
                      ? "bg-blue-100 text-blue-700"
                      : "bg-[#0D305B]/10 text-[#0D305B]"
                    }`}
                >
                        {user.isBlocked
                          ? "משתמש חסום"
                          : `${roleLabel(user.role)}${isMe(user._id) ? " (אני)" : ""}`}

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Approval Dialog */}
        {approveUserIndex !== null && (
  <div className={MODAL_OVERLAY}>
    <div className={MODAL_CARD}>
      <div className="flex justify-start w-full mb-4">
        <h3 className="text-2xl font-bold text-[#0D305B]">
          לאשר משתמש זה?
        </h3>
      </div>

      <p className="text-slate-700 mb-2">
        האם אתה רוצה להכניס את המשתמש למערכת ולאפשר לו גישה לאתר?
      </p>
      <small className="text-gray-500 block mb-6">
        המשתמש יתווסף למערכת ויוכל להתחבר
      </small>

      <div className={MODAL_FOOTER}>
        <button className={BTN_CANCEL} onClick={() => setApproveUserIndex(null)}>
          ביטול
        </button>
        <button className={BTN_SUCCESS} onClick={confirmApprove}>
          כן, אשר
        </button>
      </div>
    </div>
  </div>
)}

        <div className="flex justify-center items-center gap-2 mt-8">
          {currentPage > 1 && (
            <button
              className="px-3 py-1 text-gray-600 hover:text-[#0D305B]"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              הקודם
            </button>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 border rounded ${page === currentPage
                  ? "bg-[#0D305B] text-[#F0E4D0]"
                  : "text-gray-600 hover:bg-[#0D305B] hover:text-[#F0E4D0]"
                }`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages && (
            <button
              className="px-3 py-1 text-gray-600 hover:text-[#0D305B]"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              הבא
            </button>
          )}
        </div>

        {deleteUserIndex !== null && (
  <div className={MODAL_OVERLAY}>
    <div className={MODAL_CARD}>
      <div className="flex justify-start w-full mb-4">
        <h3 className="text-2xl font-bold text-[#0D305B]">
          למחוק משתמש זה?
        </h3>
      </div>

      <p className="text-slate-700 mb-2">
        פעולה זו לא ניתנת לביטול. האם ברצונך למחוק את המשתמש?
      </p>
      <small className="text-gray-500 block mb-6">
        כל המידע המשויך למשתמש ימחק
      </small>

      <div className={MODAL_FOOTER}>
        <button className={BTN_DANGER} onClick={confirmDelete}>
          מחיקה
        </button>
        <button className={BTN_CANCEL} onClick={cancelDelete}>
          ביטול
        </button>
      </div>
    </div>
  </div>
)}

        {blockUserIndex !== null && (
  <div className={MODAL_OVERLAY}>
    <div className={MODAL_CARD}>
      <div className="flex justify-start w-full mb-4">
        <h3 className="text-2xl font-bold text-[#0D305B]">
          {currentUsers[blockUserIndex].isBlocked
            ? "לבטל חסימת משתמש זה?"
            : "לחסום משתמש זה?"}
        </h3>
      </div>

      <p className="text-slate-700 mb-2">
        {currentUsers[blockUserIndex].isBlocked
          ? "האם אתה בטוח שברצונך לבטל את חסימת המשתמש ולאפשר לו גישה מחדש לאתר?"
        : "האם אתה בטוח שברצונך לחסום משתמש זה מגישה למערכת?"}
      </p>
      <small className="text-gray-500 block mb-6">
        ניתן לשנות זאת בכל עת
      </small>

      <div className={MODAL_FOOTER}>
      <button
        className={
          currentUsers[blockUserIndex].isBlocked ? BTN_SUCCESS : BTN_DANGER
        }
        onClick={confirmBlock}
      >
        {currentUsers[blockUserIndex].isBlocked ? "בטל חסימה" : "חסום"}
      </button>

      <button
        className={BTN_CANCEL}
        onClick={() => setBlockUserIndex(null)}
      >
        ביטול
      </button>
    </div>
    </div>
  </div>
)}


        {/* EDIT MODAL */}
        {showEditModal && userToEdit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white via-[#fffdf8] to-[#fff9ed] rounded-2xl p-8 w-full max-w-3xl text-right shadow-2xl border border-gray-100 transform transition-all">
              {/* Header with icon */}
              <div className="flex justify-start w-full mb-6">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-[#0D305B]">
                  <svg
                    className="w-7 h-7 text-[#0D305B]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>עריכת משתמש</span>
                </h2>
              </div>




              {/* Form fields in 2 columns */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                    שם פרטי
                  </label>
                  <input
                    type="text"
                    value={userToEdit.firstName}
                    onChange={(e) => handleEditChange("firstName", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
                  />
                  {editErrors.firstName && (
                    <span className="text-red-500 text-xs mt-1 block">{editErrors.firstName}</span>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                    שם משפחה
                  </label>
                  <input
                    type="text"
                    value={userToEdit.lastName}
                    onChange={(e) => handleEditChange("lastName", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
                  />
                  {editErrors.lastName && (
                    <span className="text-red-500 text-xs mt-1 block">{editErrors.lastName}</span>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                    שם משתמש
                  </label>
                  <input
                    type="text"
                    value={userToEdit.userName}
                    onChange={(e) => handleEditChange("userName", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
                  />
                  {editErrors.userName && (
                    <span className="text-red-500 text-xs mt-1 block">{editErrors.userName}</span>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                    תפקיד
                  </label>
                  <select
                    value={userToEdit.role}
                    onChange={(e) =>
                      handleEditChange("role", e.target.value as User["role"])
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent transition-all bg-white cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group col-span-2">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D305B]"></span>
                    אימייל
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={userToEdit.email}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
             focus:outline-none focus:ring-2 focus:ring-[#0D305B] focus:border-transparent 
             transition-all bg-white shadow-sm hover:shadow-md text-left"
                  />
                  {editErrors.email && (
                    <span className="text-red-500 text-xs mt-1 block">{editErrors.email}</span>
                  )}

                </div>
              </div>

              {/* Action buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
              <button
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#0D305B] to-[#15457a] text-white hover:from-[#15457a] hover:to-[#1e5a9e] transition-colors font-bold shadow-lg hover:shadow-xl"
                onClick={handleSaveEdit}
              >
                שמור שינויים
              </button>

              <button
                className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-colors font-bold text-gray-700"
                onClick={handleCancelEdit}
              >
                ביטול
              </button>
            </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllUsers;