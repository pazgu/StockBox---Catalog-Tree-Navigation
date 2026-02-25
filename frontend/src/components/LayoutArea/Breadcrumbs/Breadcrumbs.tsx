import { FC, useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import catIcon from "../../../assets/newcat.png";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";

interface BreadcrumbsProps {
  path?: string[];
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ path }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const segmentMap: Record<string, string> = {
    categories: "תכולות ואמצעים",
  };

  const pathSegments = path || location.pathname.split("/").filter(Boolean);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollLeftAbs = Math.abs(el.scrollLeft);

    setCanScrollRight(scrollLeftAbs > 4);
    setCanScrollLeft(scrollLeftAbs + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const triggerRafCheck = useCallback(() => {
    let frames = 0;
    const tick = () => {
      checkScroll();
      frames += 1;
      if (frames < 25) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const moveAmount = dir === "left" ? -120 : 120;
    el.scrollBy({ left: moveAmount, behavior: "smooth" });

    triggerRafCheck();
  };

  useEffect(() => {
    checkScroll();
    triggerRafCheck();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, pathSegments, triggerRafCheck]);

  return (
    <div
      className="group relative mb-4 mt-14 flex items-center gap-1"
      dir="rtl"
    >
      <FolderOpen className="size-8 shrink-0 fill-[#e7d6ba] text-amber-700" />

      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={`shrink-0 rounded-full p-0.5 transition-all duration-200
          disabled:opacity-0 disabled:text-gray-200
          ${canScrollRight ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800" : ""}
        `}
        aria-label="scroll right"
      >
        <ChevronRight className="size-4 mt-1" />
      </button>

      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {pathSegments.map((segment, index) => {
          const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
          const decoded = decodeURIComponent(segment);
          const lower = decoded.toLowerCase();
          const isLast = index === pathSegments.length - 1;
          const finalDisplayName =
            segmentMap[lower] || decoded.replace(/-/g, " ");
          const showTooltip = finalDisplayName.length > 18;

          return (
            <span
              key={`${segment}-${index}`}
              className="flex items-center gap-1 shrink-0 h-20"
            >
              <span className="relative group/text shrink-0">
                <span className="relative group/text shrink-0">
                  <span
                    role={isLast ? undefined : "button"}
                    onClick={() => !isLast && navigate(encodeURI(pathToHere))}
                    dir={
                      /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(finalDisplayName)
                        ? "rtl"
                        : "ltr"
                    }
                    className={`
      inline-block max-w-[120px] truncate align-bottom text-sm
      transition-colors duration-150
      ${isLast ? "font-semibold text-gray-800" : "text-gray-500 cursor-pointer hover:text-gray-900 hover:underline"}
    `}
                  >
                    {finalDisplayName}
                  </span>
                </span>

                {showTooltip && (
                  <span
                    className="absolute bottom-full z-50 hidden group-hover/text:block whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-xs text-white pointer-events-none"
                    style={{
                      direction: /[\u0590-\u05FF]/.test(finalDisplayName)
                        ? "rtl"
                        : "ltr",
                      ...(/[\u0590-\u05FF]/.test(finalDisplayName)
                        ? { left: 0, right: "auto" }
                        : { right: 0, left: "auto" }),
                    }}
                  >
                    {finalDisplayName}
                    <span
                      className="absolute top-full border-4 border-transparent border-t-gray-800"
                      style={
                        /[\u0590-\u05FF]/.test(finalDisplayName)
                          ? { left: "0.75rem" }
                          : { right: "0.75rem" }
                      }
                    />
                  </span>
                )}
              </span>
              {!isLast && (
                <ChevronLeft className="size-3 text-gray-300 shrink-0 mt-1" />
              )}
            </span>
          );
        })}
      </div>

      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={`shrink-0 rounded-full p-0.5 transition-all duration-200
          disabled:opacity-0 disabled:text-gray-200
          ${canScrollLeft ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800" : ""}
        `}
        aria-label="scroll left"
      >
        <ChevronLeft className="size-4 mt-1" />
      </button>

      <span
        aria-label="Cute cat peeking"
        className="absolute mb-6 right-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 pointer-events-none"
      >
        <img src={catIcon} alt="cat" className="w-4 h-4 object-cover" />
      </span>
    </div>
  );
};

export default Breadcrumbs;
