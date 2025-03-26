import asyncHandler from '../middlewares/asyncHandler.js';
import Student from '../models/studentModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

//  Register new student
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, roll_number, mobile } = req.body;
    const userExists = await Student.findOne({ where: { email } });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashedPassword, roll_number, mobile });

    res.status(201).json({ token: generateToken(student.id) });
});

//  Login student & get JWT token
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const student = await Student.findOne({ where: { email } });

    if (student && (await bcrypt.compare(password, student.password))) {
        res.json({ token: generateToken(student.id) });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});
