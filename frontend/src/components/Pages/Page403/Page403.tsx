import React, { FC } from "react";
import page403 from "../../../assets/page403.png";

interface Page403Props {}

const Page403: FC<Page403Props> = () => (
  <div className="min-h-80 flex justify-center items-start bg-[#FFFAF1] pt-9 px-8 rtl text-center font-sans">
    <div className="max-w-md flex flex-col items-center gap-5">
      <img
        src={page403}
        alt="403"
        className="w-[300px] h-auto object-contain"
      />
      <h1 className="-mt-36 text-3xl font-bold text-gray-700">
        אין לך הרשאה לצפות בעמוד הזה
      </h1>
      <p className="-mt-2 mb-5 text-lg text-gray-700">
        פנה למנהל המערכת אם אתה חושב שזו טעות.
      </p>
      <a href="/" className="inline-block -mt-7 bg-[#0D305B] text-white px-7 py-3 rounded-lg font-semibold text-base transition-transform duration-200 hover:bg-[#0a2340] hover:shadow-lg">חזרה לאודות</a>
    </div>
  </div>
);

export default Page403;