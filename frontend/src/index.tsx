import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Layout from './components/LayoutArea/Layout/Layout';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { PathProvider } from './context/PathContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>

    <BrowserRouter>
    <UserProvider>
      <PathProvider>
          <Layout></Layout>
      </PathProvider>
    
      </UserProvider>
    
    </BrowserRouter>
    
  </React.StrictMode>

  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
