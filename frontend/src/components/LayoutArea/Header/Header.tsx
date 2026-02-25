import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, User, Menu, X, Trash2, LogOut } from "lucide-react";
import logo from "../../../assets/logo.png";
import { useUser } from "../../../context/UserContext";
import { usePath } from "../../../context/PathContext";
import SearchBar from "../SearchBar/SearchBar/SearchBar";
import bin_open from "../../../assets/bin-open.png";
import bin_closed from "../../../assets/bin_closed.png";

interface HeaderProps {
  logoSrc?: string;
  cartItemCount?: number;
  favoriteCount?: number;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc = logo,
  favoriteCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { setPreviousPath } = usePath();
  const { role, setUser } = useUser();

  const handleSearchSelect = (item: any) => {
    setIsMobileMenuOpen(false);
    if (item.type === "product") {
      setPreviousPath(location.pathname);
      navigate(`/products/${item.id}`);
    } else if (item.type === "category") {
      navigate(`${item.paths[0]}`);
    }
  };

  const handleLogout = () => {
    setUser(null); 
    navigate("/login");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-white text-base hover:text-[#BA9F71] transition-all duration-300 ${
      isActive ? "text-[#BA9F71] font-semibold" : ""
    } after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#BA9F71] after:transition-all after:duration-300 hover:after:w-full ${
      isActive ? "after:w-full" : ""
    }`;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleResize = () =>
      window.innerWidth >= 1024 && setIsMobileMenuOpen(false);
    const handleEscape = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsMobileMenuOpen(false);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [location]);

  const Badge: React.FC<{ count: number }> = ({ count }) => {
    if (count === 0) return null;
    return (
      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#BA9F71] to-[#E8DFD2] text-[#0D305B] text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full transition-all duration-300 z-50 flex items-center justify-between px-6 ${
          isScrolled
            ? "bg-[#0D305B]/95 backdrop-blur-md shadow-xl h-32"
            : "bg-[#0D305B] shadow-lg h-40"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="hidden sm:block flex-shrink-0 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
              <img
                src={logoSrc}
                alt="StockBox Logo"
                className="h-20 w-auto"
                onClick={() => navigate("/")}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center max-w-3xl mx-8">
              <nav className="flex items-center gap-6" dir="rtl">
                <NavLink to="/categories" className={navLinkClass}>
                  תכולות ואמצעים
                </NavLink>
                <span className="text-white/30 animate-pulse">|</span>
                <NavLink to="/" className={navLinkClass}>
                  אודות
                </NavLink>

                {!role && (
                  <>
                    <span className="text-white/30 animate-pulse">|</span>
                    <NavLink to="/login" className={navLinkClass}>
                      התחברות
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            <div
              className={`relative flex-1 max-w-md mx-4 ${isMobileMenuOpen ? "hidden" : ""}`}
            >
              <SearchBar onSelectResult={handleSearchSelect} />
            </div>

            {/* Action Icons */}
            <div
              className={`hidden lg:flex items-center gap-2 mr-4 ${isMobileMenuOpen ? "hidden" : ""}`}
            >
              {/* Favorites — visible when logged in */}
              {role && (
                <button
                  aria-label="Favorites"
                  className="relative p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 group mr-2"
                  onClick={() => navigate("/Favorites")}
                >
                  <Heart
                    size={21}
                    className="transition-all duration-300 group-hover:fill-current group-hover:scale-110"
                  />
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    מועדפים
                  </span>
                </button>
              )}

              {/* Editor-only controls */}
              {role === "editor" && (
                <>
                  <div className="relative group">
                    <button className="relative p-2 rounded-full text-white transition-all duration-300 hover:scale-110 flex-shrink-0 w-14 h-14">
                      <img
                        src="https://img.icons8.com/?size=100&id=cykh8BZMTKkb&format=png&color=FFFFFF"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full hover:bg-white/10 p-1 flex-shrink-0"
                      />
                    </button>
                    <div className="absolute left-1/2 ml-3 -translate-x-1/2 mt-2 w-40 bg-[#beaa88] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <button
                        onClick={() => navigate("/AllUsers")}
                        className="w-full px-4 py-2 text-right text-sm text-white hover:bg-[#e7cc9c] transition-colors rounded-t-lg"
                      >
                        כל המשתמשים
                      </button>
                      <button
                        onClick={() => navigate("/GroupControl")}
                        className="w-full px-4 py-2 text-right text-sm text-white hover:bg-[#e7cc9c] transition-colors border-t border-gray-700 rounded-b-lg"
                      >
                        ניהול קבוצות
                      </button>
                    </div>
                  </div>

                  <button
                    aria-label="Recycle Bin"
                    className="relative p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 group"
                    onClick={() => navigate("/recycle-bin")}
                  >
                    <div className="group relative w-8 h-9">
                      <img
                        src={bin_closed}
                        alt="Trash bin closed"
                        className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:opacity-0 group-hover:scale-90"
                      />
                      <img
                        src={bin_open}
                        alt="Trash bin open"
                        className="absolute inset-0 w-full h-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                      />
                    </div>
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                      סל מיחזור
                    </span>
                  </button>
                </>
              )}

              {/* ── Logout — visible for ANY logged-in role ── */}
              {role && (
                <button
                  aria-label="Logout"
                  className="relative p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 group"
                  onClick={handleLogout}
                >
                  <LogOut
                    size={21}
                    className="transition-all duration-300 group-hover:scale-110 group-hover:text-[#BA9F71]"
                  />
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    התנתקות
                  </span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 active:scale-95 ml-auto"
            >
              <Menu
                size={24}
                className={isMobileMenuOpen ? "opacity-0" : "opacity-100"}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-0 left-0 w-full transition-all duration-500 ease-in-out mt-3 ${
            isMobileMenuOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-4 bg-gradient-to-b from-[#0a2644] to-[#0D305B]">
            <div className="flex justify-end mb-4">
              <X
                size={24}
                className="text-white cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>

            <nav className="flex flex-col gap-4" dir="rtl">
              <div className="relative z-[999]">
                <SearchBar onSelectResult={handleSearchSelect} />
              </div>

              <NavLink to="/" className={navLinkClass}>
                אודות
              </NavLink>
              <NavLink to="/categories" className={navLinkClass}>
                תכולות ואמצעים
              </NavLink>

              {!role && (
                <NavLink to="/login" className={navLinkClass}>
                  התחברות
                </NavLink>
              )}
            </nav>

            {/* Mobile Quick Actions */}
            <div className="flex justify-around mt-1 pt-6 border-t border-white/20">     
                <button
                  onClick={() => navigate("/Favorites")}
                  className="flex flex-col items-center gap-1 text-white/80"
                >
                  <Heart size={20} />
                  <span className="text-xs">מועדפים</span>
                </button>

              {role === "editor" && (
                <>
                  <button
                    onClick={() => navigate("/recycle-bin")}
                    className="flex flex-col items-center gap-1 text-white/80"
                  >
                    <Trash2 size={20} />
                    <span className="text-xs">סל מיחזור</span>
                  </button>

                  <button
                    onClick={() => navigate("/AllUsers")}
                    className="flex flex-col items-center gap-1 text-white/80"
                  >
                    <User size={20} />
                    <span className="text-xs">כל המשתמשים</span>
                  </button>

                  <button
                    onClick={() => navigate("/GroupControl")}
                    className="flex flex-col items-center gap-1 text-white/80 mb-4"
                  >
                    <img
                      src="https://img.icons8.com/?size=100&id=cykh8BZMTKkb&format=png&color=FFFFFF"
                      alt="User Avatar"
                      className="size-6"
                    />
                    <span className="text-xs">ניהול קבוצות</span>
                  </button>
                </>
              )}

              {/* ── Mobile Logout — visible for ANY logged-in role ── */}
              {role && (
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-1 text-white/80 mb-4"
                >
                  <LogOut size={20} />
                  <span className="text-xs">התנתקות</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="h-28" />
    </>
  );
};

export default Header;