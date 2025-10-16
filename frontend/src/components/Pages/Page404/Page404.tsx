import React, { FC } from 'react';
import page404 from '../../../assets/page404.png';

interface Page404Props {}

const Page404: FC<Page404Props> = () => (
  <div className="min-h-screen flex justify-center items-start bg-[#FFFAF1] pt-16 px-8 pb-10 rtl text-center font-sans">
    <div className="max-w-md flex flex-col items-center gap-5">
      <img
        src={page404}
        alt="404"
        className="w-[280px] h-auto object-contain mt-12"
      />
      <h1 className="-mt-28 text-3xl font-bold text-gray-700">
        העמוד שחיפשת לא נמצא
      </h1>
      <p className="-mt-2 mb-5 text-lg text-gray-700">
        יתכן שהקישור שגוי או שהעמוד הועבר למקום אחר.
      </p>
      <a
        href="/"
        className="inline-block -mt-7 bg-[#0D305B] text-white px-7 py-3 rounded-lg font-semibold text-base transition-transform duration-200 hover:bg-[#0a2340] hover:-translate-y-0.5 hover:shadow-lg"
      >
        חזור לדף הבית
      </a>
    </div>
  </div>
);

export default Page404;
