const stripe = require("stripe")(process.env.STRIPE_SECRETE);
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const ApiError = require("../utils/apiError");
const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const creatCashOrder = asyncHandler(async (req, res, next) => {
  // app setting
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depend on cartId
  // const cart = await Cart.findOneById(req.params.cartId);
  const cart = await Cart.findOne({ _id: req.params.cartId });

  if (!cart)
    return next(
      new ApiError(`Cart not found with id ${req.params.cartId}`, 404)
    );
  // 2- get order price depend on cart price "check if coupon applied"
  const orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice; // undefined (if not applied) or a number

  const totalOrderPrice = orderPrice + taxPrice + shippingPrice;

  //3- Create Order with default method "cash"
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // after creating order decrement the quantity of products and increment the sold property
  // 4- After creating order decrement the quantity of products and increment the sold property
  if (order) {
    const bulOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));
    // bulk =>  apply more than one operation in one command
    await Product.bulkWrite(bulOptions, {});
  }
  // 5- Delete cart depend on cartId
  await Cart.findByIdAndDelete(req.params.cartId);
  res.status(200).json({ status: "success", data: order });
});

const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    const filterObject = { user: req.user._id };
    req.filterObject = filterObject;
  }
  next();
});

// @desc    GET all orders
// @route:  GET /api/v1/orders
// @access  Protected/User-Admin-Manager
const findAllOrders = getAll(Order);

// @desc    GET all orders
// @route:  GET /api/v1/orders
// @access  Protected/User-Admin-Manager
const findSpecificOrder = getOne(Order);

const updateOrderPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return next(new ApiError(`Order not found with id ${req.params.id}`, 404));
  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

const updateOrderDeliverd = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return next(new ApiError(`Order not found with id ${req.params.id}`, 404));
  order.isDeliverd = true;
  order.deliverdAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

//

// make sassion to send the total price to the front end
// @desc GET checkout from strip and send it as response
// @route GET /api/v1/orders/checkout-session/:cartId
// @access Protected/User
const checkoutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depend on cartId
  // const cart = await Cart.findOneById(req.params.cartId);
  const cart = await Cart.findOne({ _id: req.params.cartId });

  if (!cart)
    return next(
      new ApiError(`Cart not found with id ${req.params.cartId}`, 404)
    );

  // 2- get order price depend on cart price "check if coupon applied"
  const orderPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice; // undefined (if not applied) or a number

  const totalOrderPrice = orderPrice + taxPrice + shippingPrice;

  // create  strip checckout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: Math.floor(totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    // https://domain_name/orders
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  // send session to response
  res.status(200).json({ status: "success", data: session });
});

const createCaedOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.display_itmes[0].amount / 100;

  const cart = await Cart.fintyId(cartId);
  const user = await User.findOneOne({ email: session.customer_email });

  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  if (order) {
    const bulOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));
    // bulk =>  apply more than one operation in one command
    await Product.bulkWrite(bulOptions, {});
  }
  // 5- Delete cart depend on cartId
  await Cart.findByIdAndDelete(cartId);
};

// @desc    this webhook will run when stripe payment success paid
// @route:  POST /webhook-checkout
// @access  Protected/User
const webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook err ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // console.log("create order here .....");
    createCaedOrder(event.data.object);
  }
  res.status(200).json({ recieved: true });
});
module.exports = {
  creatCashOrder,
  filterOrderForLoggedUser,
  findSpecificOrder,
  findAllOrders,
  updateOrderPaid,
  updateOrderDeliverd,
  checkoutSession,
  webhookCheckout,
};
