const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require('./routes/auth');
const lotRoutes = require('./routes/lots');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();

// -------------------------------
//  CORS CONFIG (FIXED FOR RENDER)
// -------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://smart-park-chelsea.vercel.app",   // <-- Your deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

app.use(express.json());

connectDB();

// -------------------------------
//  API ROUTES
// -------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

// -------------------------------
//  START SERVER
// -------------------------------
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);

// -------------------------------
//  SOCKET.IO (FIXED FOR PRODUCTION)
// -------------------------------
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
