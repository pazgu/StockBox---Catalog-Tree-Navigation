import React, { FC } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './Layout.css';
import About from '../../Pages/HomeArea/About/About';
import Login from '../../Pages/AuthArea/Login/Login';
import Header from '../Header/Header';
import Categories from '../../Pages/CatArea/Categories/Categories';
import NewUser from '../../Pages/UserControlArea/NewUser/NewUser';


interface LayoutProps {}

const Layout: FC<LayoutProps> = () => (
  <div className="Layout">
    <Header></Header>
   

    <main>
      <Routes>
        <Route path="/" element={<About></About>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/categories" element={<Categories></Categories>} />
        <Route path="/new-user" element={<NewUser></NewUser>} />
        <Route path="*" element={<div>404 - לא נמצא</div>} />
      </Routes>
    </main>
  </div>
);

export default Layout;