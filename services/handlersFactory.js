const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document)
      return next(
        new ApiError(`No ${Model} found with this id ${req.params.id}`, 404)
      );

    document.save();
    res.status(200).json({ data: document });
  });

const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({ data: document });
  });

const getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);

    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    const document = await query;
    if (!document)
      return next(new ApiError(`No ${Model} found with this id ${id}`, 404));
    res.status(200).json({ data: document });
  });

const getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObject) filter = req.filterObject;
    const documentCounts = await Model.countDocuments();

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document)
      return next(new ApiError(`No ${Model} found with this id ${id}`, 404));
    document.remove();
    res.status(204).send(document);
  });

const inActive = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndUpdate(id, { active: false });

    req.body.active = false;

    if (!document)
      return next(new ApiError(`No ${Model} found with this id ${id}`, 404));
    res.status(200).json(document);
  });

module.exports = { getAll, getOne, deleteOne, createOne, updateOne, inActive };
