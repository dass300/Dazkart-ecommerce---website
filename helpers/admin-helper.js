			var db = require('../config/connection')
			var collection = require('../config/collection')
			const bcrypt = require('bcrypt')
			var objectId = require('mongodb').ObjectId
			const { response } = require('../app')



			module.exports = {
				
				
				doAdminLogin: (adminData) => {
					return new Promise(async (resolve, reject) => {
						let loginStatus = false
						let response = {}
						let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
						bcrypt.compare(adminData.Password,admin.Password).then((status) => {
							if (status) {
								response.adminIn = admin;

								response.status = true
								resolve(response)


							} else {
								resolve({ status: false })

							}
						})


					})
				},
				doAdminSignup: (adminData) => {
					return new Promise(async (resolve, reject) => {
						adminData.Password = await bcrypt.hash(adminData.Password, 10)
						db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then(() => {
							resolve(adminData)
						})
					})

				},
				doAdminAddUser: (userData) => {
					return new Promise(async (resolve, reject) => {
						let response = {}
						if (userData.Name == '' || userData.Email == '' || userData.Password == '') {
							response.status = false
							resolve(response)
						} else {
							userData.Password = await bcrypt.hash(userData.Password, 10)
							db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
								response.status = true;
								response.userData = userData;
								resolve(response)
							})
						}
					})
				},
				getAllUsers: () => {
					return new Promise(async (resolve, reject) => {
						let listOfUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
						resolve(listOfUsers)
					})
				},
				deleteUser: (usrId) => {
					return new Promise((resolve, reject) => {
						db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(usrId) }).then((response) => {
							resolve(response)
						})
					})
				},
				getUserDetails: (usrId) => {
					return new Promise((resolve, reject) => {
						db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(usrId) }).then((response) => {
							resolve(response)

						})
					})
				},
				editUserDetail: (usrId, usrDetails) => {

					return new Promise(async (resolve, reject) => {
						let pass;
						if (usrDetails.Password == '') {
							let passw = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(usrId) })
							pass = passw.Password
						} else {
							usrDetails.Password = await bcrypt.hash(usrDetails.Password, 10)
							pass = usrDetails.Password
						}
						db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId) }, {
							$set: {
								Name: usrDetails.Name,
								Email: usrDetails.Email,
								Password: pass
							}
						}).then((response) => {
							resolve()
						})
					})
				},
				doAdminCheckEmail: (adminData) => {
					return new Promise(async (resolve, reject) => {
						let response = {}
						let emailfromdb = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: adminData.Email })
						if (!emailfromdb) {
							response.status = true;
							resolve(response)
						} else {
							resolve({ status: false })
						}
					})
				},
				blockUser: (usrId, usrDetail) => {

					return new Promise((resolve, reject) => {


						db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId, usrDetail) },

							{
								$set: {

									status: false
								}
							})

						resolve()

					})

				},

				unblocklUser: (usrId, usrDetail) => {

					return new Promise((resolve, reject) => {

						db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(usrId, usrDetail) },
							{
								$set: {
									status: true
								}
							}
						)

						resolve()
					})

				},
				cancelOrder: (orderId) => {

					return new Promise((resolve, reject) => {

						db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
							{
								$set: {
									status: "Canceled",
									cancel: true,
								}

							}).then((response) => {

								console.log(response.status);

								resolve()
							})


					})

				},

				shippOrder: (orderId) => {

					return new Promise((resolve, reject) => {

						db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
							{
								$set: {
									status: "Shipped",
									shipp: true,
									cancel: null,


								}

							}).then((response) => {

								console.log(response.status);

								resolve()
							})


					})

				},

				deliverOrder: (orderId) => {

					return new Promise((resolve, reject) => {

						db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
							{
								$set: {
									status: "Delivered",
									delivered: true,
									cancel: true,
									return: true
								}

							}).then((response) => {

								console.log(response.status);

								resolve()
							})


					})

				},
				updateStatus: (changeStatus, orderId) => {
					return new Promise(async (resolve, reject) => {
						if (changeStatus == 'cancelled') {
							await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {

								$set: {
									status: changeStatus,
									cancelStatus: true


								}
							})

						}
						else {
							await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, {

								$set: {
									status: changeStatus



								}
							})
						}
					}).then((response) => {

					})
					resolve(response)
				},
				codTotal: () => {
					return new Promise(async (resolve, reject) => {
						var codtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

							{
								$match:{ paymentMethod: "COD" }
							},
							{
								$unwind: '$product'
							},
							{
								$group: {
									_id: null,
									total: { $sum: {$toInt:'$totalAmount'} },
								}
							},	
						]).toArray()
						console.log('codtotal');
						console.log(codtotal);
						resolve(codtotal[0])
					})
				},

				paypalTotal: () => {
					return new Promise(async (resolve, reject) => {
						var paypalTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

							{
								$match: { paymentMethod: "PAYPAL" }
							},
							{
								$unwind: '$product'
							},
							{
								$group: {
									_id: null,
									total: { $sum: {$toInt:'$totalAmount'} },
								}
							},
						]).toArray()
						console.log('paypalTotal');
						console.log(paypalTotal);
						resolve(paypalTotal[0])
					})
				},


				rasorpayTotal: () => {
					return new Promise(async (resolve, reject) => {
						var rasorpayTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
							{
								$match: { paymentMethod: "RAZORPAY" }
							},
							{
								$unwind: '$product'
							},
							{
								$group: {
									_id: null,
									total: { $sum: {$toInt:'$totalAmount'} },
								}
							},
						]).toArray()
						console.log('rasorpayTotal');
						console.log(rasorpayTotal);
						resolve(rasorpayTotal[0])
					})
				},


				getAllOrders: () => {
					return new Promise(async (resolve, reject) => {

						let order = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
						// console.log(order);
						resolve(order)
					})

				},
				salesDaily: () => {

					return new Promise(async (resolve, reject) => {

						let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
							{

								$unwind:'$product'

							},

						
							{
								$lookup:
								{
									from: collection.PRODUCT_COLLECTION,
									localField: 'item',
									foreignField: '_id',
									as: 'product'
								}
							},

							{
								$unwind: '$product'
							},

							{
								$project:
								{
									totalAmount: 1, date: 1, quantity: 1, product: '$product.Name', Price: '$product.Price'
								}
							},

							{
								$group: {
									_id: { day: { $dayOfMonth: '$date' }, month: { $month: '$date' }, year: { $year: '$date' }, product: '$product', price: '$Price' },


									total: { $sum: { $multiply: ['$totalAmount', '$quantity'] } }, quantity: { $count: {} }
								}
							},
							{
								$sort: { '_id.day': 1 }
							}


						]).toArray()


						console.log('dailydataaaaaaaaaaaa');

						console.log(data);

						resolve(data)
					})
					
				},
				getCoupons: ()=>{
					return new Promise((resolve, reject)=>{
						db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response)=>{
							resolve(response)
						})
					})
				},
				addCoupon:(coupon) =>{
					return new Promise(async (resolve, reject) => {
						coupon.discount = parseInt(coupon.discount)
						db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response) => {
							resolve(response)
						})
					})
				},
			
      getOrderSingleProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {

      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: { _id: objectId(orderId) }
        },

        {
          $unwind: '$product'
        },


        {
          $project:
          {
            item: '$product.item',
            quantity: '$product.quantity',
            userId:1,
			paymentMethod:1,
            totalAmount: 1,
            deliveryDetails: 1,
            date: 1,
            status: 1

          }
        },

        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,

            localField: 'item',
            foreignField: '_id',
            as: 'product'

          }

        },
		{
			$lookup:
			{
			  from: collection.USER_COLLECTION,
			  localField:'userId',
			  foreignField: '_id',
			  as: 'user'
  
			}
  
		  },

        // {
        //   $lookup:
        //   {
        //     from: collection.BRAND_COLLECTION,
        //     localField: 'product.Brand',
        //     foreignField: '_id',
        //     as: 'brand'
        //   }
        // },

        // {
        //   $unwind: '$brand'
        // },
        {
          $lookup:
          {
            from: collection.ADDRESS_COLLECTION,
            localField: 'deliveryDetails',
            foreignField: '_id',
            as: 'address'
          }
        },

        {
          $unwind: '$deliveryDetails.address'
        },
		

        {
          $project:
          {
            totalAmount: 1,
           deliveryDetails:1,
           date: 1,
		   paymentMethod:1,
            status: 1,
			user:{$arrayElemAt:['$user.Name',0]},
			//user:'$user',
            //brand: '$brand.Brand',
        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },

          }
        },

        {

          $project:
          {
			quantity: 1,
			user:1,
            totalAmount: 1,
            deliveryDetails: 1,
            date: 1,
            status: 1,
			paymentMethod:1,
            brand: 1,
            item: 1, quantity: 1, product: 1,
            discount: {
              $cond: {
                if: '$product.productoffer', then: '$product.productdiscount',
                else: {
                  $cond: { if: '$product.offer', then: '$product.categoryDiscount', else: 0 }
                }
              }
            },

            actualPrice: {
              $cond: {
                if: '$product.productoffer', then: '$product.productdiscountprice',
                else: {
                  $cond: { if: '$product.offer', then: '$product.discountPrice', else: '$product.Price' }
                }
              }
            }
          }

        },



        {

          $project:
          {

            totalAmount: 1,
            deliveryDetails: 1,
user:1,
paymentMethod:1,
            status: 1,
            brand: 1,
            item: 1, quantity: 1, product: 1,
            // discount: { $multiply: ['$quantity', '$discount'] },
            // actualPrice: { $multiply: [{ $toInt: '$actualPrice' }, '$quantity'] },
             tPrice: { $multiply: [{ $toInt: '$product.Price' }, '$quantity'] },

            // date: {
            //   $dateToString: {
            //     date: '$date',
            //     format: '%d-%m-%Y %H:%M:%S'
            //   }
            //}


          }

        }

      ]).toArray()


      console.log('singlleeeeeeeeee');
      console.log(orderItems);
      resolve(orderItems)
    })
  },
  getOrderProducts: (orderId) => {
	console.log('orderId');
	console.log(orderId);
	return new Promise(async (resolve, reject) => {
		let orderItems = await db
			.get()
			.collection(collection.ORDER_COLLECTION)
			.aggregate([
				{
					$match: { _id:objectId(orderId) },
				},
				{
					$unwind: "$product",
				},
				{
					$project: {
						item: "$product.item",
						quantity: "$product.quantity",
						Address: "$deliveryDetails",
						paymentMethod: "$paymentMethod",
						status: "$status",
						date: "$date",
						id: "$_id",
						userId:1,
						totalAmount:1,
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
					$lookup: {
						from: collection.USER_COLLECTION,
						localField: "userId",
						foreignField: "_id",
						as: "user",
					},
				},

				{
					$project: {
						paymentMethod:1,
						status:1,
						date:1,
						id:1,
						totalAmount:1,
						item: 1,
						quantity: 1,
						Address:1,
						user: "$user.Name",
						product: { $arrayElemAt: ["$product", 0] },
					},
				},
				
				{
					$project:{
						grand:1,
						product:1,
						paymentMethod:1,
						status:1,
						totalAmount:1,
						date:1,
						id:1,
						item: 1,
						quantity: 1,
						Address:1,
						user:1,
						total: {
							$sum: {
								$multiply: ["$quantity", { $toInt: "$product.Price" }],
							},
						},
					}
				}
			])
			.toArray();
		// resolve(cartItems);
		console.log("printng get order producta resolve user helper");
		console.log(orderItems);
		resolve(orderItems);
	});
},
orderGrandTotal: (orderId) => {
	console.log('orderId');
	console.log(orderId);
	return new Promise(async (resolve, reject) => {
		let orderItems = await db
			.get()
			.collection(collection.ORDER_COLLECTION)
			.aggregate([
				{
					$match: { _id:objectId(orderId) },
				},
				{
					$unwind: "$product",
				},
				{
					$project: {
						item: "$product.item",
						quantity: "$product.quantity",
						Address: "$deliveryDetails",
						paymentMethod: "$paymentMethod",
						status: "$status",
						date: "$date",
						id: "$_id",
						userId:1,
						totalAmount:1,
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
						totalAmount:1,
						quantity: 1,
						product: { $arrayElemAt: ["$product", 0] },
					},
				},
				
				{
					$group:{
						_id: null,
						total: {
							$sum: {
								$multiply: ["$quantity", { $toInt: "$product.Price" }],
							},
						},
					}
				}
			])
			.toArray();
		// resolve(cartItems);
		console.log("printng get order producta resolve user helper");
		console.log(orderItems);
		resolve(orderItems);
	});
},


}