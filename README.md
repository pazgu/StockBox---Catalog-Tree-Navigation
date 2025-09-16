# StockBox---Catalog-Tree-Navigation
This project implements a hierarchical navigation system (Tree View) for managing categories, subcategories, and products. The chosen storage strategy is Materialized Path, which provides: Fast queries for retrieving all subcategories and items under a parent. Simple sorting by hierarchy depth. Requires updates to paths when moving categories.

## 🚀 טכנולוגיות עיקריות

### Frontend
- **React 18.x** 
- **React Router DOM 6.x** 
- **React Hook Form** 
- **Zod** 
- **Axios**
- **TailwindCSS** 
- **Shadcn/UI**
- **Framer Motion** =

### Backend
- **Nest.js 10.x (Node.js)** 
- **TypeScript** 
- **Mongoose** 
- **Class-Validator / Class-Transformer** 
- **JWT** 
- **Swagger** 

### Database
- **MongoDB 6.x** 
- **MongoDB Atlas** 
- **Aggregation Pipelines** 

### Collaboration & DevOps
- **Git + GitHub**
- **Docker & Docker Compose** 
- **ESLint + Prettier** 
- **Husky + lint-staged** 
- **Jira** 

---

## 🛠 התקנת פרויקט מקומית

### דרישות מוקדמות
- Node.js **v20.x**
- npm או pnpm/yarn
- Docker & Docker Compose
- MongoDB Compass (לא חובה, לניהול DB)

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
