# 🎮 Bicycle Negotiation Game - Command Cheat Sheet



```bash
npm run install-all              
```


```bash
npm run dev                      
npm run server                   
npm run client                   
```


```bash
net start MongoDB              
net stop MongoDB                
```


```bash

curl http://localhost:5000/api/health


http://localhost:5000/api/health
http://localhost:3000
```


```bash

netstat -ano | findstr :5000
netstat -ano | findstr :3000


taskkill /PID <PID> /F


taskkill /F /IM node.exe
```


```bash

rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules


npm run install-all
```

---


```bash
cd d:\An\Game
npm run dev
```


 http://localhost:3000


- Server logs: 
- Client logs: Browser Console (F12)
- MongoDB logs: Check MongoDB log file


```bash
# Stop: Ctrl + C trong terminal
# Start: npm run dev
```

---

## 🐛 Troubleshooting Commands

### MongoDB issues
```bash

net start MongoDB


type "C:\Program Files\MongoDB\Server\6.0\log\mongod.log"


mongosh
```


```bash

netstat -ano | findstr :5000


taskkill /PID <PID> /F


PORT=5001
```


```bash

npm cache clean --force

rmdir /s /q node_modules
npm install
```

```bash
cd client
rmdir /s /q dist
npm run build
```

---



```bash

mongosh


show dbs


use bicycle-negotiation-game


show collections


db.players.find().pretty()


db.games.find().pretty()

# Clear all players
db.players.deleteMany({})

# Clear all games
db.games.deleteMany({})

# Exit MongoDB shell
exit
```

---

## 🔧 Configuration

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bicycle-negotiation-game
NODE_ENV=development
```

### Client (vite.config.js)
```js
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## 📱 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React app |
| Backend | http://localhost:5000 | Express API |
| Health Check | http://localhost:5000/api/health | API status |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 🎨 Project Structure Quick Reference

```
d:\An\Game\
├── client/                 # React Frontend (Port 3000)
│   ├── src/pages/         # UI Components
│   └── src/services/      # API calls
├── server/                # Node Backend (Port 5000)
│   ├── models/           # MongoDB Models
│   ├── controllers/      # Business Logic
│   ├── routes/           # API Routes
│   └── socket/           # Socket.io Handlers
└── package.json          # Root scripts
```

---

## 🧪 Testing Scenarios

### Test 1: Successful negotiation
```
1. Open 2 tabs
2. Both select Group 2
3. Person A offers: A=500, B=500
4. Person B: Accept
✅ Result: A gets 500, B gets 500
```

### Test 2: Failed negotiation
```
1. Open 2 tabs
2. Both select Group 3
3. Person A offers: A=700, B=300
4. Person B: Not Accept
❌ Result: A gets 0, B gets 500 (BATNA)
```

### Test 3: Multiple rounds
```
1. Open 2 tabs
2. Both select Group 1
3. Round 1: A offers 600/400 → B: Too Low
4. Round 2: B offers 450/550 → A: Accept
✅ Result: A gets 450, B gets 550
```

---

## 💾 Git Commands 

```bash
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Bicycle Negotiation Game"

# Add remote
git remote add origin <your-repo-url>

# Push
git push -u origin main
```

---

## 📦 Package Versions

### Server Dependencies
- express: ^4.18.2
- mongoose: ^8.0.3
- socket.io: ^4.6.0
- exceljs: ^4.4.0

### Client Dependencies
- react: ^18.2.0
- vite: ^5.0.11
- tailwindcss: ^3.4.1
- framer-motion: ^10.18.0
- socket.io-client: ^4.6.0

---

## 🔑 Keyboard Shortcuts

### VS Code
- `Ctrl + `` ` - Toggle terminal
- `Ctrl + Shift + `` ` - New terminal
- `Ctrl + C` - Stop process in terminal
- `Ctrl + K Ctrl + S` - Save all files

### Browser DevTools
- `F12` - Open DevTools
- `Ctrl + Shift + C` - Inspect element
- `Ctrl + Shift + J` - Console
- `Ctrl + R` - Reload
- `Ctrl + Shift + R` - Hard reload

---

**Keep this cheat sheet handy! 📌**
