import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export interface SearchHeaderProps {
  placeholder?: string; // text for the search input
  maxVisibleResults?: number; // how many results to show in dropdown before "Show All"
  redirectToSearchPage?: string; // URL for the "Show All" link
  onSearch?: (query: string) => void;
  onSelectResult?: (item: {
    _id: string;
    name: string;
    path: string;
    type: "product" | "category";
  }) => void; // callback when a result is clicked
}

const SearchBar: React.FC<SearchHeaderProps> = ({
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };
  return (
    <>
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
    </>
  );
};
export default SearchBar;
