const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI, {

}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Error:', err));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set views folder

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve Static Files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Routes
app.use('/', require('./routes/userRoutes'));
app.use('/labor', require('./routes/laborRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Default Route
app.get('/', (req, res) => res.redirect('/login'));

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
