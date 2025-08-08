const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const methodOverride = require('method-override');
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const server = http.createServer(app);

const io = socketIO(server);
app.set('io', io);

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views folder

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(methodOverride('_method')); 

// Serve Static Files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// After session and flash middleware
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.userRole = req.session.userRole || null;
  next();
});

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
// Routes
app.use("/", require("./routes/userRoutes"));
app.use("/labor", require("./routes/laborRoutes"));
app.use("/admin", require("./routes/adminRoutes"));

// Home Page Route (for non-logged in users)
app.get("/", (req, res) => {
  if (req.session.userId) {
    // If logged in, redirect based on role
    const role = req.session.userRole;
    if (role === "admin") return res.redirect("/admin/panel");
    if (role === "labor") return res.redirect("/labor/home");
    if (role === "user") return res.redirect("/home");
  } else {
    // If not logged in, show home page
    res.render("home");
  }
});

// Server Start
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});