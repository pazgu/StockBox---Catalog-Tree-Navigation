import React, { FC, useState } from 'react';

interface Group {
  name: string;
  members: string[];
  enabled: boolean;
}

interface AddGroupProps {
  onClose: () => void;
  onSave: (group: Group) => void;
}

const AddGroup: FC<AddGroupProps> = ({ onClose, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const options = ['יסמין', 'שרה', 'קרין'];

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !users.includes(opt)
  );

  const addUser = (user: string) => {
    setUsers((prev) => [...prev, user]);
    setSearchTerm('');
    setIsOpen(false);
  };

  const removeUser = (user: string) => {
    setUsers((prev) => prev.filter((u) => u !== user));
  };

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSave({ name: groupName, members: users, enabled: true });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Popup container */}
      <div className="flex fixed top-[210px] right-[400px] flex-row gap-[25px] items-center">
        {/* Main Card */}
        <div className="relative flex justify-start w-[500px] h-[200px] bg-white shadow-[0_5px_5px_-5px_rgba(0,0,0,0.5)] border-none rounded-md">
          <button
            className="absolute top-[2px] left-[10px] font-extrabold text-lg"
            onClick={onClose}
          >
            x
          </button>

          <div className="absolute right-3 top-3 flex flex-col gap-2 items-start">
            <h3 className="text-base underline">יצירת קבוצה חדשה:</h3>

            {/* Group Name Input */}
            <div className="flex flex-row gap-8 mb-3 items-center">
              <h4 className="text-base">שם קבוצה חדשה:</h4>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="שם קבוצה"
                className="bg-[#E8DFD2] w-[230px] text-gray-700 text-sm text-center focus:outline-none"
              />
            </div>

            {/* Users Dropdown */}
            <div className="flex flex-row gap-8 items-center">
              <h4 className="text-base ml-11">משתמשים:</h4>
              <div className="relative w-[230px]">
                <input
                  placeholder="חפש משתמש"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setIsOpen(true)}
                  className="bg-[#E8DFD2] p-2 w-full cursor-pointer text-sm text-center focus:outline-none"
                />

                {isOpen && filteredOptions.length > 0 && (
                  <div className="absolute mt-1 w-full bg-[#E8DFD2] border shadow-lg z-50 max-h-40 overflow-y-auto">
                    {filteredOptions.map((option) => (
                      <div
                        key={option}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-center"
                        onClick={() => addUser(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            className="absolute left-2 bottom-2 mt-4 px-4 py-2 bg-[#E8DFD2] hover:bg-[#d7c8b7] transition"
            onClick={handleSave}
          >
            שמור
          </button>
        </div>

        {/* Selected Users Card */}
        <div className="w-[180px] max-h-[600px] min-h-[300px] bg-white border-none rounded-[20px] shadow-[-5px_0_5px_-5px_rgba(0,0,0,0.5),_0_5px_5px_-5px_rgba(0,0,0,0.5)] p-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-4">
              אין משתמשים נבחרים
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user}
                className="flex justify-between items-center p-1 border-b last:border-b-0"
              >
                <span>{user}</span>
                <button
                  className="text-red-500 font-bold ml-2 hover:text-red-700"
                  onClick={() => removeUser(user)}
                >
                  x
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGroup;
