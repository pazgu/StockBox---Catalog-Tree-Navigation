import React, { FC } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png'
interface HeaderProps {}

const Header: FC<HeaderProps> = () => (
  <div className="Header">
     <nav className="nav">
      <Link to="/">בית</Link> |
      <Link to="/login">התחברות</Link>
    </nav>

      <img src={logo} className="logo"/>
  </div>
);

export default Header;
