import {
  Package,
  FolderTree,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { environment } from "../../../../environments/environment.development";
import { searchService } from "../../../../services/search.service";
import { useUser } from "../../../../context/UserContext";

const SearchResultsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const resultsNumber = results.length;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { role } = useUser();
  const isEditor = role === "editor";


  const { search } = useLocation();
  const navigate = useNavigate();
  const searchTerm = new URLSearchParams(search).get("q") || "";
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        console.log("Search Term:", searchTerm);
        const response = await searchService.getFullSearch(searchTerm);
        setResults(response.items);
      } catch (err) {
        setError("שגיאה בטעינת תוצאות החיפוש.");
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [searchTerm]);

  return (
    <div className="min-h-screen py-10 px-4 md:px-20 font-sans mt-20" dir="rtl">
      <div className="max-w-3xl">
        {" "}
        {/* Narrower width like Google Search */}
        {/* Header Section */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
          >
            <ArrowRight size={14} /> חזור
          </button>
          <h1 className="text-xl text-gray-900 font-medium">
            תוצאות עבור:{" "}
            <span className="font-bold">"{searchTerm || "הכל"}"</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 italic">
            נמצאו {results.length} תוצאות
          </p>
        </div>
        {isLoading ? (
          <div className="flex py-20 justify-center">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {" "}
            {/* Large vertical gap between results */}
            {results.map((item) => (
              <div key={item.id} className="group max-w-2xl">
                {/* 1. Header: Icon and Breadcrumb (The Google Look) */}
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border border-gray-100 shadow-sm ${item.type === "product" ? "bg-blue-50" : "bg-gray-50"
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
  <span className="text-[12px] text-gray-500 flex items-center gap-1" dir="ltr">
  {item.type === "product"
    ? "products"
    : (item.paths?.[0] ?? "")
        .replace(/^\//, "")
        .replace(/\//g, " › ")}
</span>



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
            navigate(p);
          }}
          className="w-full text-left text-[12px] break-all py-1 px-2 rounded-md hover:bg-gray-50 hover:text-blue-700 transition-colors cursor-pointer"
          dir="ltr"
          title={p}
        >
          {p}
        </button>
      ))}
    </div>
  </div>
  )}
</div>

                  </div>
                </div>

                {/* 2. The Title (Blue Link) */}
                <Link
  to={
    item.type === "product"
      ? `/products/${item.id}`
      : item.paths?.[0] ?? "/"
  }
  className="text-[20px] text-[#1a0dab] hover:underline block leading-tight mb-1"
>

                  {item.label}
                </Link>

                {/* 3. The "Snippet" / Description */}
                <p className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
                  {item.type === "product"
                    ? `צפה בפרטי המוצר המלאים במערכת. מזהה פריט: ${item.id}.`
                    : `עיון בקטגוריית ${item.label}. לחץ לצפייה בכל המוצרים והתת-קטגוריות המשוייכים לנתיב זה.`}
                </p>
                <div className="border-b border-gray-00 my-4" />
              </div>
            ))}
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
