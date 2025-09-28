import React from "react";
import { initialCameraData, type CameraProduct } from "../SingleCat/SingleCat";

export const Favorites: React.FC = () => {
  const favoriteCameras = initialCameraData.filter((camera: CameraProduct) => camera.favorite);

  if (favoriteCameras.length === 0) {
    return <p className="text-gray-600">No favorite cameras yet.</p>;
  }

  return (
    
    <div className="pt-48 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      <h1 className="text-2xl font-bold mb-6 text-center w-full">מועדפים</h1>

      {favoriteCameras.map((camera: CameraProduct) => (
        <div 
          key={camera.id} 
          className="bg-white rounded-xl p-4 text-center shadow-lg transition-all duration-200 ease-out hover:transform hover:-translate-y-1 hover:shadow-xl"
        >
          <img
            src={camera.imageUrl}
            alt={camera.name}
            className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
          />
          <span className="block text-base font-semibold text-slate-800 mb-1">
            {camera.name}
          </span>
          <small className="block text-sm text-gray-500">{camera.lens}</small>
          <br />
          <small className="block text-sm text-gray-500">{camera.color}</small>
        </div>
      ))}
    </div>
  );
};

export default Favorites;