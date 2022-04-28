const Booking = require("../models/Booking");
const Campground = require("../models/Campground");

//@desc     Get all campground bookings
//@route    GET /bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;

  // General user can see only their appointments
  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "campground",
    });
  } else {
    // Admin can see all
    query = Booking.find().populate({
      path: "campground",
    });
  }

  try {
    const bookings = await query;
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Campground Booking" });
  }
};

//@desc     Get single campground booking
//@route    GET /bookings/:id
//@access   Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "campground",
    });

    if (!booking) {
      return res.status(404).json({
        succes: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        succes: false,
        message: `You are not the owner of booking with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Campground Booking" });
  }
};

//@desc     Book a campground
//@route    POST /campgrounds/:campgroundId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.campground = req.params.campgroundId;

    // add user id to req.body
    req.body.user = req.user.id;

    // Check for existed appointment
    const existedCampgrounds = await Campground.find({ user: req.user.id });

    // If the user is not an admin, they can only create 3 appointments.
    if (existedCampgrounds.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 bookings`,
      });
    }

    const campground = await Campground.findById(req.params.campgroundId);

    if (!campground) {
      return res.status(404).json({
        success: false,
        message: `No campground with the id of ${req.params.campgroundId}`,
      });
    }

    // Check if book date is valid
    if (new Date(req.body.bookDate) < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book date" });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Campground Booking" });
  }
};

//@desc     Update booking
//@route    PUT /bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    // Check if book date is valid
    if (req.body.bookDate && new Date(req.body.bookDate) < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book date" });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update booking" });
  }
};

/*
 *  @desc   Delete a booking.
 *  @route  DELETE /bookings/:id
 *  @access Private
 */
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    // No booking is found.
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner or an admin.
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete the booking" });
  }
};
