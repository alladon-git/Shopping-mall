const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
