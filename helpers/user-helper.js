var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
const { response } = require("../app");

const accountSid = 'ACfedc8fa3b05bdd9560e1c41bf1bba388';
const authToken = 'e53a9bf7920eb81fb691cd028ebb31bd';
const client = require('twilio')(accountSid, authToken);

const Razorpay = require("razorpay");
const { json } = require("express");
const { ObjectID } = require("bson");

var instance = new Razorpay({
    key_id: "rzp_test_zginGQrlDjXy7d",
    key_secret: "URlsfCf9N3d6scwbEVFBQuW7",
});

var paypal = require("paypal-rest-sdk");
const { timeStamp } = require("console");
const { resolve } = require("path");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AW1f3zaBA1_-HM7KQpqQMNSKk28szPtPuXdjSsdwXI0RMizlauCXGhsiIy3_QPzA5kb9QNgZBukcbokC",
    client_secret:
        "EG7uKTRfBvnzk0hrFfcR9dYsKlZJhre3nMm7nGrH5tW9VsNlZ-y9SFDAKrHRUWU_xYPBJldBOLNacEaL",
});


module.exports = {

    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let phone = await db.get().collection(collection.USER_COLLECTION).findOne({ mobile: userData.mobile })

            if (phone) {
                console.log('same phone no');
                response.status = true
                resolve(response)

            } else {
                console.log('no same');
                userData.Password = await bcrypt.hash(userData.Password, 10)
                userData.action = true
                client.verify.services('VA47f3ff62b318d775d3b4b81c2449fa87')
                    .verifications.create({
                        // to: `+91${signupData.mobile}`,
                        to: '+918921653181',
                        channel: 'sms',
                    })
                    .then(verification => console.log(verification.status));
                console.log('no same email');
                resolve({ status: false, userData })
            }
        })
    },


    signupOtp: (userData, userDetails) => {
        return new Promise((resolve, reject) => {
            let response = {}
            client.verify.services('VA47f3ff62b318d775d3b4b81c2449fa87')
                .verificationChecks
                .create({
                    to: `+918921653181`,
                    code: userData.otp
                })
                .then((verification_check) => {
                    console.log(verification_check.status);
                    if (verification_check.status == 'approved') {
                        db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((data) => {
                            resolve(userDetails)
                        })
                    } else {
                        response.err = 'otp is invalid';
                        console.log(response);
                        resolve(response)
                    }
                })
        })
    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log('printng from user helper');
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email: userData.Email });
            console.log('user id is  ' + user);
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false });
                    }
                });
            }
        });
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1,
        };
        return new Promise(async (resolve, reject) => {
            let userCart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (userCart) {
                let proExist = userCart.product.findIndex(
                    (product) => product.item === proId
                );
                if (proExist != -1) {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId), "product.item": objectId(proId) },

                            {
                                $inc: { "product.$.quantity": 1 },
                            }
                        )
                        .then(() => {
                            resolve();
                        });
                } else {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .updateOne(
                            { user: objectId(userId) },
                            {
                                $push: { product: proObj },
                            }
                        )
                        .then((response) => {
                            resolve();
                        });
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: [proObj],
                };
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .insertOne(cartObj)
                    .then((response) => {
                        resolve();
                    });
            }
        });
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quantity: "$product.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },

                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                ])
                .toArray();
            resolve(cartItems);
        });
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            if (cart) {
                count = cart.product.length;
            }
            resolve(count);
        });
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        { _id: objectId(details.cart) },
                        {
                            $pull: { product: { item: objectId(details.product) } },
                        }
                    )
                    .then((response) => {
                        resolve({ removeProduct: true });
                    });
            } else {
                db.get()
                    .collection(collection.CART_COLLECTION)
                    .updateOne(
                        {
                            _id: objectId(details.cart),
                            "product.item": objectId(details.product),
                        },
                        {
                            $inc: { "product.$.quantity": details.count },
                        }
                    )
                    .then((response) => {
                        resolve({ status: true });
                    });
            }
        });
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quantity: "$product.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: ["$quantity", { $toInt: "$product.price" }],
                                },
                            },
                        },
                    },
                ])
                .toArray();

            resolve(total[0].total);
        });
    },
    placeOrder: (order, product, total) => {
        return new Promise((resolve, reject) => {
            let status = order["payment-method"] === "COD" ? "placed" : "pending";
            let orderObj = {
                deliveryDetails: {
                    mobile: order.Mobile,
                    address: order.address,
                    pincode: order.pincode,
                },
                userId: objectId(order.userId),
                paymentMethod: order["payment-method"],
                product: product,
                totalAmount: total,
                status: status,
                date: new Date(),
            };

            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(orderObj)
                .then((response) => {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .remove({ user: objectId(order.userId) });
                    resolve();
                });
        });
    },
    getCartProductsList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            resolve(cart.product);
        });
    },

    removeCartProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                    { _id: objectId(details.cart) },
                    {
                        $pull: { product: { item: objectId(details.product) } },
                    }
                )
                .then((response) => {
                    resolve({ removeProduct: true });
                });
        });
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .aggregate([
                    {
                        $match: { user: objectId(userId) },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quantity: "$product.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $multiply: [
                                        { $toInt: "$quantity" },
                                        { $toInt: "$product.Price" },
                                    ],
                                },
                            },
                        },
                    },
                ])
                .toArray();
            console.log("hhhhhh");
            console.log(total[0].total);
            resolve(total[0].total);
        });
    },
    placeOrder: (order, product, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, product, total);

            let status = order["pament-method"] === "COD" ? "placed" : "pending";
            let date = new Date();
            let orderObj = {
                deliveryDetails: {
                    // mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode,
                    town: order.town,
                },
                userId: objectId(order.userId),
                paymentMethod: order["payment-method"],
                product: product,
                totalAmount: total,
                status: status,

                date: date.toLocaleString(),
                //date: new Date(),
                // address:ObjectID(order.address),
            };
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(orderObj)
                .then((response) => {
                    db.get()
                        .collection(collection.CART_COLLECTION)
                        .deleteOne({ user: objectId(order.userId) });
                    resolve(response.insertedId);
                });
        });
    },
    getCartProductList: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cart = await db
                .get()
                .collection(collection.CART_COLLECTION)
                .findOne({ user: objectId(userId) });
            // response(cart.product)
            console.log(cart);
            resolve(cart.product);
        });
    },
    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ userId: objectId(userId) }).sort({date:-1})
                .toArray()

            resolve(order);
        });
    },
    getViewOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(order);
        });
    },
    getOrderProduct: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    console.log(orderItems),
                    {
                        $match: { _id: objectId(orderId) },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quantity: "$product.quantity",
                        },
                    },
                ]);
        });
    },
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var instance = new Razorpay({
                key_id: "rzp_test_zginGQrlDjXy7d",
                key_secret: "URlsfCf9N3d6scwbEVFBQuW7",
            });
            instance.orders
                .create({
                    amount: total * 100,
                    currency: "INR",
                    // receipt: "" + orderId,
                    receipt: "" + objectId(orderId),
                })
                .then((data) => {
                    resolve(data);
                    console.log(data);
                })
                .catch((error) => { });
        });
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac("sha256", "URlsfCf9N3d6scwbEVFBQuW7");

            hmac.update(
                details["payment[razorpay_order_id]"] +
                "|" +
                details["payment[razorpay_payment_id]"]
            );
            hmac = hmac.digest("hex");
            if (hmac == details["payment[razorpay_signature]"]) {
                console.log("kkkkk");
                resolve();
            } else {
                reject();
            }
        });
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: objectId(orderId) },
                    {
                        $set: {
                            status: "placed",
                        },
                    }
                )
                .then(() => {
                    resolve();
                });
        });
    },
    generatePaypal: (orderId, total) => {
        console.log(total);
        return new Promise((resolve, reject) => {
            var create_payment_json = {
                intent: "sale",
                payer: {
                    payment_method: "paypal",
                },
                redirect_urls: {
                    return_url: "http://localhost:3000/order-success",
                    cancel_url: "http://localhost:3000/cancel",
                },
                transactions: [
                    {
                        item_list: {
                            items: [
                                {
                                    name: "product",
                                    sku: "item",
                                    price: total,
                                    currency: "USD",
                                    quantity: 1,
                                },
                            ],
                        },
                        amount: {
                            currency: "USD",
                            total: total,
                        },
                        description: "This is the payment description.",
                    },
                ],
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    console.log(payment);
                    resolve(payment);
                }
            });
        });
    },
    cancelOrder: (orderId, userId) => {
        console.log(orderId);
        return new Promise(async (resolve, reject) => {
            let totalamount = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .findOne({ _id: objectId(orderId) });
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: objectId(orderId) },
                    { $set: { status: "cancelled", cancelled: true } }
                );
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) }, { $set: { totalAmount: 0 } });
            console.log(totalamount.totalAmount);
            console.log(totalamount.paymentmethod);
            if (totalamount.paymentmethod != "COD") {
                console.log("Not cod");
                if (totalamount.totalAmount > 1) {
                    console.log("+0");
                    db.get()
                        .collection(collection.WALLET_COLLECTION)
                        .updateOne(
                            { user: objectId(userId) },
                            { $inc: { amount: totalamount.totalAmount } }
                        );
                } else {
                    console.log("100");
                    db.get()
                        .collection(collection.WALLET_COLLECTION)
                        .updateOne(
                            { user: objectId(userId) },
                            { $set: { amount: totalamount.totalAmount } }
                        );
                }
                console.log(totalamount.totalAmount);
            } else {
                console.log("cod sds");
            }
        });
    },

    userDeliveryAddress: (data, userId) => {
        let userObj = {
            user: objectId(userId),
            address: [data],
        };
        return new Promise(async (resolve, reject) => {
            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .insertOne(userObj)
                .then((response) => {
                    resolve();
                    console.log(response);
                });
        });
    },
    updatePassword: (password, uid) => {
        console.log(password);
        console.log(uid);
        return new Promise(async (resolve, reject) => {
            await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ _id: ObjectId(uid) })
                .then((response) => {
                    bcrypt
                        .compare(password.currentpassword, response.password)
                        .then(async (status) => {
                            console.log("status is   " + status);
                            if (status) {
                                password.newpassword = await bcrypt.hash(
                                    password.newpassword,
                                    10
                                );
                                await db
                                    .get()
                                    .collection(collection.USER_COLLECTION)
                                    .updateOne(
                                        { _id: ObjectId(uid) },
                                        {
                                            $set: {
                                                password: password.newpassword,
                                            },
                                        }
                                    );
                                resolve(status);
                            } else {
                                console.log("going back to route");
                                resolve(status);
                            }
                        });
                });
        });
    },
    checkCoupon: (coupon, total, userId) => {
        console.log('coupon')
        console.log(coupon)
        console.log(total)
        return new Promise((resolve, reject) => {
            let responses = {}
            db.get().collection(collection.COUPON_COLLECTION).findOne({ couponname: coupon.coupon }).then(async (response) => {
                if (response) {
                    if (response.users.includes(userId)) {
                        responses.status = false
                        resolve(responses)
                    } else {
                        await db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: response._id }, {
                            $push: { users: userId }
                        })
                        let discountAmount = total * response.discount / 100;
                        responses.totalAmount = total - discountAmount
                        responses.status = true
                        console.log(responses);
                        resolve(responses)
                    }
                } else {
                    responses.status = false
                    resolve(responses)
                }
            })
        })
    },
    getUserDeliveryAddress: () => {

        // return new Promise ((resolve,reject)=>{
        //     db.get().collection(collection.ADDRESS_COLLECTION).find().toArray().then((response)=>{
        //         console.log(response);
        //         resolve(response)
        //     })
        // })

        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.ADDRESS_COLLECTION).aggregate([

                {
                    $unwind: '$address'
                }

            ]).toArray()
            console.log(data);
            console.log(data[0]);
            resolve(data)
        })
    },
    addToWishlist: (proId, userId) => {

        let wishlistObj = {
            user: objectId(userId),
            product: [proObj],
        };
        db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .insertOne(wishlistObj)
            .then((response) => {
                resolve(response);
            });

    },
    getOrderProducts: (orderId) => {


        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },





                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()
            // resolve(cartItems);
            console.log('printng get order producta resolve user helper');
            console.log(orderItems);
            resolve(orderItems)
        })




    }
}
