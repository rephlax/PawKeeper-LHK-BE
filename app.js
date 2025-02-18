require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const swaggerUI = require("swagger-ui-express");
const docs = require("./docs");

const ALLOWED_ORIGINS = [
	"https://pawkeeper.netlify.app",
	"http://localhost:5173",
	"http://localhost:3000",
];

// Trust proxy settings for Render
app.set("trust proxy", true);

// Helmet configuration
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"api.mapbox.com",
					"events.mapbox.com",
				],
				styleSrc: ["'self'", "'unsafe-inline'", "api.mapbox.com"],
				imgSrc: ["'self'", "data:", "blob:", "*.mapbox.com", "api.mapbox.com"],
				connectSrc: [
					"'self'",
					"api.mapbox.com",
					"events.mapbox.com",
					"https://*.tiles.mapbox.com",
				],
				workerSrc: ["'self'", "blob:"],
				childSrc: ["'self'", "blob:"],
			},
		},
	})
);

// Single CORS configuration
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || ALLOWED_ORIGINS.includes(origin)) {
				callback(null, true);
			} else {
				console.log("Blocked by CORS:", origin);
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
		exposedHeaders: ["Content-Range", "X-Content-Range"],
		maxAge: 86400,
	})
);

// Request logging middleware with timestamp
app.use((req, res, next) => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] Request:`, {
		method: req.method,
		url: req.url,
		origin: req.headers.origin,
		ip: req.headers["cf-connecting-ip"] || req.ip,
		userAgent: req.headers["user-agent"],
	});
	next();
});

require("./config")(app);

app.get("/", (req, res) => {
	res.status(200).json({
		message: "PawKeeper API is running",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	});
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
	});
});

// Debug endpoint
app.get("/debug-env", (req, res) => {
	res.json({
		origin: process.env.ORIGIN,
		port: process.env.PORT,
		allowedOrigins: ALLOWED_ORIGINS,
		nodeEnv: process.env.NODE_ENV,
	});
});

// Routes
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

const petRoutes = require("./routes/pet.routes");
app.use("/pets", petRoutes);

const reviewRoutes = require("./routes/review.routes");
app.use("/reviews", reviewRoutes);

const messageRoutes = require("./routes/message.routes");
app.use("/messages", messageRoutes);

const roomRoutes = require("./routes/room.routes");
app.use("/rooms", roomRoutes);

const locationPinRoutes = require("./routes/location-pin.routes");
app.use("/api/location-pins", locationPinRoutes);

// Swagger documentation
app.use("/pawkeeper", swaggerUI.serve, swaggerUI.setup(docs));

// Error handling
app.use((err, req, res, next) => {
	console.error("Global error handler:", {
		error: err.message,
		stack: err.stack,
		origin: req.headers.origin,
		path: req.path,
		method: req.method,
	});

	if (err.message === "Not allowed by CORS") {
		res.status(403).json({
			message: "CORS error",
			error: err.message,
			origin: req.headers.origin,
		});
	} else {
		next(err);
	}
});

require("./error-handling")(app);

module.exports = { app, ALLOWED_ORIGINS };
