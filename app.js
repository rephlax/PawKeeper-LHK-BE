require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const app = express();
const swaggerUI = require("swagger-ui-express");
const docs = require("./docs");

const ALLOWED_ORIGINS = [
	"https://pawkeeper.netlify.app",
	"http://localhost:5173",
	"http://localhost:3000",
];

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin
			if (!origin) return callback(null, true);

			if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
		exposedHeaders: ["Content-Range", "X-Content-Range"],
		maxAge: 86400,
	})
);

app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (ALLOWED_ORIGINS.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Origin, Accept"
	);
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Max-Age", "86400");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	next();
});

// Request logging middleware
app.use((req, res, next) => {
	console.log("Request:", {
		method: req.method,
		url: req.url,
		origin: req.headers.origin,
		headers: req.headers,
	});
	next();
});

require("./config")(app);

// Routes
app.get("/debug-env", (req, res) => {
	res.json({
		origin: process.env.ORIGIN,
		port: process.env.PORT,
		allowedOrigins: ALLOWED_ORIGINS,
	});
});

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

app.use("/pawkeeper", swaggerUI.serve, swaggerUI.setup(docs));

app.use((err, req, res, next) => {
	console.error("Global error handler:", err);
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
