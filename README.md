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
```
By default, the frontend runs at: http://localhost:5173

### Backend (Nest.js)
```bash
cd backend
npm install
npm run start:dev
```
By default, the API runs at: http://localhost:3000

### Database (MongoDB)
By default, MongoDB runs through Docker Compose:
```bash
docker-compose up -d
```
Connection string:
mongodb://localhost:27017/catalog

## 🧑‍💻 Team Workflow

Main branch: main – protected.

No direct pushes allowed, only approved PRs.

### Daily workflow
git checkout -b feature/<feature-name>
# work on your feature
git commit -m "feat: short description"
git push origin feature/<feature-name>

Open a Pull Request.

Code Review: at least one team member must approve before merging.
Commit convention: Conventional Commits
feat: new login page
fix: bug in search filter
docs: update README

## 📦 Docker Compose

The docker-compose.yml will run:
frontend (React + Vite)
backend (Nest.js)
mongodb (Database)

## 📑 Documentation

Swagger available at: http://localhost:3000/api
Jira – tasks, bugs, and sprint management.
Storybook (future) – UI components catalog.
