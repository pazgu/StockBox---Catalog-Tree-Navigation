import { useRef, useCallback } from "react";
import { toast } from "sonner";
import { userService } from "../services/UserService";

type FavoriteType = "product" | "category";

interface PendingFavorite {
  id: string;
  name: string;
  type: FavoriteType;
  originalFavorite: boolean;
}

export function useDebouncedFavorite(
  items: any[],
  setItems: (fn: (prev: any[]) => any[]) => void,
  delay = 500,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<PendingFavorite | null>(null);

  const toggleFavorite = useCallback(
    (itemId: string, itemName: string, itemType: FavoriteType) => {
      const originalItem = items.find((x) => x.id === itemId);
      const originalFavorite = originalItem?.favorite ?? false;

      setItems((prev) =>
        prev.map((x) =>
          x.id === itemId ? { ...x, favorite: !x.favorite } : x,
        ),
      );

      pendingRef.current = {
        id: itemId,
        name: itemName,
        type: itemType,
        originalFavorite,
      };

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        const currentItem = pendingRef.current;
        if (!currentItem) return;

        try {
          await userService.toggleFavorite(currentItem.id, currentItem.type);

          if (currentItem.originalFavorite) {
            if (currentItem.type === "category") {
              toast.info(`${currentItem.name} הוסרה מהמועדפים`);
            } else {
              toast.info(`${currentItem.name} הוסר מהמועדפים`);
            }
          } else {
            if (currentItem.type === "category") {
              toast.success(`${currentItem.name} נוספה למועדפים`);
            } else {
              toast.success(`${currentItem.name} נוסף למועדפים`);
            }
          }
        } catch (err) {
          setItems((prev) =>
            prev.map((x) =>
              x.id === currentItem.id
                ? { ...x, favorite: currentItem.originalFavorite }
                : x,
            ),
          );
          toast.error("שגיאה בעדכון המועדפים");
        } finally {
          pendingRef.current = null;
        }
      }, delay);
    },
    [items, setItems, delay],
  );

  return toggleFavorite;
}
