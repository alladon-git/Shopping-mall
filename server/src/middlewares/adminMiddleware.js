const adminOnly = (req, res, next) => {
  if (req.user?.userType !== "admin") {
    res.status(403);
    return next(new Error("관리자 권한이 필요합니다."));
  }
  next();
};

module.exports = { adminOnly };
