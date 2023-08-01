const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const PORT = process.env.PORT || 3000;

const app = express();

// Request limiter

app.use(limiter);
app.use(cors());

// Load router

const cacheRouter = require("./src/router/cache.router");
// Use Router

app.use("/v1/cache", cacheRouter);

// Error handler
const handleError = require("./src/utils/errorHandler.js");

app.use((req, res, next) => {
  const error = new Error("Resource in not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  handleError(error, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
