# 📦 Easy Stock - Simplify Your Inventory, Simplify Your Life

**Easy Stock** is your go-to inventory management solution, designed to make managing stock as effortless as possible. Whether you're an **admin** juggling inventory or a **viewer** exploring insightful analytics, Easy Stock ensures you stay on top of your game with style and ease.

With a focus on **simplicity, efficiency, and clarity**, Easy Stock is here to help you manage your inventory without the headaches. Say goodbye to messy spreadsheets and hello to a streamlined, modern solution.

---

## ✨ Features That Make Life Easier

✅ **🔒 Role-Based Access Control**  
- Admins can manage inventory, while viewers can explore analytics. Everyone gets just the right amount of power.

✅ **📱 Fully Responsive Design**  
- Manage your inventory on any device, from desktops to smartphones. Built with **Ant Design** for a clean and professional look.

✅ **📊 Inventory Management**  
- Perform **CRUD operations** (Create, Read, Update, Delete) on inventory items.  
- Transfer stock between warehouses with ease.  
- Get **low stock alerts** to avoid running out of critical items.

✅ **📈 Analytics and Forecasting**  
- Visualize your inventory data with **bar charts**, **pie charts**, and more.  
- Use forecasting tools to predict future stock needs and make informed decisions.

✅ **💾 Data Export**  
- Export inventory data as **CSV files** for offline analysis or sharing.

✅ **🔋 Action Logging**  
- Keep track of every action performed in the system for accountability and transparency.

✅ **⚡ Optimized Performance**  
- Efficient data fetching and caching ensure a smooth user experience.

---

## 🧑‍💻 Tech Stack

### **Frontend**  
- ⚛️ **React** – For building a dynamic and interactive user interface.  
- 🎨 **Ant Design** – For a sleek and modern UI.  
- 🌍 **Axios** – For seamless communication with the backend.  
- 🎭 **CSS** – To add a touch of style and personality.

### **Backend**  
- 🟢 **Node.js** – The backbone of the server-side logic.  
- 🚀 **Express** – For building RESTful APIs.  
- 🌳 **MongoDB** – A NoSQL database to store and manage inventory data.  

### **Deployment**  
- 🔺 **Vercel** – For fast and reliable deployment of the frontend.  
- 🌐 **Cloud Hosting** – For backend and database hosting.

---

## 🚀 Getting Started

### **Prerequisites**  
Before you begin, ensure you have the following installed:
- 🟢 **Node.js**  
- 🌳 **MongoDB**  

### **Installation**  

#### **Clone the Repository**  
```bash
git clone https://github.com/your-username/easy-stock.git
cd easy-stock
```
Set Up the Backend
Navigate to the server directory:  
```bash
cd server
```
Install dependencies:  
```bash
npm install
```
Create a **.env** file and add your MongoDB connection string (because security is *important*):  
```ini
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```
Start the backend server:  
```bash
npm start
```

#### **Set Up the Frontend**  
Navigate to the client directory:  
```bash
cd client
```
Install dependencies:  
```bash
npm install
```
Create a **.env** file and add the backend API URL:  
```ini
REACT_APP_API_URL=http://localhost:5000
```
Start the frontend development server:  
```bash
npm start
```

