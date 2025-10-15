import React, { FC, useState } from 'react';

interface Group {
  name: string;
  members: string[];
  enabled:boolean
}

interface AddCatProps {
  onClose: () => void;
  onSave: (group: Group) => void; // <-- new prop
}

const AddCat: FC<AddCatProps> = ({ onClose, onSave }) => {
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
  if (!groupName.trim()) return; // prevent empty name
  onSave({ name: groupName, members: users , enabled:true });
};

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Popup */}
      <div className="container">
        <div className="dd-card">
          <div className="absolute right-3 top-3 flex flex-col gap-2 items-start">
            <h3 className="text-base underline">יצירת קבוצה חדשה:</h3>

            {/* Group Name */}
            <div className="flex flex-row gap-8 mb-3">
              <h4 className="text-base mb-2">שם קבוצה חדשה:</h4>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="שם קבוצה"
                className="bg-[#E8DFD2] w-[230px] text-gray-700 text-sm text-center focus:outline-none"
              />
            </div>

            {/* Dropdown */}
            <div className="flex flex-row gap-8">
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

          <button className="small-x" onClick={onClose}>x</button>
          <button
            className="absolute left-2 bottom-2 mt-4 px-4 py-2 bg-[#E8DFD2]"
            onClick={handleSave}
          >
            שמור
          </button>
        </div>

        {/* Selected Users */}
        <div className="users-card mt-4 p-2 border rounded w-[230px] bg-white">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">אין משתמשים נבחרים</p>
          ) : (
            users.map((user) => (
              <div key={user} className="flex justify-between items-center p-1 border-b last:border-b-0">
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

export default AddCat;
