import asyncHandler from '../middlewares/asyncHandler.js';
import Student from '../models/studentModel.js';

export const registerStudent = asyncHandler(async (req, res) => {
    const student = await Student.create(req.body);
    res.status(201).json(student);
});
