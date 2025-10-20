import React, { FC, useRef, useState } from 'react';
import { X, Users, ChevronDown } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.blur();
  };

  const removeUser = (user: string) => {
    setUsers((prev) => prev.filter((u) => u !== user));
  };

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSave({ name: groupName, members: users, enabled: true });
  };

  // close dropdown slightly after blur so click can register
  const closeDropdownDelayed = () => setTimeout(() => setIsOpen(false), 120);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[760px] rounded-2xl bg-white shadow-[0_20px_80px_rgba(2,6,23,.18)] ring-1 ring-black/5 border border-slate-200 overflow-visible"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >



        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            יצירת קבוצה חדשה
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 pb-28 overflow-visible">{/* pb-28 gives room for the bottom Save button */}
          {/* Group Name */}
          <div className="flex flex-row gap-6 mb-4 items-center w-full">
            <h4 className="text-sm font-medium text-gray-700 min-w-[120px] text-right">
              שם קבוצה:
            </h4>
            <div className="flex-1">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="הזן שם לקבוצה החדשה"
                className="bg-white border-2 border-gray-200 rounded-lg w-full px-4 py-2.5 text-gray-700 text-sm text-right focus:outline-none focus:border-[#C4A77D] focus:ring-2 focus:ring-[#E8DFD2] transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Users dropdown */}
          <div className="flex flex-row gap-6 items-start w-full">
            <button
              type="button"
              className="text-sm font-medium text-gray-700 min-w-[120px] text-right pt-2 inline-flex items-center gap-1"
              onClick={() => {
                setIsOpen((o) => !o);
                inputRef.current?.focus();
              }}
              aria-expanded={isOpen}
            >
              משתמשים:
              {/* <ChevronDown size={16} className="opacity-70" /> */}
            </button>

            <div className="relative flex-1">
              <div className="relative">
                <input
                  ref={inputRef}
                  placeholder="חפש והוסף משתמשים"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onBlur={closeDropdownDelayed}
                  className="bg-white border-2 border-gray-200 rounded-lg w-full px-4 py-2.5 text-sm text-right focus:outline-none focus:border-[#C4A77D] focus:ring-2 focus:ring-[#E8DFD2] transition-all duration-200 shadow-sm cursor-text"
                />
                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute mt-2 w-full bg-white border-2 border-[#C4A77D] rounded-lg shadow-xl z-[120] max-h-72 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="w-full text-right p-3 hover:bg-[#E8DFD2] transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                          onMouseDown={(e) => e.preventDefault()} // keep focus for onBlur delay
                          onClick={() => addUser(option)}
                        >
                          {option}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        {searchTerm ? 'לא נמצאו תוצאות' : 'בחר משתמש'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected users chips */}
              {users.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 justify-end">
                  {users.map((u) => (
                    <span
                      key={u}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-sm text-slate-700"
                    >
                      {u}
                      <button
                        className="text-slate-500 hover:text-red-600"
                        onClick={() => removeUser(u)}
                        aria-label={`הסר ${u}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

{/* Save button pinned to bottom */}
<div
  className="absolute inset-x-0 bottom-0 px-6 py-4 bg-white 
             border-t border-slate-200 rounded-b-2xl
             shadow-[0_-6px_12px_rgba(0,0,0,0.03)]">

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Users size={18} />
              {users.length > 0 ? (
                <span>{users.length} משתמשים נבחרו</span>
              ) : (
                <span>אין משתמשים נבחרים</span>
              )}
            </div>

            <button
              className="px-6 h-11 rounded-lg bg-[#C4A77D] text-white font-medium hover:shadow-md hover:bg-[#B89968] transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!groupName.trim()}
            >
              שמור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroup;
