import React, { FC } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => (
  <div className="Header">
     <nav>
        <Link to="/">בית</Link> | <Link to="/login">התחברות</Link>
      </nav>
      <img src=''/>
  </div>
);

export default Header;
