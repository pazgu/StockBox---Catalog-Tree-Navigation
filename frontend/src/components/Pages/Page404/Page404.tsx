import React, { FC } from 'react';
import './Page404.css';
import page404 from '../../../assets/page404.png';


interface Page404Props {}

const Page404: FC<Page404Props> = () => (
  <div className="Page404">
    <div className="page404-content">
      <img src={page404} alt="404" className="page404-image" />
      <h1 className="page404-title">העמוד שחיפשת לא נמצא</h1>
      <p className="page404-text">
        יתכן שהקישור שגוי או שהעמוד הועבר למקום אחר.
      </p>
      <a href="/" className="page404-button">חזור לדף הבית</a>
    </div>
  </div>
);

export default Page404;
