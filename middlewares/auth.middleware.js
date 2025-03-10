const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
	try {
		if (
			req.headers.authorization &&
			req.headers.authorization.split(" ")[0] === "Bearer"
		) {
			const Token = req.headers.authorization.split(" ")[1];
			const data = jwt.verify(Token, process.env.TOKEN_KEY);
			req.payload = data;
			next();
		} else {
			return res.status(403).json({ message: "Incorrect Headers" });
		}
	} catch (error) {
		console.error("Authentication Error:", error);
		return res.status(403).json({
			message:
				error.name === "TokenExpiredError"
					? "Token expired"
					: "Authentication failed",
		});
	}
};

module.exports = isAuthenticated;
