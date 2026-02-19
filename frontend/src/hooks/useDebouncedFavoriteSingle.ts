import { useRef } from "react";
import { toast } from "sonner";
import { userService } from "../services/UserService";

export function useDebouncedFavoriteSingle(delay = 500) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);

  const toggleFavorite = (
    itemId: string,
    itemName: string,
    setUser: (fn: (prev: any) => any) => void
  ) => {
    setUser((prev: any) => {
      if (!prev) return prev;
      const favorites = prev.favorites ?? [];
      const isFavorite = favorites.some((fav: any) => fav.id === itemId);
      return {
        ...prev,
        favorites: isFavorite
          ? favorites.filter((fav: any) => fav.id !== itemId)
          : [...favorites, { id: itemId, type: "product" }],
      };
    });

    clickCountRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const totalClicks = clickCountRef.current;
      clickCountRef.current = 0;

      if (totalClicks % 2 === 0) return;

      try {
        await userService.toggleFavorite(itemId, "product");

        setUser((prev: any) => {
          const isFavorite = prev?.favorites?.some((fav: any) => fav.id === itemId);
          if (isFavorite) {
            toast.success(`${itemName} נוסף למועדפים`);
          } else {
            toast.info(`${itemName} הוסר מהמועדפים`);
          }
          return prev;
        });
      } catch {
        // rollback
        setUser((prev: any) => {
          if (!prev) return prev;
          const favorites = prev.favorites ?? [];
          const isFavorite = favorites.some((fav: any) => fav.id === itemId);
          return {
            ...prev,
            favorites: isFavorite
              ? favorites.filter((fav: any) => fav.id !== itemId)
              : [...favorites, { id: itemId, type: "product" }],
          };
        });
        toast.error("שגיאה בעדכון המועדפים");
      }
    }, delay);
  };

  return toggleFavorite;
}