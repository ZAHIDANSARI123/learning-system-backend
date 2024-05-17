import { Router } from "express";
import { changePassword, getProfile, login, logout, register, resetPassword, updateUser } from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middlewares.js";



const router = Router();

router.post('/register', upload.single("avatar"), register);
router.post('/login', login);
router.get('/loguot', logout);
router.post('/me', isLoggedIn, getProfile);
router.post('/reset', resetPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update', isLoggedIn, upload.single("avatar"), updateUser)  //update:id

export default router;