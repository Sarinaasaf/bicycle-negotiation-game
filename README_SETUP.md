Hier ist dein Text **1:1 auf Englisch übersetzt**, mit derselben Struktur und Formatierung:

````
# 🚀 Quick Start Guide

## ⚡ Quick Guide (3 minutes)

### 1. Install MongoDB (if not installed yet)

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud - free)
````

**Check if MongoDB is running:**

```bash
# Open Services (Win + R → services.msc)
# Find "MongoDB Server" and Start it
```

### 2. Install Dependencies

```bash
# From folder d:\An\Game
npm run install-all
```

This command will:

* Install packages for root
* Install packages for server (Node.js)
* Install packages for client (React)

### 3. Run the application

```bash
npm run dev
```

This command automatically runs simultaneously:

* **Server** on [http://localhost:5000](http://localhost:5000)
* **Client** on [http://localhost:3000](http://localhost:3000)

### 4. Open the browser

1. Open 2 tabs/windows:

   * Tab 1: [http://localhost:3000](http://localhost:3000) (Player 1)
   * Tab 2: [http://localhost:3000](http://localhost:3000) (Player 2)

2. In each tab:

   * Click "Start the Game"
   * Select the same Group (for example: Group 2)
   * The system will automatically match the pair

3. Start negotiating!

---

## 🎮 Full Test Flow

### Scenario 1: Successful negotiation

1. Player A proposes: A=400€, B=600€
2. Player B chooses: **Accept**
3. ✅ Result: A receives 400€, B receives 600€

### Scenario 2: Negotiation failure (rejection)

1. Player A proposes: A=700€, B=300€
2. Player B chooses: **Not Accept**
3. ❌ Result: A receives 0€, B receives BATNA (depending on group)

### Scenario 3: Multiple negotiation rounds

1. Player A proposes: A=600€, B=400€
2. Player B chooses: **Too Low** (continue)
3. Player B proposes: A=450€, B=550€
4. Player A chooses: **Accept**
5. ✅ Result: A receives 450€, B receives 550€

### Scenario 4: 10 rounds reached

1. Keep choosing "Too Low" or "Better Offer"
2. After 10 rounds the game automatically ends
3. ❌ Result: A receives 0€, B receives BATNA

---

## 📊 Check Excel Export

1. After the game ends, click "Export Data (Excel)"
2. The file will automatically download: `negotiation_Pair_XXXX_timestamp.xlsx`
3. Open the file to see detailed negotiation rounds

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"

**Solution:**

```bash
# Check MongoDB service is running
net start MongoDB

# Or edit server/.env to use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bicycle-game
```

### Issue 2: "Port 5000 already in use"

**Solution:**

```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=5001
```

### Issue 3: "Module not found"

**Solution:**

```bash
# Delete and reinstall
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules
npm run install-all
```

### Issue 4: "Socket connection failed"

**Solution:**

* Clear browser cache
* Restart server
* Check firewall is not blocking port 5000
* Try accessing: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎨 Implemented UI/UX Features

✨ **Animations & Transitions**

* Smooth page transitions with Framer Motion
* Loading states and skeleton screens
* Micro-interactions on buttons and cards
* Real-time updates without page reload

🎨 **Visual Design**

* Gradient backgrounds (Blue & Purple theme)
* Glassmorphism effects
* Responsive cards and modals
* Clean typography with good contrast

📱 **Responsive Design**

* Mobile-first approach
* Breakpoints for tablet and desktop
* Touch-friendly buttons
* Adaptive layouts

🔔 **User Feedback**

* Toast notifications for all actions
* Visual indicators for turns
* Progress bars and counters
* Clear error messages

---

## 💡 Tips for Better Testing

1. **Test on multiple devices:**

   * Desktop browser
   * Mobile responsive mode (F12 → Device toolbar)
   * Tablet size

2. **Test network conditions:**

   * Simulate slow connection (DevTools → Network → Slow 3G)
   * Test disconnect scenarios

3. **Test edge cases:**

   * Invalid offers (not equal to 1000)
   * Rapid clicking
   * Browser back button
   * Refresh during the game

4. **Test pairing:**

   * Only 1 player joins (should wait)
   * 2 players in different groups (no pairing)
   * 2 players in the same group (pair successfully)

---

## 📚 Additional Documentation

* **Game Rules:** see `readme.md` or `new.txt`
* **Full Setup:** see `README_SETUP.md`
* **API Docs:** see API Endpoints section in README_SETUP.md

---


```
```
