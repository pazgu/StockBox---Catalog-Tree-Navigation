import React, { FC, useEffect, useState } from "react";
import loginImg from "../../../../assets/login.png";
import { MailQuestionIcon, UserPen, AtSign } from "lucide-react";
interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  return (
    <div className="h-230 pt-14 bg-gray-100 flex p-0 overflow-hidden box-border w-full">
      <div className="flex-1 flex justify-center items-center ">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 mt-6 border border-slate-100 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-right text-gray-800 mb-6 -mt-3">
            התחברות
          </h1>
          <div className="mb-0">
            {/* Email field */}
            <div className="mb-7">
              <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                דואר אלקטרוני
              </label>
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 pl-11 border-2 border-gray-300 rounded-lg text-right text-sm transition-all duration-200 bg-gray-50 h-11 focus:outline-none focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-100 hover:border-gray-400 placeholder-gray-400"
                  placeholder="הכנס דואר אלקטרוני..."
                  dir="rtl"
                />
                <AtSign
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Username field */}
            <div className="mb-7">
              <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                שם משתמש
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-3 px-4 pl-11 border-2 border-gray-300 rounded-lg text-right text-sm transition-all duration-200 bg-gray-50 h-11 focus:outline-none focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-100 hover:border-gray-400 placeholder-gray-400"
                  placeholder="הכנס שם משתמש..."
                  dir="rtl"
                />
                <UserPen
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("Login attempt:", { email, username });
                const email1 = "Superstockbox@outlook.com";
                const subject = encodeURIComponent(
                  `בקשה להפעלת משתמש - ${username}`
                );
                const adminLink = `http://localhost:3000/allUsers?search=${encodeURIComponent(
                  email
                )}`;

                const body = encodeURIComponent(
                  ` StockBox שלום, אשמח להפעיל את המשתמש החדש שלי  עבור  
                        ${username} : שם משתמש באתר
                          ${email} :דואר אלקטרוני באתר 
קישור למשתמש במערכת הניהול: ${adminLink}
                          
                        תודה רבה`
                );
                window.location.href = `mailto:${email1}?subject=${subject}&body=${body}`;
              }}
              title="לחץ.י לשליחת בקשה להפעלת משתמש"
              className="bg-blue-900 text-white py-3.5 px-5 border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 mt-5 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30 active:scale-97 focus:outline-none focus:shadow-lg focus:shadow-blue-400/30 flex flex-row items-center justify-center gap-2"
            >
              <span className="flex items-center gap-2">
                להפעלת משתמש
                <MailQuestionIcon />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className=" sticky flex-1 flex items-center justify-center p-0">
        <img
          src={loginImg}
          alt="תמונת התחברות"
          className="w-full h-auto object-cover"
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
