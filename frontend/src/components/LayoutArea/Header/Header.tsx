import React, { FC } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Heart } from "lucide-react";

interface HeaderProps {}

const Header: FC<HeaderProps> = () => (
  <div className="fixed top-0 w-full h-[140px] bg-[#0D305B] flex justify-between items-center shadow-md z-50">
    
    {/* Logo */}
    <img src={logo} alt="logo" className="w-[300px] h-auto ml-[245px]" />

    {/* Navigation + Search */}
    <div className="flex flex-col gap-5 mt-5 ml-16">
      
      {/* Nav */}
      <nav className="flex gap-2.5 rtl">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `text-white text-[16px] mr-2 ${isActive ? 'text-[#BA9F71]' : ''}`
          }
        >
          התחברות
        </NavLink>
        <span className="text-white">|</span>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-white text-[16px] mr-2 ${isActive ? 'text-[#BA9F71]' : ''}`
          }
        >
          דף הבית
        </NavLink>
        <span className="text-white">|</span>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `text-white text-[16px] mr-2 ${isActive ? 'text-[#BA9F71]' : ''}`
          }
        >
          תכולות ואמצעים
        </NavLink>
      </nav>

      {/* Search bar */}
      <div className="flex items-stretch w-[300px] border border-gray-300 rounded-full overflow-hidden ml-[150px]">
        <input
          type="text"
          placeholder=" חפש מוצר..."
          className="flex-1 border-none outline-none px-3 py-2 text-[16px] rtl"
        />
        <button className="bg-[#E8DFD2] px-5 text-[16px] cursor-pointer flex items-center justify-center">
          חפש
        </button>
      </div>
    </div>

    {/* Favorites */}
    <a
      href="/favorites"
      className="ml-8 inline-flex items-center justify-center p-2 rounded-full text-white hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
    >
      <Heart size={25} strokeWidth={2} />
    </a>
  </div>
);

export default Header;
