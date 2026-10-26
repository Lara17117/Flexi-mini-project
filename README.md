# 🌸 VibeVault — Your Little Universe

> *“A little space for everything that makes you, you.”*

VibeVault is a personalized, mood-adaptive aesthetic lifestyle dashboard. It seamlessly blends the dreamy feel of a personal Pinterest moodboard, a private digital journal, and a daily lifestyle organizer for your wardrobe, scrapbook, skincare rituals, and mindful movement.

The signature feature of VibeVault is its **mood-adaptive environment**: when you select how you are feeling, the entire application dynamically transforms—including its wallpaper, translucent glassmorphism panels, sidebar, navigation pills, typography accents, and decorative floral blooming elements.

---

## ✨ Key Features & Mood Atmospheres

### 1. Mood-Adaptive Visual Themes
* **☀️ Happy (Default)**: Butter yellow, sunshine gold, lemon cream, and warm ivory. Powered by the authentic aesthetic yellow floral scrapbook collage (`/happy-bg.jpeg`) with soft translucent cream panels, warm brown typography, and golden amber accents.
* **☁️ Calm**: Sage green, eucalyptus, soft cream, and airy natural serenity with peaceful botanical gradients.
* **🎀 Romantic**: Blush pink, dusty rose, delicate mauve, and poetic floral scrapbook styling.
* **🌧️ Low-key**: Powder blue, dusty periwinkle, cool cream, and quiet rainy window ambiance.
* **⚡ Energetic**: Warm coral, apricot, vibrant peach, and uplifting motivational citrus glow.

### 2. Full-Screen Opening Branded Intro
* Viewport-covering cinematic intro with deep chocolate-brown background (`#23160e`).
* Cream VibeVault wordmark with blooming flower crown motif above the dotless lowercase letter “ı”.
* Animated tagline *"YOUR LITTLE UNIVERSE"*.
* Gentle background transition to warm cream (`#faf5ee`) before smoothly revealing the main dashboard after 3 seconds.
* Respects `prefers-reduced-motion` and uses session storage to avoid annoying repeated replays on internal navigation.

### 3. Lifestyle Modules
* **👗 My Wardrobe**: Catalog clothing pieces by category (tops, bottoms, dresses, outerwear, footwear, accessories), primary color, season, and occasion. Filter by category or favorites, view image previews, and edit or delete items.
* **📖 Visual Scrapbook**: Polaroid-style photo journal with washi tape accents, dates, memories, gratitude notes, tags, and an immersive memory reader modal.
* **✨ Skincare Rituals**: Track morning and evening skincare steps, monitor your daily completion percentage with interactive checkmarks and confetti celebration, and organize your product shelf.
* **🧘 Mindful Workout**: Encouraging, nonjudgmental activity tracker celebrating gentle movement (yoga, pilates, walks, dance) without guilt or shaming language. Includes daily movement stats and philosophy callouts.
* **⚙️ Settings & Data Isolation**: Edit your display name, configure default atmosphere preferences (which sync with MongoDB), sign out, and securely delete your account and associated data.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Vanilla CSS with CSS Custom Properties (`themes.css`, `global.css`, `components.css`)
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti & Pure CSS Keyframes
- **Networking**: Axios with request/response interceptors and automatic JWT Bearer token handling

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose object modeling
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing
- **Security**: Helmet, CORS, and Express Rate Limiting
- **Embedded Database Fallback**: Built-in `mongodb-memory-server` ensuring zero-config local operation on port 27017 even before external services are started.

---

## 📂 Project Architecture

