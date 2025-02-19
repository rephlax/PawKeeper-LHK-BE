const mongoose = require("mongoose");

const MONGO_URI =
	process.env.MONGODB_URI || `mongodb://localhost:27017/PawKeeper-LHK-BE`;

mongoose
	.connect(MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	})
	.then((x) => {
		const dbName = x.connections[0].name;
		console.log(`Connected to Mongo! Database name: "${dbName}"`);
	})
	.catch((err) => {
		console.error("Error connecting to mongo:", err);
		process.exit(1);
	});

mongoose.connection.on("error", (err) => {
	console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
	console.log("MongoDB disconnected, attempting to reconnect...");
});
