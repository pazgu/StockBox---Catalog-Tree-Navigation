import { useLocation, useNavigate } from "react-router-dom";
import catIcon from "../../../assets/newcat.png";

const Breadcrumbs = () => {
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

  const getDisplayName = (
    segment: string,
    index: number,
    segments: string[]
  ) => {
    if (index > 0 && segments[index - 1].toLowerCase() === "subcat") {
      try {
        return decodeURIComponent(segment);
      } catch (e) {
        return segment;
      }
    }

    return segmentMap[segment.toLowerCase()] || segment;
  };

  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="relative w-max mx-auto pt-4 group">
      <span
        role="img"
        aria-label="Cute cat peeking"
        className="
                    absolute
                    left-5 
                    translate-y-[80%] 
                    opacity-0
                    transition-transform duration-300 ease-out
                    group-hover:translate-y-0
                    top-[-17px] 
                    group-hover:opacity-100
                "
      >
        <img
          src={catIcon}
          alt="Cute cat peeking"
          className="w-8 h-8 object-cover"
        />
      </span>
      <div
        className="px-4 py-1 text-sm bg-gray-400 rounded text-white flex gap-1 items-center 
            relative z-20
            overflow-hidden"
        dir="rtl"
      >
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          דף הבית
        </span>
        {pathSegments.map((segment, index) => {
          const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");

          const displayName = getDisplayName(segment, index, pathSegments);
          const isLast = index === pathSegments.length - 1;
          return (
            <span key={index} className="flex items-center gap-1">
              <span>{">"}</span>{""}
              <span
                className={`
                ${
                  !isLast
                    ? "cursor-pointer hover:underline"
                    : "font-semibold text-gray-200"
                }
                transition-colors duration-200
              `}
                onClick={() => !isLast && navigate(pathToHere)}
              >
                {displayName}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
export default Breadcrumbs;
