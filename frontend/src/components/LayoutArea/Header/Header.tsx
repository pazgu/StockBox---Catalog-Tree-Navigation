import React, { FC } from 'react';
import './Header.css';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { Heart } from "lucide-react"
import { no } from 'zod/v4/locales';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => (
  
  <div className="Header">
        <img src={logo} className="logo" alt="logo" />

      <div className="nav-container">
      <nav className="nav">
        <NavLink
    to="/login"
    className={({ isActive }) => (isActive ? "active" : "")}
  >
    התחברות
  </NavLink>
  <span>|</span>
  <NavLink
    to="/"
    className={({ isActive }) => (isActive ? "active" : "")}
  >
    דף הבית
  </NavLink>
  <span>|</span>
  <NavLink
    to="/categories"
    className={({ isActive }) => (isActive ? "active" : "")}
  >
    תכולות ואמצעים
  </NavLink>

      </nav>

      <div className="search-bar">
       
        <input type="text" placeholder=" חפש מוצר..." />
         <button>חפש</button>
      </div>
    </div>

 <a
  href="/favorites"
  className="ml-8 inline-flex items-center justify-center p-2 rounded-full text-white hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
>
  <Heart size={25} strokeWidth={2} />
</a>


  </div>
);

export default Header;