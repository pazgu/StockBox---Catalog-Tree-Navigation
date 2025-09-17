import React, { FC } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './Layout.css';
import About from '../../Pages/HomeArea/About/About';
import Login from '../../Pages/AuthArea/Login/Login';


interface LayoutProps {}

const Layout: FC<LayoutProps> = () => (
  <div className="Layout">
    <header>
      <nav>
        <Link to="/">בית</Link> | <Link to="/login">התחברות</Link>
      </nav>
    </header>

    <main>
      <Routes>
        <Route path="/" element={<About></About>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="*" element={<div>404 - לא נמצא</div>} />
      </Routes>
    </main>
  </div>
);

export default Layout;