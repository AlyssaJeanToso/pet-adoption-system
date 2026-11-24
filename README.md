# PawHome — Simple Pet Adoption Management System

A responsive, school-project-ready pet adoption system built with **React (JavaScript)**, **Node.js + Express**, and **SQLite**.

- Users can register, log in, browse/search pets, view details, apply to adopt, and track application status.
- Admins can log in, see a dashboard, and manage pets and adoption applications (full CRUD + approvals).
- All pets, users and applications come from SQLite — no hardcoded frontend data.
- Runs locally only. No paid hosting or Render deployment is used.

---

## 1. Project structure

Every file below is already created inside `pet-adoption-system/`.

```text
pet-adoption-system/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── applicationsController.js
│   │   ├── authController.js
│   │   └── petsController.js
│   ├── database/
│   │   ├── database.js          # schema, relationships + first-run seed data
│   │   ├── helpers.js           # promise wrappers around sqlite3
│   │   └── petadoption.db       # created automatically when the server starts
│   ├── middleware/
│   │   └── auth.js              # JWT verification + admin role guard
│   └── routes/
│       ├── adminRoutes.js
│       ├── applicationRoutes.js
│       ├── authRoutes.js
│       └── petRoutes.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html               # React mount page (not a separate app page)
    ├── public/
    │   └── pet-placeholder.svg
    └── src/
        ├── App.js               # routes + protected routes (plain JS entry)
        ├── AuthContext.jsx      # login state shared across pages
        ├── api.js               # fetch wrapper with JWT header
        ├── constants.js
        ├── index.js             # React entry point (plain JS entry)
        ├── styles.css           # cream / green / orange theme
        ├── components/
        │   ├── Alert.jsx
        │   ├── Footer.jsx
        │   ├── Loading.jsx
        │   ├── Navbar.jsx
        │   ├── PetCard.jsx
        │   └── PetForm.jsx
        └── pages/
            ├── AdminDashboardPage.jsx
            ├── ApplyPage.jsx
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── ManageApplicationsPage.jsx
            ├── ManagePetsPage.jsx
            ├── MyApplicationsPage.jsx
            ├── NotFoundPage.jsx
            ├── PetDetailsPage.jsx
            ├── PetsPage.jsx
            └── RegisterPage.jsx
```

`App.js` and `index.js` remain plain JavaScript files as requested. The visual components use `.jsx` (still JavaScript + React) because Vite's production transform expects JSX in `.jsx` files.

### Pages and their files

| Page | Route | File |
| --- | --- | --- |
| Home | `/` | `frontend/src/pages/HomePage.jsx` |
| Pet listing | `/pets` | `frontend/src/pages/PetsPage.jsx` |
| Pet details | `/pets/:id` | `frontend/src/pages/PetDetailsPage.jsx` |
| Login | `/login` | `frontend/src/pages/LoginPage.jsx` |
| Registration | `/register` | `frontend/src/pages/RegisterPage.jsx` |
| Adoption application | `/apply/:id` | `frontend/src/pages/ApplyPage.jsx` |
| My applications | `/applications` | `frontend/src/pages/MyApplicationsPage.jsx` |
| Admin dashboard | `/admin` | `frontend/src/pages/AdminDashboardPage.jsx` |
| Manage pets | `/admin/pets` | `frontend/src/pages/ManagePetsPage.jsx` |
| Manage applications | `/admin/applications` | `frontend/src/pages/ManageApplicationsPage.jsx` |

---

## 2. Requirements

- Node.js 20.17+ (Node 22 LTS recommended; Node 26 also works)
- npm
- A modern browser

No global packages are required.

---

## 3. Run locally

Open **two terminals**.

### Terminal 1 — Backend (port 5000)

```bash
cd pet-adoption-system/backend
npm install
npm start
```

Expected output:

```text
SQLite database ready: ...\backend\database\petadoption.db
Seeded demo users and pets.
Backend running at http://localhost:5000
```

Use `npm run dev` instead of `npm start` if you want auto-restart on file changes.

### Terminal 2 — Frontend (port 5173)

```bash
cd pet-adoption-system/frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so the browser only talks to the frontend origin. CORS is also enabled on the backend.

**If port 5000 is already used** on your machine, choose another port for the backend and tell the frontend where to find it:

```bash
# Terminal 1
cd pet-adoption-system/backend
$env:PORT=5001        # PowerShell
# export PORT=5001    # macOS/Linux
npm start
```

```bash
# Terminal 2
cd pet-adoption-system/frontend
# Create frontend/.env with: VITE_BACKEND_URL=http://localhost:5001
npm run dev
```

**If npm reports install scripts were not approved**, run these once after `npm install`:

```bash
# in backend/
npm install-scripts approve sqlite3

