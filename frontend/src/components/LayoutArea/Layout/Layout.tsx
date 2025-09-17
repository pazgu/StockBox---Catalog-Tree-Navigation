import React, { FC } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './Layout.css';
import About from '../../Pages/HomeArea/About/About';
import Login from '../../Pages/AuthArea/Login/Login';
import Header from '../Header/Header';
import SingleProd from '../../Pages/ProductArea/SingleProd/SingleProd';


interface LayoutProps {}

const Layout: FC<LayoutProps> = () => (
  <div className="Layout">
    <Header></Header>
   

    <main>
      <Routes>
        <Route path="/" element={<About></About>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/product-details" element={<SingleProd></SingleProd>} />
        <Route path="*" element={<div>404 - לא נמצא</div>} />

      </Routes>
    </main>
  </div>
);

export default Layout;