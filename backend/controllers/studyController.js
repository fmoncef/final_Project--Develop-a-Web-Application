const { log } = require("console");
const asyncHandler = require("express-async-handler");
const Study = require("../models/study.model.js");
const User = require("../models/user.model.js");

//@desc Get all studies
//@route GET /api/studies
//@access Private
const getStudies = asyncHandler(async (req, res) => {
  const studies = await Study.find();

  res.status(200).json(studies);
});

//@desc add study
//@route POST /api/studies
//@access Private
const createStudy = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, status, drugSubstance } = req.body;
  if (!name || !startDate || !endDate || !status || !drugSubstance) {
    res.status(400);
    console.log(req.body);
    throw new Error("Please add all fields");
  }

  // Check if study already exists
  const studyExists = await Study.findOne({ name });
  if (studyExists) {
    res.status(409);
    throw new Error("Study already exists");
  }
  const userRole = req.user.role;
  // check for user role
  if (userRole !== "Clinical Trial Manager") {
    res.status(401);
    throw new Error("User not authorized to set a new study");
  }
  const newStudy = await Study.create({
    user: req.user.id,
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status,
    drugSubstance: req.body.drugSubstance,
    image: req.body.image,
  });
  res.status(201).json(newStudy);
});

// @desc update study
// @route PUT /api/studies
// @access Private
const updateStudy = asyncHandler(async (req, res) => {
  const studyToUpdate = await Study.findById(req.params.id);
  if (!studyToUpdate) {
    res.status(404);
    throw new Error("Study not found");
  }
  const userRole = req.user.role;
  // check for user role
  if (userRole !== "Clinical Trial Manager") {
    res.status(401);
    throw new Error("User not authorized to update");
  }

  const updatedStudy = await Study.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(201).json(updatedStudy);
});

// @desc delete study
// @route DELETE /api/studies
// @access Private
const deleteStudy = asyncHandler(async (req, res) => {
  const studyToDelete = await Study.findById(req.params.id);
  if (!studyToDelete) {
    res.status(404);
    throw new Error("Study not found");
  }
  const userRole = req.user.role;
  // check for user role
  if (userRole !== "Clinical Trial Manager") {
    res.status(401);
    throw new Error("User not authorized to delete this study");
  }

  await Study.deleteOne();

  res.status(201).json({ id: req.params.id });
});

module.exports = {
  getStudies,
  createStudy,
  updateStudy,
  deleteStudy,
};
