# grpsevenblogsite

Full-stack blog website project with separate frontend and backend folders.

## Stack
- Frontend: React + React Bootstrap + Bootswatch (no Vite)
- Backend: Node.js + Express

## Project Structure
- `frontend/` - Reader-facing blog interface
- `backend/` - API serving published article data

## Local Run
### 1) Backend
```bash
cd backend
npm install
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
npm start
```

The frontend reads from `REACT_APP_API_URL` and defaults to `http://localhost:5000/api`.

## Content Requirements Coverage
- Single published article rendered from backend
- 700-800 word validated article content
- Expository structure (introduction, body, conclusion, transitions)
- APA-style source list
- Visible member roles/contributions section
