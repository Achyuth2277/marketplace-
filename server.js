require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const creatorRoutes = require("./routes/creatorRoutes");
const chatRoutes = require("./routes/chatRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize App
const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.1:5500",
      "http://localhost:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

// ✅ Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ Innovation Marketplace API is Running Successfully");
});

// ✅ Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/applications", applicationRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

