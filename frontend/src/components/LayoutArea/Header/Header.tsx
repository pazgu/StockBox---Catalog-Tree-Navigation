import React, { FC } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png'
interface HeaderProps {}

const Header: FC<HeaderProps> = () => (
  <div className="Header">
      <div className="nav-container">
      <nav className="nav">
        <Link to="/login">התחברות</Link>
        <span>|</span>
        <Link to="/">דף הבית</Link>
        <span>|</span>
        <Link to="/categories">תכולות ואמצעים</Link>
      </nav>

      <div className="search-bar">
        <button>חפש</button>
        <input type="text" placeholder=" חפש מוצר..." />
      </div>
    </div>

    <img src={logo} className="logo" alt="logo" />
  </div>
);

export default Header;
