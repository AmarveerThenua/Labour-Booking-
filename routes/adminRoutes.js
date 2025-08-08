const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAdmin = require("../middleware/isAdmin");

router.get("/panel", isAdmin, adminController.getAdminPanel);

// 🆕 View user details
router.get('/user/:id', adminController.getUserDetails);

// 🆕 Add make-admin route
router.post("/make-admin/:id", adminController.makeUserAdmin);

router.delete('/user/delete/:id', adminController.deleteUser);


module.exports = router;
