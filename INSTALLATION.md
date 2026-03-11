# 📝 INSTALLATION COMMANDS 


## Step 1: Install packages

### Open Command Prompt (CMD) in the project folder
```bash
cd d:\An\Game
```

```bash
npm run install-all
```



```bash
# 1. Root dependencies
npm install

# 2. Server dependencies
cd server
npm install
cd ..

# 3. Client dependencies
cd client
npm install
cd ..
```

---

## 2: Setup MongoDB

### Option A: MongoDB Local (Recommended for development)


1. Download: https://www.mongodb.com/try/download/community
2.  default settings
3. MongoDB will automatically run a Windows Service

**Start MongoDB Service:**
```bash
net start MongoDB
```

**Stop MongoDB Service:**
```bash
net stop MongoDB
```


```bash
# Open Services
# Win + R → type "services.msc" → Enter
# Find "MongoDB Server" → must be in "Running" state
```

### Option B: MongoDB Atlas (Cloud - Free)

1. Register an account: https://www.mongodb.com/cloud/atlas/register
2. Create a Free Cluster
3. Create a Database User
4. Get the Connection String
5. Edit the file `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/bicycle-game?retryWrites=true&w=majority
NODE_ENV=development
```

---

## Step 3: Run the application

### Option A: Run Server + Client at the same time (Recommended)

```bash
# From the root folder (d:\An\Game)
npm run dev
```

Result 
✅ Server runs on: http://localhost:5000

✅ Client runs on: http://localhost:3000

✅ Both run in one terminal

### Option B: Run each part separately

**Terminal 1 - Server:**
```bash
cd d:\An\Game\server
npm run dev
```

**Terminal 2 - Client (open a new terminal):**
```bash
cd d:\An\Game\client
npm run dev
```

---

## Step 4: Test the application

### open 2 browser tabs

**Tab 1 (Player 1):**
```
http://localhost:3000
```

**Tab 2 (Player 2):**
```
http://localhost:3000
```

### Flow test:

In both tabs:
Click "Start the Game"
Choose the same Group (for example: Group 2):
Tab 1: Click "Group 2"
Tab 2: Click "Group 2"
The system automatically matches players:
Tab 1 → Person A
Tab 2 → Person B
Start negotiating:
Person A (Tab 1) proposes: A=500€, B=500€
Click "Submit Offer"
Person B (Tab 2) receives offer
Choose response: "Accept"
View results:
Both tabs automatically switch to the Result screen
Click "Export Data" to download Exce

---

## 🔍 Verify Installation

### Check if Server is running:
```bash
# open browser or use curl
curl http://localhost:5000/api/health
```

expected result:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Check if client is running:
```bash
# open browser
http://localhost:3000
```

you should see "Welcome to the Bicycle Negotiation Game!"

### Check MongoDB connection:
Look at the server terminal, you should see:

```
✅ MongoDB Connected: localhost
```

---

## 🛑 Stop Application

### If running with npm run dev:

Press Ctrl + C in terminal
Choose Y when asked "Terminate batch job"

### If running separately:

Stop both terminals (Server and Client)
Press Ctrl + C in each termina

---

## 🔄 Restart Application

```bash
npm run dev
```


```bash
taskkill /F /IM node.exe

npm run dev
```

---

## 📦 Production Build

### Build Client cho production:
```bash
cd client
npm run build
```



### Serve production build:
```bash
cd client
npm run preview
```

---

## 🧹 Clean Installation

```bash

rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules
```

```bash
del package-lock.json
del server\package-lock.json
del client\package-lock.json
```

```bash
npm run install-all
```

---

## 🎯 Common NPM Scripts

### Root (d:\An\Game)
```bash
npm run dev          
npm run server        
npm run client        
npm run install-all   
```

### Server (d:\An\Game\server)
```bash
npm run dev          
npm start            
```

### Client (d:\An\Game\client)
```bash
npm run dev         
npm run build        
npm run preview      
```

---

## ✅ Checklist 

 Node.js installed (v16+)
 MongoDB running (local or Atlas)
 Ran npm run install-all
 File server/.env exists and is correct
 Port 5000 and 3000 are not in use
 No errors when installing packages
