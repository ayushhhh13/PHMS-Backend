# PICT Mental Health Support- Backend API

This project is a simple user authentication API built using Node.js, Express, and MongoDB. It includes user registration, login, and profile management functionality with JWT-based authentication.

## Features

- User registration
- User login with JWT token generation
- Profile retrieval for authenticated users
- Profile update for authenticated users
- Profile deletion for authenticated users

## Technologies Used

- Node.js
- Express
- MongoDB (with Mongoose)
- JSON Web Token (JWT)
- bcryptjs for password hashing
- cookie-parser for parsing cookie
- body-parser for parsing incoming request body
- cors to configure Cross-Origin Resource Sharing (CORS)
- dotenv for environment variables
- nodemon for development

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ayushhhh13/PMHS-Backend.git
   
   Install dependencies:
   npm install
   
   .env file
   PORT=5000
   MONGO_URI=your-mongodb-uri-here
   JWT_SECRET=your-jwt-secret-here
   
   For development with nodemon:
   npm run dev
   