```text
25070521002/
├── frontend/
│   ├── public/
│   │   ├── happy-bg.jpeg        # Original aesthetic yellow floral collage
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx         # Distinctive wordmark with flower blooming over "ı"
│   │   │   ├── IntroScreen.jsx  # 3-second chocolate-to-cream intro animation
│   │   │   ├── Sidebar.jsx      # Persistent / responsive mood-adaptive navigation
│   │   │   ├── Header.jsx       # Greeting, live date, and user profile halo
│   │   │   ├── MoodSelector.jsx # 5 interactive mood selector cards
│   │   │   ├── FeatureCard.jsx  # Lifestyle module cards
│   │   │   └── Footer.jsx       # Subtle branded footer
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Wardrobe.jsx
│   │   │   ├── Scrapbook.jsx
│   │   │   ├── Skincare.jsx
│   │   │   ├── Workout.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   ├── MoodContext.jsx  # Theme switching, CSS variables, & cloud sync
│   │   │   └── AuthContext.jsx  # Authentication, JWT storage, & demo logins
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── styles/
│   │   │   ├── themes.css       # 5 mood themes design tokens
│   │   │   ├── global.css       # Typography, reset, glassmorphism, utilities
│   │   │   └── components.css   # Component styling & keyframe animations
│   │   ├── App.jsx              # Main routing and background layer layout
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   │   └── db.js                # Dual-mode connection (Local/Atlas + Embedded)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── wardrobeController.js
│   │   ├── scrapbookController.js
│   │   ├── skincareController.js
│   │   └── workoutController.js
│   ├── middleware/
│   │   ├── auth.js              # Protect middleware verifying JWT
│   │   └── errorHandler.js      # Global error and validation handler
│   ├── models/
│   │   ├── User.js
│   │   ├── WardrobeItem.js
│   │   ├── ScrapbookEntry.js
│   │   ├── SkincareProduct.js
│   │   ├── SkincareRoutineStep.js
│   │   ├── SkincareCompletion.js
│   │   └── Workout.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── wardrobeRoutes.js
│   │   ├── scrapbookRoutes.js
│   │   ├── skincareRoutes.js
│   │   └── workoutRoutes.js
│   ├── utils/
│   │   └── seedData.js          # Auto-seeds aesthetic demo data on clean databases
│   ├── server.js                # Express entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Installation & Setup (Windows 11)

### Prerequisites
1. **Node.js**: Verify installation in PowerShell:
   ```powershell
   node -v
   npm -v
   ```
   *(Node.js v18+ or v20+ recommended)*
2. **MongoDB Compass**: Installed on Windows to inspect collections.

---

### Step 1: Clone / Open Project
Navigate to the root folder:
```powershell
cd c:\Users\LARA\OneDrive\Desktop\25070521002
```

---

### Step 2: Configure Environment Files
The `.env` files are already configured with safe development defaults:

* **Backend (`backend/.env`)**:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/vibevault
  JWT_SECRET=super_secret_vibevault_universe_token_key_2026_aesthetic_journal
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development
  ```

