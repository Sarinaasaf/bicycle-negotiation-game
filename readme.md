
# 🚲 Bicycle Negotiation Game

A real-time two-player negotiation simulation game built with React, Node.js, Socket.io, and MongoDB.

## 📋 Project Overview

The game simulates a negotiation scenario between two people (A and B) about dividing €1,000 from selling a complete bicycle. Each person owns one part of the bicycle and must negotiate to reach an agreement.

## ✨ Main Features

- 🎮 **Real-time multiplayer** with Socket.io
- 🎨 **Beautiful interface** with Tailwind CSS and Framer Motion
- 🎯 **4 player groups** with different BATNA values
- ⚡ **Automatic player pairing**
- 📊 **Track negotiation history** in real time
- 💾 **Export data** to Excel file
- 🔄 **Maximum 10 negotiation rounds**
- 📱 **Responsive design** for all devices

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Socket.io Client
- Tailwind CSS
- Framer Motion
- Axios
- React Toastify

### Backend
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- ExcelJS
- Nanoid

## 📦 Installation

### System Requirements
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone repository
```bash
cd d:\An\Game
````

### Step 2: Install dependencies

**Install all (root + server + client):**

```bash
npm run install-all
```

**Or install each part:**

```bash
# Root
npm install

# Server
cd server
npm install

# Client
cd client
npm install
```

### Step 3: Configure MongoDB

1. **If using MongoDB local:**

   * Make sure MongoDB is running on `localhost:27017`
   * File `server/.env` is already created with default configuration

2. **If using MongoDB Atlas:**

   * Create a cluster on MongoDB Atlas
   * Get the connection string
   * Edit the file `server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bicycle-game?retryWrites=true&w=majority
   NODE_ENV=development
   ```

### Step 4: Run the application

**Run server and client simultaneously:**

```bash
npm run dev
```

**Or run separately:**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Step 5: Access the application

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 🎮 How to Play

1. **Introduction screen**

   * Read the game information
   * Press "Start the Game"

2. **Select group (1–4)**

   * Each group has a different BATNA value for Person B
   * Choose a group to join

3. **Waiting room**

   * The system automatically finds an opponent in the same group
   * Roles are randomly assigned (Person A or B)

4. **Negotiation**

   * Players take turns making offers to divide €1,000
   * The opponent chooses 1 of 4 responses:

     * **Too Low:** Reject, continue negotiating
     * **Accept:** Accept, end game (success)
     * **Better Offer:** Has a better alternative, continue negotiating
     * **Not Accept:** Reject, end game (failure)
   * Maximum 10 rounds

5. **Results**

   * View the final result
   * Compare with BATNA
   * Export data to Excel
   * Play again or return to home page

## 📊 BATNA Mechanism (4 Groups)

| Group | Person A BATNA | Person B BATNA |
| ----- | -------------- | -------------- |
| 1     | €0             | €0             |
| 2     | €0             | €300           |
| 3     | €0             | €500           |
| 4     | €0             | €600           |

* If negotiation **succeeds**: Money is split according to the agreement
* If negotiation **fails**: Person A receives €0, Person B receives BATNA

## 🗂️ Folder Structure

```
d:\An\Game\
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Main pages
│   │   │   ├── IntroScreen.jsx
│   │   │   ├── GroupSelection.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   ├── NegotiationScreen.jsx
│   │   │   └── ResultScreen.jsx
│   │   ├── context/       # React Context
│   │   │   └── GameContext.jsx
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                # Node.js Backend
│   ├── models/           # Mongoose models
│   │   ├── Player.js
│   │   └── Game.js
│   ├── controllers/      # Business logic
│   │   ├── gameController.js
│   │   └── exportController.js
│   ├── routes/           # API routes
│   │   └── gameRoutes.js
│   ├── socket/           # Socket.io handlers
│   │   └── socketHandlers.js
│   ├── config/           # Configuration
│   │   └── db.js
│   ├── server.js         # Entry point
│   ├── package.json
│   └── .env
│
├── package.json          # Root package
├── readme.md            # Original documentation
└── README_SETUP.md      # This file
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check MongoDB is running
# Windows:
net start MongoDB

# Or check services
services.msc
```

### Dependencies error

```bash
# Delete node_modules and reinstall
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

npm run install-all
```

## 🚀 Production Build

### Build client

```bash
cd client
npm run build
```

## 📝 Features implemented

✅ Beautiful introduction screen with animation
✅ Group selection with 4 BATNA options
✅ Automatic player pairing
✅ Real-time negotiation with Socket.io
✅ 4 response options (Too Low, Accept, Better Offer, Not Accept)
✅ Negotiation history display
✅ Maximum 10 rounds
✅ Success/failure results
✅ Export data to Excel
✅ Responsive design
✅ Toast notifications
✅ Loading states
✅ Error handling

## 👨‍💻 Development

### Coding Standards

* ES6+ JavaScript
* Functional React components with Hooks
* Async/await for asynchronous operations
* Clean code principles
* Modular architecture

### Testing

* Test full flow from intro → result
* Test with 2 browser tabs/windows simultaneously
* Test edge cases
* Verify Excel export

## 📄 License

MIT License - Educational and research project

---

**Happy Negotiating! 🚲💰**


