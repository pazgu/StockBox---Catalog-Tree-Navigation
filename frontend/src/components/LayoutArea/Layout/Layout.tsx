import React, { FC, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import About from '../../Pages/HomeArea/About/About';
import Login from '../../Pages/AuthArea/Login/Login';
import Header from '../Header/Header';
import Categories from '../../Pages/CatArea/Categories/Categories';
import AllUsers from '../../Pages/UserControlArea/AllUsers/AllUsers';
import SingleCat from '../../Pages/CatArea/SingleCat/SingleCat';
import Permissions from '../../Pages/UserControlArea/Permissions/Permissions';
import NewUser from '../../Pages/UserControlArea/NewUser/NewUser';
import SingleProd from '../../Pages/ProductArea/SingleProd/SingleProd';
import Page404 from '../../Pages/Page404/Page404';
import GroupControl from '../../Pages/UserControlArea/GroupControl/GroupControl';
import Favorites from '../../Pages/CatArea/Favorites/Favorites';
import { Toaster } from 'sonner';
import SubCat from '../../../components/Pages/CatArea/SubCats/SubCat/SubCat';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs/Breadcrumbs';
interface LayoutProps {}

const Layout: FC<LayoutProps> = () => {
  return(
  <div className="Layout">
    <Header></Header>
    <main>
      <Routes>
        <Route path="/" element={<About></About>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/product" element={<SingleProd></SingleProd>} />
        <Route path="/categories" element={<Categories></Categories>} />
        <Route path="/single-cat" element={<SingleCat></SingleCat>} />
        <Route path="/subcat/:subcatName" element={<SubCat initialCategories={[]} SubCatName=''></SubCat>} />
        <Route path="/new-user" element={<NewUser></NewUser>} />
        <Route path="/product-details" element={<SingleProd></SingleProd>} />
        <Route path="/allUsers" element={<AllUsers></AllUsers>} />
        <Route path="/Permissions" element={<Permissions></Permissions>} />
        <Route path="/Favorites" element={<Favorites></Favorites>} />
        <Route path="/GroupControl" element={<GroupControl></GroupControl>} />
        <Route path="*" element={<Page404/>} />

      </Routes>
    </main>
    <Toaster richColors/>

  </div>
);}

export default Layout;