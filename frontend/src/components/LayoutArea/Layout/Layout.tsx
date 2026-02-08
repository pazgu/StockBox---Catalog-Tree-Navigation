import React, { FC } from "react";
import { Routes, Route } from "react-router-dom";
import About from "../../Pages/HomeArea/About/About";
import Login from "../../Pages/AuthArea/Login/Login";
import Header from "../Header/Header";
import AllUsers from "../../Pages/UserControlArea/AllUsers/AllUsers";
import SingleCat from "../../Pages/CatArea/SingleCat/SingleCat";
import Permissions from "../../Pages/UserControlArea/Permissions/Permissions";
import ProductPermissions from "../../Pages/UserControlArea/Permissions/ProductPermissions ";
import NewUser from "../../Pages/UserControlArea/NewUser/NewUser";
import SingleProd from "../../Pages/ProductArea/SingleProd/SingleProd";
import Page404 from "../../Pages/Page404/Page404";
import { Categories } from "../../Pages/CatArea/Categories/Categories";
import GroupControl from "../../Pages/UserControlArea/GroupControl/GroupControl";
import Favorites from "../../Pages/CatArea/Favorites/Favorites";
import { Toaster } from "sonner";
import Footer from "../Footer/Footer";
import SearchResultsPage from "../SearchBar/SearchBar/SearchAllPage";
import { useNavigate } from "react-router-dom";
import Page403 from "../../Pages/Page403/Page403";
import { RecycleBin } from "../../Pages/CatArea/RecycleBin/RecycleBin";

interface LayoutProps {}

const Layout: FC<LayoutProps> = () => {
  const navigate = useNavigate();
  return (
    <div className="Layout">
      <Header></Header>

      <main className="-mt-12">
        <Routes>
          <Route path="/" element={<About></About>} />
          <Route path="/login" element={<Login></Login>} />
          <Route
            path="/products/:productId"
            element={<SingleProd></SingleProd>}
          />
          <Route path="/categories" element={<Categories></Categories>} />
          <Route path="/categories/*" element={<SingleCat />} />
          <Route path="/new-user" element={<NewUser></NewUser>} />
          <Route path="/allUsers" element={<AllUsers></AllUsers>} />
          <Route path="/Favorites" element={<Favorites></Favorites>} />
          <Route
            path="/permissions/product/:id"
            element={<ProductPermissions></ProductPermissions>}
          />
          <Route
            path="/permissions/category/:id"
            element={<Permissions></Permissions>}
          />
          <Route path="/GroupControl" element={<GroupControl></GroupControl>} />
          <Route path="/403" element={<Page403 />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="*" element={<Page404 />} />

          <Route
            path="/search-all"
            element={<SearchResultsPage></SearchResultsPage>}
          />

          <Route path="/recycle-bin" element={<RecycleBin></RecycleBin>} />
        </Routes>
      </main>
      <Toaster richColors />
      <Footer />
    </div>
  );
};

export default Layout;
