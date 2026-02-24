import { Search, X, Loader2, Package, FolderTree } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchService } from "../../../../services/search.service";
import type { SearchResult } from "../../../../types/types";
import { useUser } from "../../../../context/UserContext";
import { PathDisplay } from "../../../../components/Pages/SharedComponents/PathDisplay/PathDisplay";

export interface SearchHeaderProps {
  placeholder?: string;
  maxVisibleResults?: number;
  onSelectResult?: (item: SearchResult) => void;
  onShowAll?: (query: string) => void;
}

const SearchBar: React.FC<SearchHeaderProps> = ({
  placeholder = "חפש מוצר...",
  maxVisibleResults = 3,
  onSelectResult,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const latestRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { role } = useUser();
  const isEditor = role === "editor";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
 useEffect(() => {
  const q = searchQuery.trim();

  // clear previous timer
  if (debounceTimerRef.current) {
    window.clearTimeout(debounceTimerRef.current);
  }

  // if empty -> reset UI
  if (!q) {
    setResults([]);
    setShowResults(false);
    setError("");
    setIsLoading(false);
    return;
  }

  debounceTimerRef.current = window.setTimeout(() => {
    void performSearch(q);
  }, 300);

  return () => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
  };
}, [searchQuery]);


  const performSearch = async (query: string) => {
  if (!query) return;

  const requestId = ++latestRequestIdRef.current;

  setIsLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("נדרשת התחברות");

    const response = await searchService.getDropdownResults(query);

    if (requestId !== latestRequestIdRef.current) return;
    const items = (response.items ?? []).slice(0, maxVisibleResults);

    setResults(items);
    setShowResults(true);
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;

    setError(err instanceof Error ? err.message : "שגיאה בחיפוש");
    setResults([]);
    setShowResults(true);
  } finally {
    if (requestId === latestRequestIdRef.current) {
      setIsLoading(false);
    }
  }
};


  const handleSelectResult = (item: SearchResult) => {
    setShowResults(false);
    setSearchQuery("");

    if (onSelectResult) {
      onSelectResult(item);
    }
  };

  const handleShowAll = () => {
    navigate(`/search-all?q=${encodeURIComponent(searchQuery)}`);
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
    setError("");
    searchRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    handleShowAll();
  };

  return (
   <div className="relative w-full">
    <div
      className={`flex items-center backdrop-blur-sm rounded-full px-1 py-1 transition-all duration-300 ${
        isSearchFocused
          ? "bg-white/20 shadow-lg"
          : "bg-white/10 hover:bg-white/15"
      }`}
    >
        <div className="relative flex-1">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              if (results.length > 0 || error) {
                setShowResults(true);
              }
            }}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchSubmit();
              }
            }}
            placeholder={placeholder}
            className="bg-transparent text-white placeholder-white/70 px-4 py-2 outline-none w-48 lg:w-64 text-right"
            dir="rtl"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearchSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-[#edd7b8] to-[#beaa88] text-[#0D305B] px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          <span>חפש</span>
        </button>
      </div>

      {showResults && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full md:w-96 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
          dir="rtl"
        >
          {error ? (
            <div className="p-4 text-center text-gray-500">{error}</div>
          ) : results.length > 0 ? (
            <>
              <div className="py-2">
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectResult(item)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-right transition-colors"
                  >
                    <div className="mt-1">
                      {item.type === "product" ? (
                        <Package size={18} className="text-blue-600" />
                      ) : (
                        <FolderTree size={18} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 min-w-0">
                        <span className="truncate">
                          {item.type === "product" ? "מוצר" : "קטגוריה"} •{" "}
                          <PathDisplay path={item.paths?.[0] ?? ""} />
                        </span>

                        {isEditor && item.paths && item.paths.length > 1 && (
                          <span className="relative group/path text-xs text-blue-600 whitespace-nowrap shrink-0">
                            + עוד {item.paths.length - 1} נתיבים
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {results.length >= maxVisibleResults && (
                <div className="border-t border-gray-200">
                  <button
                    onClick={handleShowAll}
                    className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    הצג הכל{" "}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              לא נמצאו תוצאות
              <br></br>
              <small>יש לוודא שהוזנה מילה שלמה</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
