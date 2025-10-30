import React, { FC } from "react";
import logoImage from "../../../assets/keremlogo.png";

interface FooterProps {}

const Footer: FC<FooterProps> = () => {
  return (
    <footer
      className="w-full mt-8 py-3 bg-[#fffaf1] text-gray-700"
      role="contentinfo"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-row-reverse items-center justify-center gap-2">
          {/* Logo on the far right */}
          <img
            src={logoImage}
            alt="לוגו הכרם"
            className="h-5 w-auto object-contain"
          />

          {/* Text next to it, RTL order looks correct */}
          <p className="text-sm whitespace-nowrap">
            © כל הזכויות שמורות 2025
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
