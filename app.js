require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");
const app = express();

// For documentation with Swagger
const swaggerUI = require("swagger-ui-express");
const docs = require("./docs");

// const allowedOrigins = [
//   'https://pawkeeper.netlify.app',
//   'https://pawkeeper-lhk-be.onrender.com',
//   'http://localhost:5173',
//   'http://localhost:5005'
// ];
const origin = process.env.ORIGIN || "http://localhost:5173";

app.use(
	cors({
		origin: [
			"https://pawkeeper.netlify.app",
			"http://localhost:5173",
			"http://localhost:3000",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
		maxAge: 86400,
	})
);

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", `${origin}`);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
	res.header(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Origin, Accept"
	);
	res.header("Access-Control-Allow-Credentials", true);
	next();
});

app.use((req, res, next) => {
	console.log("Request:", {
		method: req.method,
		url: req.url,
		origin: req.get("origin"),
		headers: req.headers,
	});
	next();
});

require("./config")(app);

app.get("/debug-env", (req, res) => {
	res.json({
		origin: process.env.ORIGIN,
		port: process.env.PORT,
	});
});

// 👇 Start handling routes here
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
	if (err.name === "CORSError") {
		res.status(403).json({
			message: "CORS error",
			error: err.message,
		});
	} else {
		next(err);
	}
});

require("./error-handling")(app);

module.exports = { app };
