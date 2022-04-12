//Protect routes
exports.protect = async (req, res, next) => {};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {};
};
