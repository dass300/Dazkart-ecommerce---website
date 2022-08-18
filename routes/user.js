				const { response } = require("express");

				var express = require("express");
				const session = require("express-session");
				const { request } = require("../app");
				var router = express.Router();
				var MongoClient = require("mongodb").MongoClient;
				var objectId = require("mongodb").ObjectId;

				const productHelper = require("../helpers/product-helper");
				const userHelper = require("../helpers/user-helper");


			

				const verifyLogin = (req, res, next) => {
					if (req.session.userLoggedIn) {
						next();
					} else {
						res.render("user/user-login", { loginErr: req.session.loginErr });
						req.session.loginErr = false;
					}
				};
			




				//verify login
				try {
					router.get("/", async function (req, res, next) {
						let user = req.session.user;
						let cartCount = null;
						if (req.session.user) {
							cartCount = await userHelper.getCartCount(req.session.user._id);
							productHelper.getAllProducts().then((response) => {
								product = response.product;
								women = response.women;
								men = response.men;

								res.render("user/home-one", {
									product,
									women,
									men,
									user,
									user_log: req.session.user,
									cartCount,
								});
								// res.render('user/home-one',{product,women,men,user,user:req.session.user,cartCount});
							});
						} else {
							productHelper.getAllProducts().then((response) => {
								product = response.product;
								women = response.women;
								men = response.men;

								res.render("user/home-one", {
									product,
									women,
									men,
									admin: false,
									user: true,
									cartCount,
								});
							});
						}
					});
				} catch (err) {
					res.render("user/404");
				}



				//signup

				try {
					router.get("/user-signup", (req, res) => {
						if (req.session.loggedIn) {
							res.redirect("/");
						} else {
							res.render("user/user-signup");
						}
					});
				} catch (err) {
					res.render("user/404");
				}



				try {
					router.post("/user-signup", (req, res) => {
						userHelper.doSignup(req.body).then((response) => {
							req.session.user = response;
							req.session.userloggedIn = true;
							if (response.status) {
								res.redirect("/user-signup");
							} else {
								user = response.userData;
								res.render("user/otp-verify");
							}
						});

						// res.redirect('user/user-signup')
					});
				} catch (err) {
					res.render("user/404");
				}



				try {
					router.post("/otp-verify", (req, res) => {
						userHelper.signupOtp(req.body, user).then((response) => {
							req.session.loggedIn = true;
							req.session.user = response;
							res.redirect("/");
						});

						// res.redirect('user/user-signup')
					});
				} catch (err) {
					res.render("user/404");
				}

				try {

					router.post("/otp-verify", (req, res) => {
						userHelper.signupOtp(req.body, user).then((response) => {
							req.session.loggedIn = true;
							req.session.user = response;
							res.redirect("/");
						});

						// res.redirect('user/user-signup')
					});
				} catch (err) {
					res.render("user/404");
				}

				//login
				try {

					router.get("/user-login", (req, res) => {
						if (req.session.userloggedIn) {
							res.redirect("/");
						} else res.render("user/user-login", { loginErr: req.session.userloginErr });
						req.session.userloginErr = false;
					});
				} catch (err) {
					res.render("user/404");
				}


				try{

					router.post("/user-login", (req, res) => {
						userHelper.doLogin(req.body).then((response) => {
							if (response.status) {
								console.log('redirecting to home page');
	
								req.session.user = response.user;
								req.session.userLoggedIn = true;
								console.log('redirecting to home page');
								res.redirect("/");
							} else {
								req.session.userloginErr = "Invalid Username or Password";
								res.redirect("/user-login");
							}
						});
					});
				}catch(err) {
					res.render("user/404");
				  }

				//logout

				try{

					router.get("/user-logout", (req, res) => {
						// req.session.destroy()
						req.session.user = null;
						req.session.userLoggedIn = false;
						res.redirect("/");
					});
				}catch(err) {
					res.render("user/404");
				  }
			


				//home one

				try{
					
					router.get("/home-one", function (req, res, next) {
						res.redirect("/");
					});
				}catch(err) {
					res.render("user/404");
				  }

				//select product
				try{
					router.get("/select-product/:id", async (req, res, next) => {
						let product = await productHelper.getProductDetails(req.params.id);
						res.render("user/select-product", { product, user: true, });
					});
				}catch(err) {
					res.render("user/404");
			  }

				//wishlist
				// router.get("/wishlist/:id", async (req, res, next) => {
				// 	let product = await productHelper.getProductDetails(req.params.id);
				// 	res.render("user/wishlist", { product, user, user: true, user_log: req.session.user });
				// });

				try{
					router.get("/add-to-wishlist/:id", (req, res) => {
						userHelper.addToWishlist(req.params.id, req.session.user._id).then((wishlistObj) => {
							res.json({ status: true });
							// res.redirect('/')
						});
					});
				}catch(err) {
					res.render("user/404");
				  }

				  try{
					  router.get("/wishlist", (req, res) => {
						  res.render("user/wishlist", { user: true, user_log: req.session.user });
					  });
				  }catch(err) {
					res.render("user/404");
				  }


				//user cart

				try{
					router.get("/cart", verifyLogin, async (req, res) => {
						let product = await userHelper.getCartProducts(req.session.user._id);
						let user = req.session.user;
						let totalValue = 0;
						if (product.length >= 1) {
							user = req.session.user._id;
							totalValue = await userHelper.getTotalAmount(req.session.user._id);
							console.log("total:" + totalValue);
							cartCount = await userHelper.getCartCount(req.session.user._id);
							res.render("user/cart", {
								product,
								totalValue,
								user: true,
								user,
								user_log: req.session.user,
								cartCount,
							});
							// res.render('user/cart',{product,totalValue,user:true,user,user:req.session.user,cartCount})
						} else {
							let user = req.session.user._id;
							res.render("user/cart", {
								product,
								totalValue,
								user_log: req.session.user,
								user: true,
							});
							// res.render('user/cart',{product,totalValue,user:req.session.user,user:true})
						}
					});
				}catch(err) {
					res.render("user/404");
				  }



				// add to cart
				try{

					router.get("/add-to-cart/:id", (req, res) => {
						userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
							res.json({ status: true });
							// res.redirect('/')
						});
					});
				}catch(err) {
					res.render("user/404");
				  }


				  	try{

						  router.post("/change-product-quantity", (req, res) => {
							  userHelper.changeProductQuantity(req.body).then(async (response) => {
								  response.total = await userHelper.getTotalAmount(req.body.user);
								  res.json(response);
							  });
						  });
					}catch(err) {
						res.render("user/404");
					  }

				//remove product
				try{

					router.post("/remove-product", (req, res) => {
						userHelper.removeCartProduct(req.body).then(async (response) => {
							// response.total=await userHelper.getTotalAmount(req.body.user)
	
							res.json(response);
						});
					});
				}catch(err) {
					res.render("user/404");
				  }

				//place order
				try{

					router.get("/place-order", verifyLogin, async function (req, res) {
						let total = await userHelper.getTotalAmount(req.session.user._id);
						userHelper.getUserDeliveryAddress().then((savedAddress) => {
						if (req.session.Total) {
							total = Math.round(req.session.Total);
						}
						console.log(req.session.user);
					
						res.render("user/place-order", { user: true, total, user: req.session.user,savedAddress });
						})
					});
				
				}catch(err) {
					res.render("user/404");
				  }

				  try{

					  router.post("/place-order", async (req, res) => {
						  console.log("jjjjjt");
						  console.log(req.body);
	  
						  let product = await userHelper.getCartProductList(req.body.userId);
						  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
						  if (req.session.Total) {
							  totalPrice = Math.round(req.session.Total);
	  
	  
						  }
						  console.log(product, totalPrice);
						  userHelper.placeOrder(req.body, product, totalPrice).then((orderId) => {
							  if (req.body["payment-method"] === "COD") {
								  res.json({ codSuccess: true });
							  } else if (req.body["payment-method"] === "RAZORPAY") {
								  let id = objectId(orderId);
								  userHelper.generateRazorPay(id, totalPrice).then((response) => {
									  console.log(id, totalPrice);
									  response.razorpay = true;
									  res.json(response);
								  });
							  } else {
								  console.log("jhgdsc");
								  let id = objectId(orderId);
								  console.log(id, totalPrice);
								  userHelper.generatePaypal(id, totalPrice).then((response) => {
									  console.log("das and das");
									  res.json(response);
								  });
							  }
						  });
					  });
				  }catch(err) {
					res.render("user/404");
				  }

				// paypal sucess

				try{

					router.get("/success", (req, res) => {
						const payerId = req.query.PayerID;
						const paymentId = req.query.paymentId;
	
						const execute_payment_json = {
							payer_id: payerId,
							transactions: [
								{
									amount: {
										currency: "USD",
										total: total,
									},
								},
							],
						};
	
						paypal.payment.create(create_payment_json, function (error, payment) {
							if (error) {
								throw error;
							} else {
								console.log("Create Payment Response");
								console.log(payment);
							}
						});
					});
					
				}catch(err) {
					res.render("user/404");
				  }

				//order success
				try{

					router.get("/order-success", (req, res) => {
						res.render("user/order-success", { user: true, user: req.session.user });
					});
				}catch(err) {
					res.render("user/404");
				  }

				//orders
				try{

					router.get("/order", async (req, res) => {
						let order = await userHelper.getUserOrder(req.session.user._id);
						res.render("user/order", { user: true, user: req.session.user, order });
					});
				}catch(err) {
					res.render("user/404");
				  }

				// router.get("/view-order-product/:id",async(req,res)=>{
				//   let product=await userHelper.getOrderProduct(req.params.id)
				//   res.render('user/view-order-product',{user:true,user:req.session.user,product})
				// })

				//view-order-product

				  try{

					  router.get("/view-product/:id", async (req, res) => {
						  let product = await productHelper.getProductDetails(req.params.id);
						  console.log(product);
						  let order = userHelper.getUserOrder(req.session.user._id);
	  
						  res.render("user/view-product", {
							  product,
							  user: true,
							  user: req.session.user,
							  order,
						  });
					  });
				  }catch(err) {
					res.render("user/404");
				  }


				  try{

					  router.post("/verify-payment", (req, res) => {
						  userHelper
							  .verifyPayment(req.body)
							  .then(() => {
								  userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
									  console.log("ggggg");
									  res.json({ status: true });
								  });
							  })
							  .catch((err) => {
								  res.json({ status: false, errMsg: "" });
							  });
					  });
				  }catch(err) {
					res.render("user/404");
				  }


				  try{

					  router.get("/404", (req, res) => {
						  res.render("user/404");
					  });
				  }catch(err) {
					res.render("user/404");
				  }


				  try{

					  router.get("/modal", (req, res) => {
						  res.render("user/modal");
					  });
				  }catch(err) {
					res.render("user/404");
				  }

				//user profile
				try{

					router.get("/user-profile", function (req, res, next) {
						userHelper.getUserDeliveryAddress().then((savedAddress) => {
						res.render("user/user-profile", { user: true, user_log: req.session.user,savedAddress });
						})
					});
				}catch(err) {
					res.render("user/404");
				  }


				  try{
					  router.get("/userdeliveryaddress", (req, res) => {
						console.log("test");
						  userHelper.getUserDeliveryAddress().then((savedAddress) => {
							console.log('savedAddress');
							console.log(savedAddress);
							  res.render("user/userdeliveryaddress", { user: true, user_log: req.session.user, savedAddress })
						  })
					  })
				  }catch(err) {
					res.render("user/404");
				  }


				  try{
					  router.post("/userdeliveryaddress", (req, res) => {
						  console.log(req.body);
						  userHelper.userDeliveryAddress(req.body, req.session.user._id).then(() => {
							  res.redirect("/user-profile");
						  });
					  });
				  }catch(err) {
					res.render("user/404");
				  }

				// router.get('/cancelOrder/:id',verifyLogin, (req, res) => {
				//   userHelper.cancelOrder(req.params.id,req.session.user._id)
				//   res.redirect('/order')
				// })
				  try{

					  router.get("/cancelOrder/:id", (req, res) => {
						  userHelper.cancelOrder(req.params.id, req.session.user._id);
						  res.redirect("/order");
					  });
				  }catch(err) {
					res.render("user/404");
				  }

				//update Password
				try{
					let passwordchange = true;
					router.post("/updatePassword", verifyLogin, async (req, res) => {
						await userHelper
							.updatePassword(req.body, req.session.user._id)
							.then((passwordchange1) => {
								if (passwordchange1) {
									res.redirect("/userEditPassword");
								} else {
									console.log("rdiredcting");
									console.log(passwordchange1);
									passwordchange = passwordchange1;
									res.redirect("/userEditPassword");
								}
							});
					});
				}catch(err) {
					res.render("user/404");
				  }

				  try{

					  router.post("/check-coupon", async (req, res) => {
						  console.log('req.bodyyyy')
						  console.log(req.body)
						  let total = await userHelper.getTotalAmount(req.session.user._id);
	  
						  userHelper.checkCoupon(req.body, total, req.session.user._id).then((response) => {
							  console.log('responseeeeeeeeee')
							  console.log(response)
							  if (response.status) {
								  req.session.Total = response.totalAmount
								  res.redirect('/place-order')
							  } else {
								  res.redirect('/place-order')
							  }
						  });
					  });
				  }catch(err) {
					res.render("user/404");
				  }




				module.exports = router;
