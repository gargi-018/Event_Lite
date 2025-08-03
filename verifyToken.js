const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

function verifyToken(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({ message: "Token missing or malformed."});
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }catch(e){
        return res.status(401).json({message: "Invalid or expired token!"});
    }
}

module.exports = verifyToken;