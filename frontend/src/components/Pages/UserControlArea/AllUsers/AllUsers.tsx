import React, { FC, useEffect, useState } from "react";
import Header from "../../../LayoutArea/Header/Header";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { Lock, Unlock } from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface User {
  id: string | number;
  name: string;
  email: string;
}

interface AllUsersProps {}
const usersData: User[] = [
  { id: 1, name: "ליאלי עמנואלי", email: "lali@outlook.com" },
  { id: 2, name: "משתמש 2", email: "user2@domain.com" },
  { id: 3, name: "משתמש 3", email: "user3@domain.com" },
  { id: 4, name: "משתמש 4", email: "user4@domain.com" },
  { id: 5, name: "משתמש 5", email: "user5@domain.com" },
  { id: 6, name: "משתמש 6", email: "user6@domain.com" },
  { id: 7, name: "משתמש 7", email: "user7@domain.com" },
  { id: 8, name: "משתמש 8", email: "user8@domain.com" },
  { id: 9, name: "משתמש 9", email: "user9@domain.com" },
  { id: 10, name: "משתמש 10", email: "user10@domain.com" },
  { id: 11, name: "משתמש 11", email: "user11@domain.com" },
];

const AllUsers: FC<AllUsersProps> = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(usersData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteUserIndex, setDeleteUserIndex] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [blockUserIndex, setBlockUserIndex] = useState<number | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]); // store blocked user IDs

  const usersPerPage = 8;
  const { role } = useUser();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  const handleAddClick = () => navigate("/new-user");

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteUserIndex(index);
  };

  const confirmDelete = () => {
    if (deleteUserIndex !== null) {
      const globalIndex = (currentPage - 1) * usersPerPage + deleteUserIndex;
      const newUsers = [...users];
      newUsers.splice(globalIndex, 1);

      setUsers(newUsers);

      if (
        currentPage > Math.ceil(newUsers.length / usersPerPage) &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }

      setDeleteUserIndex(null);
      toast.info(`המשתמש נמחק בהצלחה!`);
    }
  };
  const confirmBlock = () => {
    if (blockUserIndex !== null) {
      const userId = Number(currentUsers[blockUserIndex].id);
      const isBlocked = blockedUsers.includes(userId);

      setBlockedUsers((prev) =>
        isBlocked ? prev.filter((id) => id !== userId) : [...prev, userId]
      );

      toast.success(isBlocked ? "המשתמש שוחרר" : "המשתמש נחסם בהצלחה");

      setBlockUserIndex(null);
    }
  };

  const cancelDelete = () => setDeleteUserIndex(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleEditChange = (field: keyof User, value: string) => {
    if (userToEdit) {
      setUserToEdit({ ...userToEdit, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (userToEdit) {
      setUsers(users.map((u) => (u.id === userToEdit.id ? userToEdit : u)));
      toast.success("המשתמש עודכן בהצלחה!");
      setShowEditModal(false);
      setUserToEdit(null);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setUserToEdit(null);
  };

  return (
    <div className="min-h-80 font-sans text-[#0D305B] rtl bg-[#fffaf1]">
      <Header />
      <main className="px-10 pt-7 md:px-5  relative pb-4">
        {/* Header Section */}
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
            className="w-15 h-15 bg-[#2c3e50] rounded-full flex items-center justify-center text-white text-3xl font-light cursor-pointer transition-transform hover:scale-105 hover:bg-[#34495e]"
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

        {/* Results count */}
        {searchTerm && (
          <div className="text-right mb-4 text-gray-600">
            נמצאו {filteredUsers.length} תוצאות
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentUsers.map((user, index) => (
            <div
              key={index}
              className="bg-[#fffdf8] rounded-xl p-4 text-center shadow-sm relative min-h-[110px] transition-transform hover:-translate-y-1 hover:shadow-md border-gray-100"
            >
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  className="p-1 w-6 h-6 rounded hover:bg-gray-100 opacity-60 hover:opacity-100 transition"
                  onClick={() => handleEditClick(user)}
                >
                  {/* Edit Icon */}
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
                <button
                  className="p-1 w-6 h-6 rounded hover:bg-red-500 hover:text-white opacity-60 hover:opacity-100 transition"
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
                <button
                  className={`p-1 w-6 h-6 rounded transition ${
                    blockedUsers.includes(Number(user.id))
                      ? "bg-green-600/70 text-white hover:bg-green-600"
                      : "hover:bg-gray-100 opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => setBlockUserIndex(index)}
                >
                  {blockedUsers.includes(Number(user.id)) ? (
                    <Unlock size={14} />
                  ) : (
                    <Lock size={14} />
                  )}
                </button>
              </div>

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
                <div className="text-sm text-gray-600">שם:</div>
                <div className="font-semibold text-[#0D305B]">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
          ))}
        </div>

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
              className={`px-3 py-1 border rounded ${
                page === currentPage
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 text-right shadow-lg">
              <h2 className="text-xl font-semibold mb-4">למחוק משתמש זה?</h2>
              <p className="mb-6 text-gray-600">
                פעולה זו לא ניתנת לביטול. האם אתה בטוח שברצונך למחוק את המשתמש?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  onClick={cancelDelete}
                >
                  ביטול
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={confirmDelete}
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        )}
        {blockUserIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 text-right shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {blockedUsers.includes(Number(currentUsers[blockUserIndex].id))
                  ? "לבטל חסימת משתמש זה?"
                  : "לחסום משתמש זה?"}
              </h2>
              <p className="mb-6 text-gray-600">
                {blockedUsers.includes(Number(currentUsers[blockUserIndex].id))
                  ? "האם אתה בטוח שברצונך לבטל את חסימת המשתמש ולאפשר לו גישה מחדש לאתר?"
                  : "האם אתה בטוח שברצונך לחסום משתמש זה מגישה לאתר?"}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  onClick={() => setBlockUserIndex(null)}
                >
                  ביטול
                </button>
                <button
                  className={`px-4 py-2 rounded text-white ${
                    blockedUsers.includes(
                      Number(currentUsers[blockUserIndex].id)
                    )
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  onClick={() => confirmBlock()}
                >
                  {blockedUsers.includes(
                    Number(currentUsers[blockUserIndex].id)
                  )
                    ? "בטל חסימה"
                    : "חסום"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && userToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 text-right shadow-lg">
              <h2 className="text-xl font-semibold mb-4">עריכת משתמש</h2>

              <label className="block text-sm mb-1">שם:</label>
              <input
                type="text"
                value={userToEdit.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0D305B]"
              />

              <label className="block text-sm mb-1">אימייל:</label>
              <input
                type="email"
                value={userToEdit.email}
                onChange={(e) => handleEditChange("email", e.target.value)}
                className="w-full border rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#0D305B]"
              />

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  onClick={handleCancelEdit}
                >
                  ביטול
                </button>
                <button
                  className="px-4 py-2 rounded bg-[#0D305B] text-white hover:bg-[#15457a]"
                  onClick={handleSaveEdit}
                >
                  שמור שינויים
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
