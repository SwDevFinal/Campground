const Campground = require("../models/Campground");

//@desc     Get campground list
//@route    GET /campgrounds
//@access   Public
exports.getCampgrounds = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // query = Campground.find(JSON.parse(queryStr)).populate("appointments");
    query = Campground.find(JSON.parse(queryStr));

    // Select
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Campground.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const campgrounds = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: campgrounds.length,
      pagination,
      data: campgrounds,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get a campground
//@route    GET /campgrounds/{camgroundId}
//@access   Public
exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({
      success: true,
      data: campground,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create a campground
//@route    POST /campgrounds
//@access   Private
exports.createCampground = async (req, res, next) => {
  const campground = await Campground.create(req.body);
  res.status(200).json({
    success: true,
    data: campground,
  });
};

//@desc     Update a campground
//@route    PUT /campgrounds/{campgroundId}
//@access   Private
exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      data: campground,
    });

    if (!campground) {
      return res.status(400).json({ success: false });
    }
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete a campground
//@route    DELETE /campgrounds/{campgroundId}
//@access   Private
exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    campground.remove();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(400).json({ success: false });
  }
};
