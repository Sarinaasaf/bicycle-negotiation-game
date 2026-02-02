✨ Key Features

🎮 Real-time multiplayer using Socket.io
🎨 Modern and visually appealing UI with Tailwind CSS and Framer Motion
🎯 4 game groups with different BATNA values
⚡ Automatic player matching
📊 Real-time tracking of negotiation history
💾 Data export to Excel files
🔄 Up to 10 negotiation rounds
📱 Responsive design for all devices

🛠️ Tech Stack
Frontend

React 18

Vite

React Router DOM

Socket.io Client

Tailwind CSS

Framer Motion

Axios

React Toastify

Backend

Node.js

Express

Socket.io

MongoDB with Mongoose

ExcelJS

Nanoid

📦 Installation
System Requirements

Node.js (v16 or higher)

MongoDB (local or MongoDB Atlas)

npm or yarn

Step 1: Clone Repository
cd d:\An\Game

Step 2: Install Dependencies

Install everything (root + server + client):

npm run install-all


Or install each part separately:

# Root
npm install

# Server
cd server
npm install

# Client
cd client
npm install

Step 3: MongoDB Configuration
Using Local MongoDB

Ensure MongoDB is running on localhost:27017

The file server/.env is already created with default configuration

Using MongoDB Atlas

Create a cluster on MongoDB Atlas

Obtain the connection string

Update server/.env:

PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bicycle-game?retryWrites=true&w=majority
NODE_ENV=development

Step 4: Run the Application

Run server and client simultaneously:

npm run dev


Or run them separately:

# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev

Step 5: Access the Application

Frontend: http://localhost:3000

Backend API: http://localhost:5000

Health Check: http://localhost:5000/api/health

🎮 Gameplay Guide
Introduction Screen

Read information about the game

Click "Start the Game"

Group Selection (1–4)

Each group has a different BATNA value for Person B

Select one group to join

Waiting Room

The system automatically finds an opponent within the same group

Roles are randomly assigned (Person A or Person B)

Negotiation

Players take turns making offers to divide €1,000

The opponent chooses one of four responses:

Too Low: Reject and continue negotiating

Accept: Accept the offer and end the game (successful)

Better Offer: Has a better option, continue negotiating

Not Accept: Reject and end the game (failure)

Maximum of 10 rounds

Results

View final outcome

Compare outcome with BATNA

Export negotiation data to Excel

Replay the game or return to the home screen

📊 BATNA Mechanism (4 Groups)
Group	Person A BATNA	Person B BATNA
1	€0	€0
2	€0	€300
3	€0	€500
4	€0	€600

Successful negotiation: Money is split according to agreement

Failed negotiation: Person A receives €0, Person B receives BATNA

🗂️ Folder Structure
d:\An\Game\
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # Main pages
│   │   │   ├── IntroScreen.jsx
│   │   │   ├── GroupSelection.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   ├── NegotiationScreen.jsx
│   │   │   └── ResultScreen.jsx
│   │   ├── context/        # React Context
│   │   │   └── GameContext.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose models
│   │   ├── Player.js
│   │   └── Game.js
│   ├── controllers/        # Business logic
│   │   ├── gameController.js
│   │   └── exportController.js
│   ├── routes/             # API routes
│   │   └── gameRoutes.js
│   ├── socket/             # Socket.io handlers
│   │   └── socketHandlers.js
│   ├── config/             # Configuration
│   │   └── db.js
│   ├── server.js           # Entry point
│   ├── package.json
│   └── .env
│
├── package.json             # Root package
├── readme.md               # Original documentation
└── README_SETUP.md         # This file

🔌 API Endpoints
REST API

POST /api/game/join – Join game and create player

GET /api/game/state/:pairId – Get game state

POST /api/game/offer – Submit offer

POST /api/game/response – Submit response

GET /api/game/export/:pairId – Export game data to Excel

Socket.io Events
Client → Server

join_game – Request pairing

submit_offer – Submit negotiation offer

submit_response – Submit response to offer

Server → Client

pair_found – Pairing successful

waiting_for_pair – Still waiting for partner

offer_received – Received offer from opponent

offer_sent – Offer sent successfully

turn_updated – Turn updated, game continues

game_ended – Game finished

opponent_disconnected – Opponent disconnected

error – Error occurred

🐛 Troubleshooting
MongoDB Connection Error
# Check MongoDB service
# Windows:
net start MongoDB

# Or open services manager
services.msc

Port Already in Use
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

Dependency Errors
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

npm run install-all

Socket Connection Issues

Ensure the server is running on port 5000

Check firewall is not blocking the port

Clear browser cache and reload

🚀 Production Build
Build Client
cd client
npm run build

Deployment Recommendations

Frontend: Vercel, Netlify, or serve via Express

Backend: Heroku, Railway, DigitalOcean

Database: MongoDB Atlas

Environment Variables: Correctly set MONGODB_URI, CLIENT_URL

📝 Implemented Features

✅ Animated introduction screen
✅ Group selection with 4 BATNA options
✅ Automatic player pairing
✅ Real-time negotiation using Socket.io
✅ 4 response options (Too Low, Accept, Better Offer, Not Accept)
✅ Negotiation history display
✅ Up to 10 rounds
✅ Successful / failed outcomes
✅ Excel data export
✅ Responsive design
✅ Toast notifications
✅ Loading states
✅ Error handling

🎨 Design Highlights

Gradient backgrounds and glassmorphism effects

Smooth animations with Framer Motion

Consistent color scheme (Blue & Purple theme)

Mobile-first responsive design

Intuitive user flow

Real-time feedback and visual cues

👨‍💻 Development
Coding Standards

ES6+ JavaScript

Functional React components with Hooks

Async/await for asynchronous operations

Clean code principles

Modular architecture

Testing

Full flow testing from intro → result

Test with two browser tabs/windows simultaneously

Test edge cases

Verify Excel export

📄 License

MIT License – Educational and research project

🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

📧 Contact

If you encounter issues or have questions, please create an issue in the repository.

Happy Negotiating! 🚲💰
