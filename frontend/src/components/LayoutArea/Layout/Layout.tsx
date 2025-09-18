import React, { FC } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './Layout.css';
import About from '../../Pages/HomeArea/About/About';
import Login from '../../Pages/AuthArea/Login/Login';
import Header from '../Header/Header';
import Categories from '../../Pages/CatArea/Categories/Categories';
import AllUsers from '../../Pages/UserControlArea/AllUsers/AllUsers';
import SingleProd from '../../Pages/ProductArea/SingleProd/SingleProd';
import SingleCat from '../../Pages/CatArea/SingleCat/SingleCat';
import Permissions from '../../Pages/UserControlArea/Permissions/Permissions';
import AddCat from '../../Pages/CatArea/AddCat/AddCat';


interface LayoutProps {}

const Layout: FC<LayoutProps> = () => (
  <div className="Layout">
    <Header></Header>
   

    <main>
      <Routes>
        <Route path="/" element={<About></About>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/product" element={<SingleProd></SingleProd>} />
        <Route path="/categories" element={<Categories></Categories>} />
        <Route path="/single-cat" element={<SingleCat></SingleCat>} />
        <Route path="*" element={<div>404 - לא נמצא</div>} />
        <Route path="/allUsers" element={<AllUsers></AllUsers>} />
        <Route path="/Permissions" element={<Permissions></Permissions>} />
      </Routes>
    </main>
  </div>
);

export default Layout;