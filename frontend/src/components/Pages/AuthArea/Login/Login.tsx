import React, { FC, useState } from 'react';
import loginImg from '../../../../assets/login.png';

interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="h-240 pt-14 bg-gray-100 flex p-0 overflow-hidden box-border w-full">
      <div className="flex-1 flex justify-center items-center ">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 mt-6 border border-slate-100 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-right text-gray-800 mb-6 -mt-3">התחברות</h1>
 
          <div className="mb-0">
            <div className="mb-7">
              <label className="block text-right text-gray-700 font-semibold mb-4 text-base">דואר אלקטרוני</label>
              <div className="relative w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 pl-11 border-2 border-gray-300 rounded-lg text-right text-sm transition-all duration-200 bg-gray-50 h-11 focus:outline-none focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-100 hover:border-gray-400 placeholder-gray-400"
                  placeholder="הכנס דואר אלקטרוני..."
                  dir="rtl"
                />
                <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-200 w-5 h-5" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>
            <div className="mb-7">
              <label className="block text-right text-gray-700 font-semibold mb-4 text-base">סיסמה</label>
              <div className="relative w-full">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-4 pl-11 border-2 border-gray-300 rounded-lg text-right text-sm transition-all duration-200 bg-gray-50 h-11 focus:outline-none focus:border-indigo-600 focus:shadow-lg focus:shadow-indigo-100 hover:border-gray-400 placeholder-gray-400"
                  placeholder="הכנס סיסמה..."
                  dir="rtl"
                />
                <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-200 w-5 h-5" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
            </div>

            <button type="button" 
              onClick={(e) => {
                e.preventDefault();
                console.log('Login attempt:', { email, password });
              }}
              className="w-full bg-blue-900 text-white py-3.5 px-5 border-none rounded-lg font-semibold text-base cursor-pointer transition-all duration-200 mt-5 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30 active:scale-97 focus:outline-none focus:shadow-lg focus:shadow-blue-400/30"
            >
              <span>התחבר</span>
            </button>
          </div>
        </div>
      </div>
      <div className=" sticky flex-1 flex items-center justify-center p-0">
        <img src={loginImg} alt="תמונת התחברות" className="w-full h-auto object-cover" />
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