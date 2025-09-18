import React, { FC, useState } from 'react';

import './Login.css';
import loginImg from '../../../../assets/login.png';

interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <div className="Login">
      <div className="login-form-section">
        <div className="login-container">
          <h1 className="login-title">התחברות</h1>
 
          <form className="login-form">
            <div className="form-group">
              <label className="form-label">דואר אלקטרוני</label>
              <div className="input-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input email-input"
                  placeholder="הכנס דואר אלקטרוני..."
                  dir="rtl"
                />
                <svg className="input-icon email-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">סיסמה</label>
              <div className="input-container">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="הכנס סיסמה..."
                  dir="rtl"
                />
                <svg className="input-icon password-lock-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
            </div>

            <button type="submit" className="login-button">
              <span className="button-text">התחבר</span>
            </button>
          </form>
        </div>
      </div>
      <div className="login-image-section">
        <img src={loginImg} alt="תמונת התחברות" className="login-image" />
      </div>
    </div>
  );
};

export default Login;