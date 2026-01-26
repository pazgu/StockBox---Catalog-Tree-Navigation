import React, { FC } from "react";
import page403 from "../../../assets/page403.png";

interface Page403Props {}

const Page403: FC<Page403Props> = () => (
  <div className="min-h-screen bg-[#FFFAF1] px-6 rtl text-center font-sans flex justify-center">
    <div className="w-full max-w-md flex flex-col items-center gap-0 pt-10 pb-8">

      <img
        src={page403}
        alt="403 - אין הרשאה"
        className="w-[280px] h-auto rounded-2xl"
      />

      <h1 className="text-2xl font-bold text-gray-700 -mt-20">

        אין לך הרשאה לצפות בעמוד הזה
      </h1>

      <a
        href="/"
        className="mt-3 inline-block bg-[#0D305B] text-white px-7 py-3 rounded-lg font-semibold text-base transition-transform duration-200 hover:bg-[#0a2340] hover:-translate-y-0.5 hover:shadow-lg"
      >
        חזרה לאודות
      </a>
    </div>
  </div>
);

export default Page403;
