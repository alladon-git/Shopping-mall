const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("인증 토큰이 없습니다."));
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401);
    next(new Error("토큰이 유효하지 않거나 만료되었습니다."));
  }
};

module.exports = { protect };
