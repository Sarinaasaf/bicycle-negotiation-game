### 🚀 Quick Start Guide
## ⚡ Quick Guide (3 minutes)
## Install MongoDB (if not installed yet)

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud - free)

**check if MongoDB is running:**
```bash
# Open Services (Win + R → services.msc)
# Find "MongoDB Server" and Start it
```

### 2.Install Dependencies

```bash
# From folder d:\An\Game
npm run install-all
```

This command will:
Install packages for the root
Install packages for the server (Node.js)
Install packages for the client (React)

### 3. Run the application

```bash
npm run dev
```

This command automatically runs simultaneously:
Server on http://localhost:5000
Client on http://localhost:3000
### 4. Open the browser

Open 2 tabs/windows:
Tab 1: http://localhost:3000
 (Player 1)
Tab 2: http://localhost:3000
 (Player 2)
In each tab:
Click "Start the Game"
Select the same Group (for example: Group 2)
The system will automatically match the players
Start negotiating!

---

## 🎮 Full Test Flow
## Scenario 1: Successful negotiation
Player A proposes: A=400€, B=600€
Player B selects: Accept
✅ Result: A receives 400€, B receives 600€

### Scenario 2: Failed negotiation (rejection)
Player A proposes: A=700€, B=300€
Player B selects: Not Accept
❌ Result: A receives 0€, B receives BATNA (depending on the group)

### Scenario 3:Multiple negotiation rounds
Player A proposes: A=600€, B=400€
Player B selects: Too Low (continue)
Player B proposes: A=450€, B=550€
Player A selects: Accept
✅ Result: A receives 450€, B receives 550€

### Scenario 4:10 rounds reached
Keep selecting "Too Low" or "Better Offer"
After 10 rounds the game automatically ends
❌ Result: A receives 0€, B receives BATNA

---

## 📊 Check Excel Export
After the game ends, click "Export Data (Excel)"
The file will automatically download:
negotiation_Pair_XXXX_timestamp.xlsx
Open the file to see detailed negotiation rounds

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB service is running
net start MongoDB

# Or edit server/.env to use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bicycle-game
```

### Issue 2: "Port 5000 already in use"
**Solution:**
```bash
# Find process using the port
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

### Issue 4:"Socket connection failed"
Solution:
Clear browser cache
Restart server
Check that the firewall is not blocking port 5000
Try accessing: http://localhost:5000/api/health
---

## 🎨 Implemented UI/UX Features

## ✨ Animations & Transitions

Smooth page transitions with Framer Motion

Loading states and skeleton screens

Micro-interactions on buttons and cards

Real-time updates without page reload

## 🎨 Visual Design

Gradient backgrounds (Blue & Purple theme)

Glassmorphism effects

Responsive cards and modals

Clean typography with good contrast

## 📱 Responsive Design
Mobile-first approach
Breakpoints for tablet and desktop
Touch-friendly buttons
Adaptive layouts

## 🔔 User Feedback

Toast notifications for all actions
Visual indicators for turns
Progress bars and counters
Clear error messages
### 💡 Tips for Better Testing
Test on multiple devices
Desktop browser
Mobile responsive mode (F12 → Device toolbar)
Tablet size
## Test network conditions
Simulate slow connection (DevTools → Network → Slow 3G)
Test disconnect scenarios
## Test edge cases
Invalid offers (not equal to 1000)
Rapid clicking
Browser back button
Refresh during the game
## Test pairing
Only 1 player joins (should wait)
2 players in different groups (should not pair)
2 players in the same group (pair successfully)
## 📚 Additional Documentation
Game Rules: see readme.md or new.txt
Full Setup: see README_SETUP.md
API Docs: see the API Endpoints section in README_SETUP.md