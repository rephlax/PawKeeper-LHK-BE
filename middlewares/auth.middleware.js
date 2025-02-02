const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
      res.status(403).json({ message: "Incorrect Headers" });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({message: "Expired Credentials"});
  }
};

module.exports = isAuthenticated;