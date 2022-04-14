const User = require("../models/User");

/**
 *  A method to set cookie (bearer token).
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

/*
 *  @desc   Register user
 *  @route  POST /auth/register
 *  @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, telnum, email, password, role } = req.body;

    //Create User
    const user = await User.create({
      name,
      telnum,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

/*
 *  @desc   Login user
 *  @route  POST /auth/login
 *  @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //   Validate email and password.
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password." });
    }

    //   Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Login unsuccessful, please check your email and password.",
      });
    }

    //   Check if password matches.
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Login unsuccessful, please check your email and password.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Login unsuccessful, please check your email and password.",
    });
  }
};

/*
 *  @desc   Log user out / clear cookie.
 *  @route  GET /auth/logout
 *  @access Private
 */
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};
