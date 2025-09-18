import React, { FC } from 'react';
import './Header.css';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/logo.png'
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

  </div>
);

export default Header;