class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    // copy object by value not by reference
    const queryStringObj = { ...this.queryString };

    const exclude = ["fields", "page", "sort", "limit"];
    exclude.forEach((e) => delete queryStringObj[e]);

    // JSON.stringify convert object to string (to update lte value to $lte using regex)
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(lte|lt|gt|gte)\b/g, (match) => `$${match}`);

    // JOSN.parse =>  convert string to object
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else this.mongooseQuery = this.mongooseQuery.sort("-createAt");

    return this; //return obj to chain to it another features
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      const findQuery = {};
      if (modelName === "Products") {
        findQuery.$or = [
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      } else {
        findQuery.$or = [
          { name: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      }
      this.mongooseQuery = this.mongooseQuery.find(findQuery);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit || 50;
    const skip = (page - 1) * limit;
    const endIndex = limit * page;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);
    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
