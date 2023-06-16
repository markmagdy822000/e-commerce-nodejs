/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },

    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

// eslint-disable-next-line prefer-arrow-callback
categorySchema.post("init", function (doc) {
  setImageUrl(doc);
});
categorySchema.post("save", function (doc) {
  setImageUrl(doc);
});

// my solution

// const setImageUrl = (mode) => {
//   categorySchema.post(mode, (doc) => {
//     if (doc.image) {
//       const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
//       doc.image = imageUrl;
//     }
//   });
// };
// setImageUrl("init");
// setImageUrl("save");

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category };