# in frontend/
npm install-scripts approve esbuild
```

On a normal npm installation these scripts run automatically.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pets.com` | `admin123` |
| User | `user@pets.com` | `user123` |

These rows are inserted into SQLite only on the very first run. You can also register your own user account from the UI.

### Optional production build (still local)

```bash
cd pet-adoption-system/frontend
npm run build
cd ../backend
npm start
```

When `frontend/dist` exists, Express serves the built React app at <http://localhost:5000> as well.

---

## 4. Database

`backend/database/database.js` creates exactly three main tables:

- **users** — `id, name, email, password, role` (`user` or `admin`)
- **pets** — `id, name, type, breed, age, gender, description, image, status`
- **applications** — `id, user_id, pet_id, reason, status, created_at`

Relationships (foreign keys):

- `applications.user_id → users.id`
- `applications.pet_id → pets.id`

`ON DELETE CASCADE` keeps the tables consistent when a user or pet is removed. Passwords are hashed with `bcryptjs`; authentication uses a JWT stored in `localStorage`.

To reset the demo database, stop the backend and delete `backend/database/petadoption.db`, then start the backend again.

---

## 5. API endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Register a regular user |
| POST | `/auth/login` | Public | Log in and get a token |
| GET | `/auth/me` | Logged in | Current account |
| GET | `/pets?q=&type=&status=` | Public | List pets (`status` defaults to `available`; `all` shows every pet) |
| GET | `/pets/:id` | Public | One pet |
| POST | `/pets` | Admin | Add a pet |
| PUT | `/pets/:id` | Admin | Edit a pet / change availability |
| DELETE | `/pets/:id` | Admin | Delete a pet |
| POST | `/applications` | User | Submit an application |
| GET | `/applications/mine` | User | My applications |
| GET | `/applications?status=` | Admin | All applications |
| GET | `/applications/:id` | Logged in | One application (owner or admin) |
| PUT | `/applications/:id/status` | Admin | Approve or reject |
| GET | `/admin/dashboard` | Admin | Dashboard counts + recent applications |

Protected routes require the header `Authorization: Bearer <token>`, which `frontend/src/api.js` adds automatically.

---

## 6. Build phases (how the code maps to the instructions)

1. **Setup React and Express** — `frontend/package.json`, `vite.config.js`, `backend/package.json`, `server.js`.
2. **SQLite database and tables** — `backend/database/database.js` and `helpers.js`.
3. **Registration and login** — `authController.js`, `auth.js`, `authRoutes.js`, `AuthContext.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`.
4. **Home and pet listings** — `HomePage.jsx`, `PetsPage.jsx`, `PetDetailsPage.jsx`, `PetCard.jsx`, `petsController.js`.
5. **Pet management** — `ManagePetsPage.jsx`, `PetForm.jsx`, admin checks in `petRoutes.js`.
6. **Adoption application** — `ApplyPage.jsx`, `MyApplicationsPage.jsx`, `applicationsController.js`.
7. **Admin dashboard** — `AdminDashboardPage.jsx`, `ManageApplicationsPage.jsx`, `adminController.js`.
8. **Connect and test** — `api.js`, `vite.config.js` proxy, `App.js` protected routes, and the test flow below.

---

## 7. Quick test flow

1. Log in as the demo **user**.
2. Open any pet → **Apply now** → write a reason of at least 10 characters → submit.
3. Open **My Applications** and confirm the status is `pending`.
4. Log out, log in as the **admin**.
5. Dashboard: confirm the request count increased.
6. **Manage applications** → approve the pending request.
7. **Manage pets**: confirm that pet's status is now `adopted`.
8. Try adding, editing and deleting a pet; refresh the page to confirm changes persist in SQLite.

All forms validate input and show success/error messages. Navigation links, search, filters, approve/reject, CRUD buttons and logout are all connected to the API.

---

## 8. Upload to GitHub

Create an empty repository on GitHub first, then run:

```bash
cd pet-adoption-system
git init
git add .
git commit -m "Initial commit: Pet Adoption Management System"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repository>.git
git push -u origin main
```

The `.gitignore` excludes `node_modules/`, `frontend/dist/`, `.env` files and the generated `*.db` file, so only source code is committed.

---

## 9. Notes

- The frontend is React with JavaScript only — there are no TypeScript files and no separate plain HTML pages for the app UI.
- `frontend/public/index.html` is only the standard React mount document.
- Pet images use URLs stored in the database; if an image cannot load, a local SVG placeholder is shown.
- Change `JWT_SECRET` in `backend/.env` for anything beyond a local demo. Copy `.env.example` to `.env` to customise `PORT`, `JWT_SECRET` or `DB_PATH`.
