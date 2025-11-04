import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import catIcon from "../../../assets/newcat.png";
import { FolderOpen } from "lucide-react";

interface BreadcrumbsProps {
  path?: string[]; // Optional path for dynamic pages (e.g., products)
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ path }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const segmentMap: { [key: string]: string } = {
    categories: "תכולות ואמצעים",
    "single-cat": "קטגוריה",
    subcat: "תת-קטגוריה",
    "new-user": "משתמש חדש",
    "product-details": "פרטי מוצר",
    allusers: "כל המשתמשים",
    permissions: "הרשאות",
    favorites: "מועדפים",
    groupcontrol: "ניהול קבוצות",
    login: "התחברות",
  };

  const pathSegments = path || location.pathname.split("/").filter(Boolean);

  const getDisplayName = (
    segment: string,
    index: number,
    segments: string[]
  ) => {
    // If last segment and dynamic, show as-is (e.g., product title)
    if (index === segments.length - 1) return segment;

    // If subcategory, decode URI
    if (index > 0 && segments[index - 1].toLowerCase() === "subcat") {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    }

    return segmentMap[segment.toLowerCase()] || segment;
  };

  return (
    <div className="relative group mb-4 mt-14">
      {/* Breadcrumbs */}
      <div
        className="text-sm text-gray-700 flex gap-1 items-center relative z-20"
        dir="rtl"
      >
        <FolderOpen className="size-8 fill-[#e7d6ba]"></FolderOpen>
        {pathSegments.map((segment, index) => {
          const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
          const displayName = getDisplayName(segment, index, pathSegments);
          const isLast = index === pathSegments.length - 1;

          return (
            <span className="flex items-center gap-1">
              <span
                role="img"
                aria-label="Cute cat peeking"
                className="
          absolute
          right-1.5
          translate-y-[20%] 
          opacity-0
          transition-transform duration-100 ease-out
          group-hover:translate-y-0
          top-[-3px] 
          group-hover:opacity-100
          z-2000
        "
              >
                <img
                  src={catIcon}
                  alt="Cute cat peeking"
                  className="w-4 h-4 object-cover"
                />
              </span>

              <span
                className={`${
                  !isLast
                    ? "cursor-pointer hover:underline"
                    : "font-semibold text-gray-700"
                } transition-colors duration-200`}
                onClick={() => !isLast && navigate(pathToHere)}
              >
                {displayName}
              </span>
              <span>{">"}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Breadcrumbs;
