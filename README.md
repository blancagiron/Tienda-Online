# 🛍️ E-Commerce Project: Full-Stack Web Application  

## 📝 Overview  

This project is a full-stack e-commerce web application that combines both frontend and backend technologies. It serves as the final project for subject Desarrollo de Aplicaciones para Internet, integrating all the concepts and tools learned throughout the semester. The application features a user-friendly interface, a robust backend, and seamless integration with a MongoDB database.  

### ✨ Key Features:  
- **Frontend**: Built with **React**, **Vite**, and **Bootstrap** for a responsive and modern user interface.  
- **Backend**: Powered by **Node.js** with **Nunjucks** for server-side templating.  
- **Database**: Uses **MongoDB** for data storage, with **Mongo Express** for database management.  
- **APIs**: RESTful APIs for handling product data, user authentication, and order management.  
- **Deployment**: Currently working on deploying the application using **Vercel**.  

---

## 🛠️ Technologies Used  

### Frontend:  
- **React**: A JavaScript library for building user interfaces.  
- **Vite**: A fast build tool for modern web projects.  
- **Bootstrap**: A CSS framework for responsive design.  
- **Nunjucks**: A templating engine for server-side rendering.  

### Backend:  
- **Node.js**: A JavaScript runtime for building the backend.  
- **Express**: A web framework for Node.js.  
- **MongoDB**: A NoSQL database for storing product and user data.  
- **Mongo Express**: A web-based MongoDB admin interface.  

### Tools:  
- **Docker**: For containerizing the application.  
- **Docker Compose**: For orchestrating multi-container deployments.  
- **Caddy**: A web server and reverse proxy for handling HTTPS and serving static files.  

---

## 📸 Screenshots  

Here are some screenshots of the application:  

### 🏠 Home Page  
![Home Page](/screenshots/home.png)  

### 🛒 Product Detail Page  
![Product Page](/screenshots/detalle_producto.png)  

### 🛍️ Cart Page  
![Cart Page](/screenshots/carrito.png)  

### 🔑 Login Page
![Login Page](/screenshots/login.png)  

### 🔌 Electronic Category
![Category Page](/screenshots/categoria_electronica.png)  

### 🖥️ Mongo DB
![Admin Dashboard](/screenshots/mongo.png)  

---

## 🚀 Getting Started  

### Prerequisites  
- **Docker** and **Docker Compose** installed on your machine.  
- **Node.js** and **npm** (for local development).  

### Installation  

1. **Clone the repository.**  
2. **Install depencies using npm**
3. **Start MongoDB with Docker.**
First, start the MongoDB database container:
```
docker compose up 
```
4. **Seed the database:**
```
npm run seed
```
5. **Deploy the Application with Docker Compose**

Run the following command to start all necessary containers:
```
docker compose -f docker-compose-prod.yml up -d
```
## 🌐 Accessing the Application

- http://localhost/tienda
- http://localhost/react
  
## 🛠️ Common Errors & Solutions

### ❌ Error: error with permissions in /data

The deployment can fail due to problems with permissions in `data/`. The best solution I came with is to empty the content of the directory and repeat the steps 3,4,5 mentioned in `Installation`. 

