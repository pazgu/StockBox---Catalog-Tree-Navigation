import React, { FC } from 'react';
import logoImage from "../../../assets/keremlogo.png"
interface FooterProps {}

const Footer: FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  const copyrightText = `© ${currentYear} כל הזכויות שמורות`; 
  
  return (
    <footer className="w-full mt-8 py-3 bg-[#fffaf1] text-gray-700 text-sm fixed bottom-0">
      
      <div className="flex justify-center items-center gap-2 max-w-6xl mx-auto px-4">
        
        <span 
          className="text-xl text-blue-600 flex items-center justify-center"
        >
            <img src={logoImage} alt="Logo" className="h-4 w-auto" /> 
        </span>

        <p className="text-sm">
          {copyrightText}
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;