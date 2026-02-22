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
  const { id } = useUser();
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
        const userFavorites = await userService.getFavorites();
        setFavorites(userFavorites);
        let failedProducts = 0;
        let failedCategories = 0;

        const productIds = userFavorites
          .filter((fav: FavoriteItem) => fav.type === "product")
          .map((fav: FavoriteItem) => fav.id);      
        const categoryIds = userFavorites
          .filter((fav: FavoriteItem) => fav.type === "category")
          .map((fav: FavoriteItem) => fav.id);
        if (categoryIds.length > 0) {
          const categoryPromises = categoryIds.map((categoryId: string) =>
            categoriesService.getCategoryById(categoryId).catch((err) => {
  failedCategories += 1;
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
            ProductsService.getById(productId).catch((err) => {
  failedProducts += 1;
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

  const isFavorite = favorites.some((fav) => fav.id === productId);

  try {
    await userService.toggleFavorite(productId, "product");

    if (isFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.info(`${productName} הוסר מהמועדפים`);
      return;
    }

    setFavorites((prev) => [...prev, { id: productId, type: "product" }]);

    const fullProduct = await ProductsService.getById(productId);
    if (fullProduct) {
      setProducts((prev) => [fullProduct, ...prev]);
    }

    toast.success(`${productName} נוסף למועדפים`);
  } catch (error) {
    toast.error("שגיאה בעדכון המועדפים");
  }
};

    const toggleCategoryFavorite = async (categoryId: string, categoryName: string) => {
  if (!id) {
    toast.error("יש להתחבר כדי להוסיף למועדפים");
    return;
  }

  const isFavorite = favorites.some((fav) => fav.id === categoryId);

  try {
    await userService.toggleFavorite(categoryId, "category");

    if (isFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== categoryId));
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      toast.info(`${categoryName} הוסר מהמועדפים`);
      return;
    }

    setFavorites((prev) => [...prev, { id: categoryId, type: "category" }]);

    const fullCategory = await categoriesService.getCategoryById(categoryId);
    if (fullCategory) {
      setCategories((prev) => [fullCategory, ...prev]);
    }

    toast.success(`${categoryName} נוסף למועדפים`);
  } catch (error) {
    toast.error("שגיאה בעדכון המועדפים");
  }
};

  const showCategories = activeFilter === "all" || activeFilter === "categories";
  const showProducts = activeFilter === "all" || activeFilter === "products";
  if (!id) {
    return (
       <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">
          יש להתחבר כדי לצפות במועדפים
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="mt-12 p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-700 text-xl">טוען מועדפים...</div>
      </div>
    );
  }
  if (products.length === 0 && categories.length === 0) {
    return (
      <div className="mt-12 p-4 font-system direction-rtl text-right overflow-x-hidden" style={{ direction: "rtl" }}>
        <div className="text-right mt-16 mb-6">
          <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
            מועדפים
          </h2>
          <p className="text-slate-500 text-lg">
            הפריטים והקטגוריות המועדפים עליך
          </p>
        </div>
        <div className="w-full h-40 flex flex-col justify-center items-center my-12 text-slate-500">
          <Heart size={64} className="mb-4 text-slate-300" />
          <p className="text-lg">אין מועדפים כרגע</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-12 p-4 font-system direction-rtl text-right overflow-x-hidden" style={{ direction: "rtl" }}>
      <div className="text-right mt-16 mb-6">
        <h2 className="text-5xl font-light text-slate-700 mb-2 tracking-tight">
          מועדפים
        </h2>
        <p className="text-slate-500 text-lg">
          הפריטים והקטגוריות המועדפים עליך
        </p>
      </div>
      {/* Filter Buttons */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap mt-8">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "all"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          הכל ({products.length + categories.length})
        </button>
        <button
          onClick={() => setActiveFilter("categories")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "categories"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          קטגוריות ({categories.length})
        </button>
        <button
          onClick={() => setActiveFilter("products")}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            activeFilter === "products"
              ? "bg-blue-950 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          מוצרים ({products.length})
        </button>
      </div>
      {activeFilter === "categories" && categories.length === 0 && (
        <div className="w-full h-40 flex flex-col justify-center items-center my-12 text-slate-500">
          <Heart size={48} className="mb-4 text-slate-300" />
          <p className="text-lg">אין קטגוריות מועדפות כרגע</p>
        </div>
      )}
      {activeFilter === "products" && products.length === 0 && (
        <div className="w-full h-40 flex flex-col justify-center items-center my-12 text-slate-500">
          <Heart size={48} className="mb-4 text-slate-300" />
          <p className="text-lg">אין מוצרים מועדפים כרגע</p>
        </div>
      )}

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
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleCategoryFavorite(cat._id, cat.categoryName)}
                    className="peer p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <Heart
                      size={22}
                      strokeWidth={2}
                      className="fill-red-500 text-red-500"
                    />
                  </button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    הסר ממועדפים
                  </span>
                </div>
                <Link to={`${cat.categoryPath}`}>
                  <img
                    src={cat.categoryImage}
                    alt={cat.categoryName}
                    className="w-[100px] h-[100px] object-contain mx-auto mb-3"
                  />
                </Link>
               <div className="relative group/tooltip flex justify-center">
                  <p 
                    className="font-semibold text-slate-800 line-clamp-2"
                    style={{ overflowWrap: 'anywhere', direction: /[\u0590-\u05FF]/.test(cat.categoryName) ? 'rtl' : 'ltr' }}
                  >
                    {cat.categoryName}
                  </p>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-10 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {cat.categoryName}
                </span>
                </div>
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
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => toggleProductFavorite(product._id!, product.productName)}
                    className="peer p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                  >
                    <Heart
                      size={22}
                      strokeWidth={2}
                      className="fill-red-500 text-red-500"
                    />
                  </button>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 peer-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-20">
                    הסר ממועדפים
                  </span>
                </div>
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.productImages?.[0] || "/placeholder.png"}
                    alt={product.productName}
                    className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
                  />
                </Link>
                <span 
                  className="block text-base font-semibold text-slate-800 mb-1 line-clamp-2"
                  style={{ overflowWrap: 'anywhere', direction: /[\u0590-\u05FF]/.test(product.productName) ? 'rtl' : 'ltr' }}
                >
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