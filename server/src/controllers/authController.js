const User = require("../models/User");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("유저를 찾을 수 없습니다.");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({ message: "로그아웃 되었습니다." });
};

module.exports = { getMe, logout };
