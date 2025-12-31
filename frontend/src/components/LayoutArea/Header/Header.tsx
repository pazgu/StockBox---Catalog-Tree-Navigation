import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Heart, Search, User, Menu, X, ShoppingCart, Bell } from "lucide-react";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

interface HeaderProps {
  logoSrc?: string;
  cartItemCount?: number;
  favoriteCount?: number;
  notificationCount?: number;
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc = logo,
  cartItemCount = 0,
  favoriteCount = 0,
  notificationCount = 0,
  onSearch,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useUser();
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-white text-base hover:text-[#BA9F71] transition-all duration-300 ${
      isActive ? "text-[#BA9F71] font-semibold" : ""
    } after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#BA9F71] after:transition-all after:duration-300 hover:after:w-full ${
      isActive ? "after:w-full" : ""
    }`;

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
      {/* Main Header */}
      <header
        className={`fixed top-0 w-full transition-all duration-300 z-50 flex items-center justify-between px-6 ${
          isScrolled
            ? "bg-[#0D305B]/95 backdrop-blur-md shadow-xl h-32" // taller on scroll
            : "bg-[#0D305B] shadow-lg h-40" // taller when at top
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="hidden sm:block flex-shrink-0 transform transition-transform duration-300 hover:scale-105">
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
                {role !== "editor" && (
                  <>
                    <span className="text-white/30 animate-pulse">|</span>
                    <NavLink to="/login" className={navLinkClass}>
                      התחברות
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            <form
              onSubmit={handleSearch}
              className={`${
                isMobileMenuOpen ? "hidden" : "hidden md:flex"
              } items-center backdrop-blur-sm rounded-full px-1 py-1 transition-all duration-300 ${
                isSearchFocused
                  ? "bg-white/20 shadow-lg"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="חפש מוצר..."
                className="bg-transparent text-white placeholder-white/70 px-4 py-2 outline-none w-48 lg:w-64 text-right"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#edd7b8] to-[#beaa88] text-[#0D305B] px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 transform active:scale-95"
              >
                <Search size={18} />
                <span>חפש</span>
              </button>
            </form>

            {/* Action Icons */}
            <div
              className={`flex items-center gap-2 mr-4 ${
                isMobileMenuOpen ? "hidden" : ""
              }`}
            >
              {/* Favorites */}
              {!isMobileMenuOpen && (
                <button
                  aria-label="Favorites"
                  className="relative p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 hover:scale-110 mr-2"
                  onClick={() => navigate("/Favorites")}
                >
                  <Heart size={21} className="hover:fill-current" />
                  <Badge count={favoriteCount} />
                </button>
              )}

              {/* All Users */}
              {role === "editor" && (
                <div className="relative group">
                  <button
                    aria-label="User Profile"
                    className="relative p-2 rounded-full text-white transition-all duration-300 hover:scale-110"
                  >
                    <img
                      src="https://img.icons8.com/?size=100&id=cykh8BZMTKkb&format=png&color=FFFFFF"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full  hover:bg-white/10 p-1"
                    />
                  </button>

                  {/* Dropdown on hover */}
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
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-all duration-300 active:scale-95 ml-auto "
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu
                    size={24}
                    className={`absolute transition-all duration-300 ${
                      isMobileMenuOpen
                        ? "opacity-0 rotate-180"
                        : "opacity-100 rotate-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}

        <div
          className={`lg:hidden transition-all duration-500 ease-in-out mt-32 ${
            isMobileMenuOpen
              ? "max-h-[600px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-4 bg-gradient-to-b from-[#0a2644] to-[#0D305B]">
            {/* Mobile Search */}
            <X
              size={24}
              className={`transition-all duration-300 text-white ml-3 ${
                isMobileMenuOpen
                  ? "opacity-100 rotate-0"
                  : "opacity-0 -rotate-180"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-1 py-1 mb-6"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש מוצר..."
                className="bg-transparent text-white placeholder-white/70 px-4 py-2 outline-none flex-1 text-right"
                dir="rtl"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#E8DFD2] to-[#BA9F71] text-[#0D305B] px-4 py-2 rounded-full transition-all duration-300 active:scale-95"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-4 " dir="rtl">
              <NavLink
                to="/"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                אודות
              </NavLink>
              <NavLink
                to="/categories"
                className={navLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                תכולות ואמצעים
              </NavLink>
              {role !== "editor" && (
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  התחברות
                </NavLink>
              )}
            </nav>

            {/* Mobile Quick Actions */}
            <div className="flex justify-around mt-6 pt-6 border-t border-white/20">
              {
                <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                  <Heart size={20} />
                  <span className="text-xs">מועדפים</span>
                </button>
              }
              {role === "editor" && (
                <button className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
                  <User size={20} />
                  <span className="text-xs">כל המשתמשים</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-28" />
    </>
  );
};

export default Header;
