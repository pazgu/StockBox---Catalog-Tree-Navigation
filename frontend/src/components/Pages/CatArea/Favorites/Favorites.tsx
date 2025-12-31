// // import React, { useEffect, useState } from "react";
// // import { initialCameraData, type CameraProduct } from "../SingleCat/SingleCat";
// // import { Heart } from "lucide-react";
// // import { useUser } from "../../../../context/UserContext";
// // import { Categories as CategoriesData } from "../Categories/Categories";
// // import { initialCategories, type Category } from "../Categories/Categories";
// // import { Navigate } from "react-router-dom";
// // import { Link } from "react-router-dom";
// // import { toast } from "sonner";

// //MISSING SUBCATS LOGIC HERE AFTER BACKEND EXISTS IT MAY BE ADDED
// type FilterType = "all" | "products" | "categories" | "subcategories";

// export const Favorites: React.FC = () => {
//   const [cameras, setCameras] = useState<CameraProduct[]>(initialCameraData);
//   const [categories, setCategories] = useState<Category[]>(initialCategories);
//   const [activeFilter, setActiveFilter] = useState<FilterType>("all");
//   const favoriteCameras = cameras.filter((camera) => camera.favorite);
//   const favoriteCategories = categories.filter((cat) => cat.favorite);

//   useEffect(() => {
//     window.scrollBy({ top: 10, behavior: "smooth" });
//   }, []);

//   const toggleFavorite = (id: number) => {
//     setCameras((prev) => {
//       const updated = prev.map((cam) =>
//         cam.id === id ? { ...cam, favorite: !cam.favorite } : cam
//       );
//       return updated;
//     });

//     const camera = cameras.find((c) => c.id === id);
//     if (camera && camera.favorite) {
//       toast.info(`${camera.name} הוסר מהמועדפים`);
//     }
//   };

//   const toggleCategoryFavorite = (id: number) => {
//     setCategories((prev) => {
//       const updated = prev.map((cat) =>
//         cat.id === id ? { ...cat, favorite: !cat.favorite } : cat
//       );
//       return updated;
//     });

//     const category = categories.find((c) => c.id === id);
//     if (category && category.favorite) {
//       toast.info(`${category.name} הוסר מהמועדפים`);
//     }
//   };

//   const showCategories =
//     activeFilter === "all" || activeFilter === "categories";
//   const showProducts = activeFilter === "all" || activeFilter === "products";
//   const showSubcategories =
//     activeFilter === "all" || activeFilter === "subcategories";

//   if (favoriteCameras.length === 0 && favoriteCategories.length === 0) {
//     return (
//       <p className="text-gray-600 text-center mt-40 text-lg">
//         אין מועדפים כרגע.
//       </p>
//     );
//   }

//   return (
//     <div className="pt-32">
//       <h1 className="mr-4 text-right text-3xl font-bold mb-6 text-blue-950">
//         מועדפים
//       </h1>

//       {/* Filter Buttons */}
//       <div className="flex justify-center gap-3 mb-8 flex-wrap">
//         <button
//           onClick={() => setActiveFilter("all")}
//           className={`px-6 py-2 rounded-full font-medium transition-all ${
//             activeFilter === "all"
//               ? "bg-blue-950 text-white shadow-md"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           הכל
//         </button>
//         <button
//           onClick={() => setActiveFilter("categories")}
//           className={`px-6 py-2 rounded-full font-medium transition-all ${
//             activeFilter === "categories"
//               ? "bg-blue-950 text-white shadow-md"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           קטגוריות
//         </button>
//         <button
//           onClick={() => setActiveFilter("subcategories")}
//           className={`px-6 py-2 rounded-full font-medium transition-all ${
//             activeFilter === "subcategories"
//               ? "bg-blue-950 text-white shadow-md"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           תתי קטגוריות
//         </button>
//         <button
//           onClick={() => setActiveFilter("products")}
//           className={`px-6 py-2 rounded-full font-medium transition-all ${
//             activeFilter === "products"
//               ? "bg-blue-950 text-white shadow-md"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//         >
//           מוצרים
//         </button>
//       </div>

//       {/* Categories Section */}
//       {showCategories && favoriteCategories.length > 0 && (
//         <>
//           <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
//             קטגוריות מועדפות
//           </h2>
//           <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 m-8">
//             {favoriteCategories.map((cat) => (
//               <div
//                 key={cat.id}
//                 className="relative bg-white rounded-xl p-6 text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
//               >
//                 <button
//                   onClick={() => toggleCategoryFavorite(cat.id)}
//                   className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
//                 >
//                   <Heart
//                     size={22}
//                     strokeWidth={2}
//                     className={
//                       cat.favorite ? "fill-red-500 text-red-500" : "text-white"
//                     }
//                   />
//                 </button>

//                 <Link to={"/categories/single-cat"}>
//                   <img
//                     src={cat.image}
//                     alt={cat.name}
//                     className="w-[100px] h-[100px] object-contain mx-auto mb-3"
//                   />
//                 </Link>
//                 <p className="font-semibold text-slate-800">{cat.name}</p>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {/* Subcategories Section - Placeholder for when backend exists */}
//       {showSubcategories && (
//         <div className="m-8">
//           <h2 className="text-xl font-semibold text-slate-800 mb-4 text-right">
//             תתי קטגוריות מועדפות
//           </h2>
//           <p className="text-gray-500 text-center">
//             תתי קטגוריות יתווספו כשהבאקאנד יהיה מוכן
//           </p>
//         </div>
//       )}

//       {/* Products Section */}
//       {showProducts && favoriteCameras.length > 0 && (
//         <>
//           <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
//             מוצרים מועדפים
//           </h2>
//           <div className="grid grid-cols-[repeat(auto-fill,minmax(273px,1fr))] gap-8 m-8">
//             {favoriteCameras.map((camera) => (
//               <div
//                 key={camera.id}
//                 className="relative bg-white rounded-xl p-8 text-center shadow-lg transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
//               >
//                 <button
//                   onClick={() => toggleFavorite(camera.id)}
//                   className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
//                 >
//                   <Heart
//                     size={22}
//                     strokeWidth={2}
//                     className={
//                       camera.favorite
//                         ? "fill-red-500 text-red-500"
//                         : "text-white"
//                     }
//                   />
//                 </button>
//                 <Link to={"/product"}>
//                   <img
//                     src={camera.imageUrl}
//                     alt={camera.name}
//                     className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
//                   />
//                 </Link>
//                 <span className="block text-base font-semibold text-slate-800 mb-1">
//                   {camera.name}
//                 </span>
//                 <small className="block text-sm text-gray-500">
//                   {camera.lens}
//                 </small>
//                 <small className="block text-sm text-gray-500">
//                   {camera.color}
//                 </small>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Favorites;

import React, { FC } from "react";

const Favorites: FC = () => {
  return (
    <div>
      <h1>Favorites</h1>
      <p>This is your Favorites component!</p>
    </div>
  );
};

// export default Favorites;

export {};