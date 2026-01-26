# 🚲 Bicycle Negotiation Game

A real-time two-player negotiation simulation game built with React, Node.js, Socket.io, and MongoDB.

## 📋 Tổng quan dự án

Trò chơi mô phỏng tình huống đàm phán giữa hai người (A và B) về việc chia €1,000 từ việc bán một chiếc xe đạp hoàn chỉnh. Mỗi người sở hữu một phần của xe đạp và phải đàm phán để đạt được thỏa thuận.

## ✨ Tính năng chính

- 🎮 **Real-time multiplayer** với Socket.io
- 🎨 **Giao diện đẹp mắt** với Tailwind CSS và Framer Motion
- 🎯 **4 nhóm chơi** với giá trị BATNA khác nhau
- ⚡ **Tự động ghép cặp** người chơi
- 📊 **Theo dõi lịch sử đàm phán** theo thời gian thực
- 💾 **Export dữ liệu** ra file Excel
- 🔄 **Tối đa 10 vòng đàm phán**
- 📱 **Responsive design** cho mọi thiết bị

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
- MongoDB với Mongoose
- ExcelJS
- Nanoid

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

### Bước 1: Clone repository
```bash
cd d:\An\Game
```

### Bước 2: Cài đặt dependencies

**Cài tất cả (root + server + client):**
```bash
npm run install-all
```

**Hoặc cài từng phần:**
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

### Bước 3: Cấu hình MongoDB

1. **Nếu dùng MongoDB local:**
   - Đảm bảo MongoDB đang chạy trên `localhost:27017`
   - File `server/.env` đã được tạo sẵn với cấu hình mặc định

2. **Nếu dùng MongoDB Atlas:**
   - Tạo cluster trên MongoDB Atlas
   - Lấy connection string
   - Sửa file `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bicycle-game?retryWrites=true&w=majority
   NODE_ENV=development
   ```

### Bước 4: Chạy ứng dụng

**Chạy đồng thời server và client:**
```bash
npm run dev
```

**Hoặc chạy riêng:**

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Bước 5: Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🎮 Hướng dẫn chơi

1. **Màn hình giới thiệu**
   - Đọc thông tin về trò chơi
   - Nhấn "Start the Game"

2. **Chọn nhóm (1-4)**
   - Mỗi nhóm có giá trị BATNA khác nhau cho Person B
   - Chọn một nhóm để tham gia

3. **Phòng chờ**
   - Hệ thống tự động tìm đối thủ trong cùng nhóm
   - Được phân vai ngẫu nhiên (Person A hoặc B)

4. **Đàm phán**
   - Người chơi lần lượt đưa ra đề nghị chia €1,000
   - Đối phương chọn 1 trong 4 phản hồi:
     - **Too Low:** Từ chối, tiếp tục đàm phán
     - **Accept:** Chấp nhận, kết thúc game (thành công)
     - **Better Offer:** Có lựa chọn tốt hơn, tiếp tục đàm phán
     - **Not Accept:** Không chấp nhận, kết thúc game (thất bại)
   - Tối đa 10 vòng

5. **Kết quả**
   - Xem kết quả cuối cùng
   - So sánh với BATNA
   - Export dữ liệu ra Excel
   - Chơi lại hoặc về trang chủ

## 📊 Cơ chế BATNA (4 nhóm)

| Nhóm | Person A BATNA | Person B BATNA |
|------|----------------|----------------|
| 1    | €0             | €0             |
| 2    | €0             | €300           |
| 3    | €0             | €500           |
| 4    | €0             | €600           |

- Nếu đàm phán **thành công**: Chia tiền theo thỏa thuận
- Nếu đàm phán **thất bại**: Person A nhận €0, Person B nhận BATNA

## 🗂️ Cấu trúc thư mục

```
d:\An\Game\
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Các trang chính
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
├── readme.md            # Tài liệu gốc
└── README_SETUP.md      # File này
```

## 🔌 API Endpoints

### REST API
- `POST /api/game/join` - Join game and create player
- `GET /api/game/state/:pairId` - Get game state
- `POST /api/game/offer` - Submit offer
- `POST /api/game/response` - Submit response
- `GET /api/game/export/:pairId` - Export game data to Excel

### Socket.io Events

**Client → Server:**
- `join_game` - Request pairing
- `submit_offer` - Submit negotiation offer
- `submit_response` - Submit response to offer

**Server → Client:**
- `pair_found` - Pairing successful
- `waiting_for_pair` - Still waiting for partner
- `offer_received` - Received offer from opponent
- `offer_sent` - Offer sent successfully
- `turn_updated` - Turn changed, game continues
- `game_ended` - Game finished
- `opponent_disconnected` - Opponent left
- `error` - Error occurred

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Kiểm tra MongoDB đang chạy
# Windows:
net start MongoDB

# Hoặc kiểm tra services
services.msc
```

### Port already in use
```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill process nếu cần
taskkill /PID <PID> /F
```

### Dependencies error
```bash
# Xóa node_modules và reinstall
rmdir /s /q node_modules
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

npm run install-all
```

### Socket connection issues
- Đảm bảo server đang chạy trên port 5000
- Kiểm tra firewall không block port
- Xóa cache browser và reload

## 🚀 Production Build

### Build client
```bash
cd client
npm run build
```

### Deploy recommendations
- **Frontend:** Vercel, Netlify, hoặc serve từ Express
- **Backend:** Heroku, Railway, DigitalOcean
- **Database:** MongoDB Atlas
- **Environment Variables:** Set đúng `MONGODB_URI`, `CLIENT_URL`

## 📝 Features đã implement

✅ Màn hình giới thiệu đẹp mắt với animation  
✅ Chọn nhóm với 4 lựa chọn BATNA  
✅ Tự động ghép cặp người chơi  
✅ Real-time negotiation với Socket.io  
✅ 4 lựa chọn phản hồi (Too Low, Accept, Better Offer, Not Accept)  
✅ Hiển thị lịch sử đàm phán  
✅ Tối đa 10 vòng  
✅ Kết quả thành công/thất bại  
✅ Export dữ liệu ra Excel  
✅ Responsive design  
✅ Toast notifications  
✅ Loading states  
✅ Error handling  

## 🎨 Design Highlights

- Gradient backgrounds và glassmorphism effects
- Smooth animations với Framer Motion
- Consistent color scheme (Blue & Purple theme)
- Mobile-first responsive design
- Intuitive user flow
- Real-time feedback và visual cues

## 👨‍💻 Development

### Coding Standards
- ES6+ JavaScript
- Functional React components với Hooks
- Async/await cho asynchronous operations
- Clean code principles
- Modular architecture

### Testing
- Kiểm tra flow đầy đủ từ intro → result
- Test với 2 browser tabs/windows đồng thời
- Test các trường hợp edge cases
- Verify Excel export

## 📄 License

MIT License - Dự án học tập và nghiên cứu

## 🤝 Contributing

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

## 📧 Contact

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.

---

**Happy Negotiating! 🚲💰**
