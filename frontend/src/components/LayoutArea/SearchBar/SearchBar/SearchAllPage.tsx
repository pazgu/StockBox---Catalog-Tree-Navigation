/* eslint-disable react-hooks/exhaustive-deps */
import { Package, FolderTree, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { searchService } from "../../../../services/search.service";
import { useUser } from "../../../../context/UserContext";
import { usePath } from "../../../../context/PathContext";
import { PathDisplay } from "../../../Pages/SharedComponents/PathDisplay/PathDisplay";

const SearchResultsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useUser();
  const isEditor = role === "editor";
  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const { search } = useLocation();
  const location = useLocation();
  const { setPreviousPath } = usePath();
  const navigate = useNavigate();
  const searchTerm = new URLSearchParams(search).get("q") || "";
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setResults([]);
      setCurrentPage(1);
      try {
        const response = await searchService.getFullSearch(searchTerm, 1, 20);
        setResults(response.items);
        setHasMore(response.hasMore);
      } catch (err) {
        setError("שגיאה בטעינת תוצאות החיפוש.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [searchTerm]);

  const removeFirstSegment = (path: string): string => {
    return path.split("/").filter(Boolean).slice(1).join("/");
  };
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;

    setIsFetchingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await searchService.getFullSearch(
        searchTerm,
        nextPage,
        20,
      );
      setResults((prev) => [...prev, ...response.items]);
      setHasMore(response.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more results:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, hasMore, isFetchingMore, searchTerm]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

  if (!role) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">
          יש להתחבר כדי לצפות בתוצאות החיפוש
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen py-10 px-4 md:px-20 font-sans mt-20" dir="rtl">
      <div className="max-w-3xl">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="fixed top-48 right-2 text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm z-50 border-l border-gray-300 pl-4"
          >
            <ArrowRight size={14} /> חזור
          </button>
          <h1 className="text-xl text-gray-900 font-medium">
            תוצאות עבור:{" "}
            <span className="font-bold">"{searchTerm || "הכל"}"</span>
          </h1>
        </div>
        {isLoading ? (
          <div className="flex py-20 justify-center">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex flex-col gap-10 mr-4">
            {results.map((item) => (
              <div key={`${item.type}-${item.id}`} className="group max-w-2xl">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-100 shadow-sm ${
                      item.type === "product" ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    {item.type === "product" ? (
                      <Package size={14} className="text-blue-600" />
                    ) : (
                      <FolderTree size={14} className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] text-gray-900 font-normal">
                      StockBox
                    </span>
                    <div className="flex flex-col">
                      <small
                        className="text-gray-500 hover:text-blue-600 hover:underline cursor-pointer text-left"
                        dir="ltr"
                        style={{ unicodeBidi: "isolate" }}
                        onClick={() => {
                          setPreviousPath(item.paths?.[0]);
                          navigate(
                            item.type === "product"
                              ? `/products/${item.id}`
                              : (item.paths?.[0] ?? "/"),
                          );
                        }}
                      >
                        <PathDisplay path={item.paths[0]} />
                      </small>
                      {isEditor && item.paths && item.paths.length > 1 && (
                        <div className="relative inline-block group">
                          <span className="text-[12px] text-blue-600 w-fit cursor-pointer select-none">
                            + עוד {item.paths.length - 1} נתיבים
                          </span>
                          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-white border border-gray-200 shadow-xl rounded-lg p-2 z-50 w-96 max-h-48 overflow-auto text-gray-700">
                            {item.paths.slice(1).map((p: string) => (
                              <button
                                key={p}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPreviousPath(p.slice(0, p.lastIndexOf("/")));

                                  navigate(`/products/${item.id}`, {
                                    state: {
                                      searchBreadcrumbs: removeFirstSegment(p),
                                    },
                                  });
                                }}
                                className="w-full text-left text-[12px] break-all py-1 px-2 rounded-md hover:bg-gray-50 hover:text-blue-700 transition-colors cursor-pointer"
                              >
                                <span
                                  dir="ltr"
                                  style={{ unicodeBidi: "isolate" }}
                                >
                                  <PathDisplay path={p} />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to={
                    item.type === "product"
                      ? `/products/${item.id}`
                      : (item.paths?.[0] ?? "/")
                  }
                  className="text-[20px] text-[#1a0dab] hover:underline block leading-tight mb-1"
                >
                  {item.label}
                </Link>

                <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-1">
                  {item.type === "product"
                    ? item.description || "תיאור המוצר לא זמין."
                    : `יש ללחוץ על הקישור לעיון בקטגוריית ${item.label}`}
                </p>
                <div className="border-b border-gray-100 my-4" />
              </div>
            ))}
          </div>
        )}
        <p className="fixed top-44 left-3 text-sm text-gray-500 italic">
          נמצאו {results.length}
          {hasMore ? "+" : ""} תוצאות
        </p>
        {hasMore && !isLoading && (
          <div ref={loaderRef} className="flex py-10 justify-center">
            {isFetchingMore && (
              <Loader2 className="animate-spin text-blue-500" size={20} />
            )}
          </div>
        )}

        {results.length === 0 && !isLoading && (
          <div className="py-20 text-gray-500">
            לא נמצאו תוצאות התואמות את החיפוש שלך.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
