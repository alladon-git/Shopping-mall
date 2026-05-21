const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("유저를 찾을 수 없습니다.");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, name, password, phone, userType, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("이미 사용 중인 이메일입니다.");
    }

    const user = await User.create({ email, name, password, phone, userType, address });
    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { email, name, userType, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, name, userType, address },
      { new: true, runValidators: true }
    );
    if (!user) {
      res.status(404);
      throw new Error("유저를 찾을 수 없습니다.");
    }
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("유저를 찾을 수 없습니다.");
    }
    res.json({ message: "유저가 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
