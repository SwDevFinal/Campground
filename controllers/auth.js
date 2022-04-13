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
 *  @route  POST /register
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
