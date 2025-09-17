import React, { FC } from 'react';
import Header from '../../../LayoutArea/Header/Header';
import './AllUsers.css';

interface AllUsersProps {}

const AllUsers: FC<AllUsersProps> = () => {
  return (
    <div className="AllUsers">
      <Header />
      <main className="main-content">
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">כל המשתמשים</h1>
            <p className="subtitle">הצג סינון</p>
          </div>
          <button className="add-button">+</button>
        </div>

        <div className="contact-grid">
          {/* Row 1 */}
          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-actions">
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 2a1.9 1.9 0 0 1 2.6 2.6L4.8 13.9 1 15l1.1-3.8L11.5 2z" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <button className="action-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4m2 0v9a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V4h9zM6.5 7v4M9.5 7v4" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="contact-avatar">
              <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="contact-info">
              <div className="contact-label">שם:</div>
              <div className="contact-name">ליאלי עמנואלי</div>
              <div className="contact-email">lali@outlook.com</div>
            </div>
          </div>
        </div>

        <div className="pagination">
          <button className="pagination-nav">הקודם</button>
          <button className="pagination-btn">1</button>
          <button className="pagination-btn active">2</button>
          <button className="pagination-btn">3</button>
          <div className="pagination-ellipsis">...</div>
          <button className="pagination-btn">8</button>
          <button className="pagination-nav">הבא</button>
        </div>
      </main>
    </div>
  );
};

export default AllUsers;