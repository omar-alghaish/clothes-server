# Project Setup Guide

This guide will walk you through the steps to set up and run the Clothes Server project on your local machine. Follow these instructions carefully to ensure a smooth setup process.

## Prerequisites
Before you begin, make sure you have the following installed on your machine:

### Node.js
- Download and install Node.js from [nodejs.org](https://nodejs.org/).
- **Recommended version:** 16.x or higher.
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

### MongoDB
- Install MongoDB locally or use a cloud-based MongoDB instance (e.g., [MongoDB Atlas](https://www.mongodb.com/atlas)).
- For local installation, follow the instructions at [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/).
- Verify installation:
  ```bash
  mongod --version
  ```

### Git
- Install Git to clone the repository.
- Download Git from [git-scm.com](https://git-scm.com/).
- Verify installation:
  ```bash
  git --version
  ```

## Step 1: Clone the Repository
1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the project.
3. Run the following command to clone the repository:
   ```bash
   git clone -b myBranch https://github.com/omar-alghaish/clothes-server.git
   ```
4. Navigate into the project directory:
   ```bash
   cd clothes-server
   ```

## Step 2: Set Up Environment Variables
1. Create a `.env` file in the root of the project:
   ```bash
   touch .env
   ```
2. Open the `.env` file and add the following environment variables:
   ```env
   PORT=3000
   DB_URL=mongodb://127.0.0.1:27017/clotheStore
   JWT_SECRET=THIS_IS_SECRET_KEY
   JWT_EXPIRES_IN=60d
   ```
   These values are already provided in the repository, but you can customize them if needed.

## Step 3: Install Dependencies
Install the project dependencies using npm:
   ```bash
   npm install
   ```
This will install all the required packages listed in `package.json`.

## Step 4: Set Up the Database
1. Start your local MongoDB server:
   ```bash
   mongod
   ```
   If you're using a cloud-based MongoDB instance (e.g., MongoDB Atlas), update the `DB_URL` variable in `.env` with your connection string.

## Step 5: Run the Application
Start the development server:
   ```bash
   npm run dev
   ```
This will start the server using nodemon, which automatically restarts the server when file changes are detected.

### Verify that the server is running:
- Open your browser or a tool like Postman.
- Visit [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) to check the server status.

