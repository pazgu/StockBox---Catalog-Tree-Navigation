import { FC } from "react";
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
import Page403 from "../../Pages/Page403/Page403";
import { RecycleBin } from "../../Pages/CatArea/RecycleBin/RecycleBin";
import { RequireAdmin } from "../../../components/Pages/AuthArea/ProtectRoutes/RequireAdmin";
import { RequireAuth } from "../../../components/Pages/AuthArea/ProtectRoutes/RequireAuth";

interface LayoutProps {}

const Layout: FC<LayoutProps> = () => {
    return (
    <div className="Layout">
      <Header />

      <main className="-mt-12">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Page403 />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="*" element={<Page404 />} />

          <Route
            path="/products/:productId"
            element={
              <RequireAuth>
                <SingleProd />
              </RequireAuth>
            }
          />
          <Route
            path="/categories"
            element={
              <RequireAuth>
                <Categories />
              </RequireAuth>
            }
          />
          <Route
            path="/categories/*"
            element={
              <RequireAuth>
                <SingleCat />
              </RequireAuth>
            }
          />
          <Route
            path="/Favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />
          <Route
            path="/searchAll"
            element={
              <RequireAuth>
                <SearchResultsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/recycleBin"
            element={
              <RequireAuth>
                <RecycleBin />
              </RequireAuth>
            }
          />

          <Route
            path="/new-user"
            element={
              <RequireAdmin>
                <NewUser />
              </RequireAdmin>
            }
          />
          <Route
            path="/allUsers"
            element={
              <RequireAdmin>
                <AllUsers />
              </RequireAdmin>
            }
          />
          <Route
            path="/permissions/:type/:id"
            element={
              <RequireAdmin>
                <Permissions />
              </RequireAdmin>
            }
          />
          <Route
            path="/permissions/product/:id"
            element={
              <RequireAdmin>
                <ProductPermissions />
              </RequireAdmin>
            }
          />
          <Route
            path="/permissions/category/:id"
            element={
              <RequireAdmin>
                <Permissions />
              </RequireAdmin>
            }
          />
          <Route
            path="/GroupControl"
            element={
              <RequireAdmin>
                <GroupControl />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>

      <Toaster richColors />
      <Footer />
    </div>
  );
};

export default Layout;
