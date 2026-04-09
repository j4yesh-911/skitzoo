const jwt = require("jsonwebtoken");

/**
 * Production-ready authentication middleware
 * Handles JWT validation with proper error handling for expired tokens
 */
module.exports = (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        msg: "Authorization header missing",
        code: "NO_AUTH_HEADER"
      });
    }

    // 2️⃣ Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        msg: "Invalid token format. Expected 'Bearer <token>'",
        code: "INVALID_FORMAT"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        msg: "Token missing",
        code: "NO_TOKEN"
      });
    }

    // 3️⃣ Verify token with specific error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Handle specific JWT errors
      if (jwtError.name === "TokenExpiredError") {
        console.error("authMiddleware: JWT expired for token", token.substring(0, 20) + "...");
        return res.status(401).json({ 
          msg: "Token expired. Please login again.",
          code: "TOKEN_EXPIRED",
          expiredAt: jwtError.expiredAt
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        console.error("authMiddleware: Invalid JWT token");
        return res.status(401).json({ 
          msg: "Invalid token",
          code: "INVALID_TOKEN"
        });
      } else if (jwtError.name === "NotBeforeError") {
        return res.status(401).json({ 
          msg: "Token not active yet",
          code: "TOKEN_NOT_ACTIVE"
        });
      } else {
        throw jwtError; // Re-throw unexpected errors
      }
    }

    // 4️⃣ Validate token payload
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        msg: "Invalid token payload",
        code: "INVALID_PAYLOAD"
      });
    }

    // 5️⃣ Attach user to request (ONLY ID — fast & clean)
    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    // Catch any unexpected errors
    console.error("authMiddleware unexpected error:", err.message);
    return res.status(500).json({ 
      msg: "Authentication error",
      code: "AUTH_ERROR"
    });
  }
};