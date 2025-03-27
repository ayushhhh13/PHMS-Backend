import express from "express";
import {registerStudent, loginStudent} from '../controllers/studentController.js'
const studentRoutes = express.Router();
studentRoutes.post("/register", registerStudent);
studentRoutes.post("/login", loginStudent);

export default studentRoutes;
