const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require('./routes/auth');
const lotRoutes = require('./routes/lots');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();

<<<<<<< HEAD
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://smart-park-chelsea-git-master-chelseaphoebes-projects.vercel.app', 'https://smartpark-chelsea.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
=======
app.use(cors());
>>>>>>> parent of ba7b23d (fix: deployment)
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
const server = app.listen(PORT, () => console.log("Server running on port " + PORT));

<<<<<<< HEAD
const io = require('socket.io')(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://smart-park-chelsea-git-master-chelseaphoebes-projects.vercel.app', 'https://smartpark-chelsea.vercel.app'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  } 
});
=======
const io = require('socket.io')(server, { cors: { origin: '*' } });
>>>>>>> parent of ba7b23d (fix: deployment)
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
