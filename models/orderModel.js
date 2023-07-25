const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "order must belong to user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],

    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },

    totalOrderPrice: {
      type: Number,
    },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDeliverd: { type: Boolean, default: false },
    deliverdAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  // chainning populate
  this.populate({
    path: "user",
    select: "name email profileImage phone",
  }).populate({ path: "cartItems.product", select: "nameprice" });
  next();
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
