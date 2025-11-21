const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require('./routes/auth');
const lotRoutes = require('./routes/lots');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();

const allowedOrigins = [
  "https://smart-park-chelsea.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => 
  console.log("Server running on port " + PORT)
);

const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
