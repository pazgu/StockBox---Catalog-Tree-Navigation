import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "../../../../context/UserContext";
import { userService } from "../../../../services/UserService";
import { ProductsService } from "../../../../services/ProductService";
import { categoriesService } from "../../../../services/CategoryService";
import { ProductDto, ProductDataDto } from "../../../models/product.models";
import { CategoryDTO } from "../../../models/category.models";

type FilterType = "all" | "products" | "categories";

interface FavoriteItem {
  id: string;
  type: "product" | "category";
}

export const Favorites: React.FC = () => {
  const { user , id } = useUser();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      loadFavorites();
    }
    window.scrollBy({ top: 10, behavior: "smooth" });
  }, [id]); 
  const loadFavorites = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const userFavorites = await userService.getFavorites(id);  // ← השתמש ב-id
        setFavorites(userFavorites);
        const productIds = userFavorites
          .filter((fav: FavoriteItem) => fav.type === "product")
          .map((fav: FavoriteItem) => fav.id);      
        const categoryIds = userFavorites
          .filter((fav: FavoriteItem) => fav.type === "category")
          .map((fav: FavoriteItem) => fav.id);
        if (categoryIds.length > 0) {
          const categoryPromises = categoryIds.map((categoryId: string) =>
            categoriesService.getCategoryById(categoryId).catch(err => {
              console.error(`Failed to load category ${categoryId}:`, err);
              return null;
            })
          );
          const loadedCategories = await Promise.all(categoryPromises);
          const validCategories = loadedCategories.filter(c => c !== null) as CategoryDTO[];
          setCategories(validCategories);
        }
        if (productIds.length > 0) {
          const productPromises = productIds.map((productId: string) =>
            ProductsService.getById(productId).catch(err => {
              console.error(`Failed to load product ${productId}:`, err);
              return null;
            })
          );
          const loadedProducts = await Promise.all(productPromises);
          const validProducts = loadedProducts.filter(p => p !== null) as ProductDto[];
          setProducts(validProducts);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        toast.error("שגיאה בטעינת המועדפים");
      } finally {
        setLoading(false);
      }
    };
    const toggleProductFavorite = async (productId: string, productName: string) => {
      if (!id) {
        toast.error("יש להתחבר כדי להוסיף למועדפים");
        return;
      }
      try {
        await userService.toggleFavorite(id, productId, "product");
        const isFavorite = favorites.some(fav => fav.id === productId);
        if (isFavorite) {
          setFavorites(prev => prev.filter(fav => fav.id !== productId));
          setProducts(prev => prev.filter(p => p._id !== productId));
          toast.info(`${productName} הוסר מהמועדפים`);
        } else {
          toast.success(`${productName} נוסף למועדפים`);
        }
      } catch (error) {
        toast.error("שגיאה בעדכון המועדפים");
      }
    };
    const toggleCategoryFavorite = async (categoryId: string, categoryName: string) => {
      if (!id) {
        toast.error("יש להתחבר כדי להוסיף למועדפים");
        return;
      }
      try {
        await userService.toggleFavorite(id, categoryId, "category");  // ← השתמש ב-id
        const isFavorite = favorites.some(fav => fav.id === categoryId);
        if (isFavorite) {
          setFavorites(prev => prev.filter(fav => fav.id !== categoryId));
          setCategories(prev => prev.filter(c => c._id !== categoryId));
          toast.info(`${categoryName} הוסר מהמועדפים`);
        } else {
          toast.success(`${categoryName} נוסף למועדפים`);
        }
      } catch (error) {
        toast.error("שגיאה בעדכון המועדפים");
      }
    };
  const showCategories = activeFilter === "all" || activeFilter === "categories";
  const showProducts = activeFilter === "all" || activeFilter === "products";
  if (!id) {
    return (
      <div className="pt-32 text-center">
        <p className="text-gray-600 text-lg">יש להתחבר כדי לצפות במועדפים</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="pt-32 text-center">
        <p className="text-gray-600 text-lg">טוען מועדפים...</p>
      </div>
    );
  }
  if (products.length === 0 && categories.length === 0) {
    return (
      <div className="pt-32">
        <h1 className="mr-4 text-right text-3xl font-bold mb-6 text-blue-950">
          מועדפים
        </h1>
        <p className="text-gray-600 text-center mt-40 text-lg">
          אין מועדפים כרגע.
        </p>
      </div>
    );
  }
  return (
    <div className="pt-32">
      <h1 className="mr-4 text-right text-3xl font-bold mb-6 text-blue-950">
        מועדפים
      </h1>
      {/* Filter Buttons */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "all"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          הכל
        </button>
        <button
          onClick={() => setActiveFilter("categories")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "categories"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          קטגוריות
        </button>
        <button
          onClick={() => setActiveFilter("products")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "products"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          מוצרים
        </button>
      </div>
      {/* Categories Section */}
      {showCategories && categories.length > 0 && (
        <>
          <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
            קטגוריות מועדפות
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 m-8">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="relative bg-white rounded-xl p-6 text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleCategoryFavorite(cat._id, cat.categoryName)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <Heart
                    size={22}
                    strokeWidth={2}
                    className="fill-red-500 text-red-500"
                  />
                </button>
                <Link to={`/categories${cat.categoryPath}`}>
                  <img
                    src={cat.categoryImage}
                    alt={cat.categoryName}
                    className="w-[100px] h-[100px] object-contain mx-auto mb-3"
                  />
                </Link>
                <p className="font-semibold text-slate-800">{cat.categoryName}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Products Section */}
      {showProducts && products.length > 0 && (
        <>
          <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
            מוצרים מועדפים
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(273px,1fr))] gap-8 m-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="relative bg-white rounded-xl p-8 text-center shadow-lg transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleProductFavorite(product._id!, product.productName)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <Heart
                    size={22}
                    strokeWidth={2}
                    className="fill-red-500 text-red-500"
                  />
                </button>
                <Link to={`/products${product.productPath}`}>
                  <img
                    src={product.productImages?.[0] || "/placeholder.png"}
                    alt={product.productName}
                    className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
                  />
                </Link>
                <span className="block text-base font-semibold text-slate-800 mb-1">
                  {product.productName}
                </span>
                {product.productDescription && (
                  <small className="block text-sm text-gray-500">
                    {product.productDescription}
                  </small>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;