* **Frontend (`frontend/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

---

### Step 3: Install Dependencies
Open PowerShell and run:

```powershell
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ..\frontend
npm install
```

---

### Step 4: Run the Backend Server
In your first PowerShell terminal:
```powershell
cd c:\Users\LARA\OneDrive\Desktop\25070521002\backend
node server.js
```

You will see:
```text
Connecting to MongoDB at: mongodb://127.0.0.1:27017/vibevault ...
✓ Embedded MongoDB started and connected successfully!
✓ Compass Connection URI: mongodb://127.0.0.1:27017/
Seeding demo account and aesthetic lifestyle items for VibeVault...
✓ VibeVault successfully seeded with demo universe for "luna@vibevault.app" / "password123"
🌸 VibeVault Server running on http://localhost:5000
🌸 Ready for your little universe!
```

---

### Step 5: Run the Frontend Application
In a separate PowerShell terminal:
```powershell
cd c:\Users\LARA\OneDrive\Desktop\25070521002\frontend
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🍃 MongoDB Compass Inspection Guide

1. Open the **MongoDB Compass** desktop application.
2. In the **New Connection** screen, enter the Connection String:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left database list, locate the **`vibevault`** database.
5. You will see the structured collections:
   - `users`: Authenticated user accounts with hashed passwords and mood settings.
   - `wardrobeitems`: Clothing items with categories, colors, seasons, and favorite flags.
   - `scrapbookentries`: Polaroid journal memories, notes, dates, and tags.
   - `skincareproducts`: Cleansers, serums, sunscreens, and instructions.
   - `skincareroutinesteps`: Morning/evening ordered steps linked to products.
   - `skincarecompletions`: Daily completion logs tagged with `YYYY-MM-DD`.
   - `workouts`: Mindful movement logs and duration minutes.
6. When you create or update items in the frontend, refresh Compass to watch the documents update live in real-time!

---

## 🔑 Demo Account & Authentication

You can register your own personal account or use the pre-seeded account:

* **Email**: `luna@vibevault.app`
* **Password**: `password123`
* **Quick Access**: Click the **"One-Click Demo Universe"** button on the Login page to sign in instantly with a single click!

---

## 📡 REST API Reference

All protected endpoints require the header `Authorization: Bearer <token>`.

### Authentication & Preferences
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (`name`, `email`, `password`, `preferredMood`) |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Fetch currently authenticated user |
| `PATCH` | `/api/users/me` | Update display name or preferred mood |
| `PATCH` | `/api/users/me/mood`| Quick-sync preferred mood with MongoDB |
| `DELETE`| `/api/users/me` | Permanently delete account and all data |

### Wardrobe
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/wardrobe` | List user items (supports `?category=`, `?season=`, `?isFavorite=`) |
| `POST` | `/api/wardrobe` | Add wardrobe item |
| `GET` | `/api/wardrobe/:id` | Get single wardrobe item |
| `PATCH`| `/api/wardrobe/:id` | Update wardrobe item or favorite flag |
| `DELETE`| `/api/wardrobe/:id`| Remove wardrobe item |

### Scrapbook
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/scrapbook` | List memories (supports `?search=`, `?tag=`, `?isFavorite=`) |
| `POST` | `/api/scrapbook` | Create polaroid memory entry |
| `GET` | `/api/scrapbook/:id`| Read single memory |
| `PATCH`| `/api/scrapbook/:id`| Update memory, tags, or favorite flag |
| `DELETE`| `/api/scrapbook/:id`| Remove memory entry |

### Skincare
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/skincare/products` | List saved skincare products |
| `POST` | `/api/skincare/products` | Add new skincare product |
| `PATCH`| `/api/skincare/products/:id` | Update skincare product |
| `DELETE`| `/api/skincare/products/:id` | Delete skincare product |
| `GET` | `/api/skincare/routine` | Get routine steps (`?timeOfDay=morning\|evening\|all`) |
| `POST` | `/api/skincare/routine` | Create routine step |
| `PATCH`| `/api/skincare/routine/:id` | Edit routine step |
| `DELETE`| `/api/skincare/routine/:id` | Delete routine step |
| `GET` | `/api/skincare/completions?date=YYYY-MM-DD` | Get daily completions |
| `POST` | `/api/skincare/completions` | Toggle step completion for specific date |

### Workout
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workouts` | List workouts (supports `?type=`, `?completed=`) |
| `POST` | `/api/workouts` | Log mindful movement activity |
| `PATCH`| `/api/workouts/:id` | Update activity or completion status |
| `DELETE`| `/api/workouts/:id` | Remove activity |
| `GET` | `/api/workouts/summary` | Get today minutes, total time, and activity breakdown |

---

## 🧪 Acceptance & Testing Verification Checklist

- [x] **Opening Intro Animation**: 3-second deep chocolate brown background with cream wordmark, blooming flower animation over "ı", tagline fade-in, smooth transition to warm cream, respects reduced motion.
- [x] **Mood Transformation**: All 5 moods switch instantly with distinct color palettes, borders, text, and active states.
- [x] **Happy Theme Background**: Displays the supplied yellow floral collage (`/happy-bg.jpeg`) with translucent cream overlay and golden brown typography.
- [x] **Brand Logo**: Custom wordmark with flower blooming above dotless `ı`.
- [x] **Navigation & Layout**: Persistent mood-adaptive sidebar on desktop, responsive layout on mobile.
- [x] **Wardrobe Module**: Filter by category, mark favorites, add/edit/delete clothing items with confirmation.
- [x] **Scrapbook Module**: Polaroid memory cards, full memory reader modal, search and tag filtering.
- [x] **Skincare Module**: Morning/evening routines, daily completion toggling with confetti, daily progress bar, product shelf.
- [x] **Workout Module**: Mindful activity logging, nonjudgmental encouraging tone, minutes calculated, completion badges.
- [x] **User Authentication**: Secure bcrypt password hashing, JWT tokens, protected routes, and data isolation.
- [x] **MongoDB Integration**: Complete Mongoose models, dual connection strategy (Local/Atlas + Embedded on 27017), testable directly via MongoDB Compass.
