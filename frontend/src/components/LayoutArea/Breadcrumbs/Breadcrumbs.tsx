import { useLocation, useNavigate } from "react-router-dom";
import catIcon from "../../../assets/newcat.png";
const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Split path into segments, ignoring empty strings
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="relative w-max mx-auto pt-4">
      <span
        role="img"
        aria-label="Cute cat peeking"
        className="
          absolute            
          top-[-17px]         
          left-5  
          z-10                
        "
      >
        <img 
        src={catIcon} 
        alt="Cute cat peeking"
        className="w-8 h-8 object-cover"
      />
      </span>
    <div className="px-4 py-1 text-sm bg-gray-400 rounded text-white flex gap-1 items-center ">
      <span
        className="cursor-pointer hover:underline"
        onClick={() => navigate("/")}
      >
        Home
      </span>
      {pathSegments.map((segment, index) => {
        const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
        return (
          <span key={index} className="flex items-center gap-1">
            <span>{">"}</span>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate(pathToHere)}
            >
              {segment}
            </span>
          </span>
        );
      })}
    </div>
    </div>
  );
};
export default Breadcrumbs;
