const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Serve uploads folder publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 3001;



const startServer = async () => {
  try {

    // Test DB connection
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Sync models (create/update tables)
    await sequelize.sync();
    console.log("Database synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Database connection failed:", err);
  }
};

startServer();