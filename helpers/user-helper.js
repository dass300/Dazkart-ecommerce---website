var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt =require('bcrypt')
var objectId=require('mongodb').ObjectId
const { response } = require('../app')

const accountSid = 'ACfedc8fa3b05bdd9560e1c41bf1bba388'; 
const authToken = '578840578749896b6974807faa9279cc'; 
const client = require('twilio')(accountSid, authToken); 
const Razorpay = require('razorpay');
const { json } = require('express')
const { ObjectID } = require('bson')

var instance = new Razorpay({
  key_id: 'rzp_test_zginGQrlDjXy7d',
  key_secret: 'URlsfCf9N3d6scwbEVFBQuW7',
});
module.exports={

    // doSignup:(userData)=>{
    //     return new Promise(async(resolve,reject)=>{
    //        bcrypt.hash(userData.password,10)
    //        let response ={}
    //        let userExist=await

    //        db.get().collection(collection.USER_COLLECTION).findOne({phone:userData.phone})
    //        if(userExist){
    //         response.status='userExist'
    //         response.doSignupStatus=false
    //         resolve(response)
    //        }
    //        else{
    //         userData.blockStatus=true
    //         bcrypt.hash(userData.password,10)
    //         response.status=true
    //         response=userData
    //        }

    //     client.verify
    //       .services('VA47f3ff62b318d775d3b4b81c2449fa87')
    //       .verifications.create({
    //         // to: `+91${signupData.mobile}`,
    //         to: '+918921653181',
    //         channel: 'sms',
    //       })
    //       .then((data) => {
          
    //         res.status(200).send(data)
    //       })


    //         //  userData.Password=await bcrypt.hash(userData.Password,10)
    //         // db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
    //         //     resolve(data)
    //         //     // resolve(userData.ops[0])
    //         // })
        

    //     })
        
    // },
    doSignup: (userData) => {
        return new Promise(async (resolve,reject) => {
            let response = {}
            let phone = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userData.mobile})

            if (phone) {
                response.status=true
                resolve(response)

            } else {
                userData.Password = await bcrypt.hash(userData.Password, 10)
                userData.action = true
                client.verify.services('VA47f3ff62b318d775d3b4b81c2449fa87')
          .verifications.create({
            // to: `+91${signupData.mobile}`,
            to: '+918921653181',
            channel: 'sms',
          })
          .then(verification =>console.log(verification.status));
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
                    if (verification_check.status == 'approved') {
                        db.get().collection(collection.USER_COLLECTION).insertOne(userDetails).then((data) => {
                            resolve(userDetails)
                        })
                    } else {
                        response.err = 'otp is invalid';
                        resolve(response)
                    }
                })
        })
    },


    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{ 
                        resolve({status:false})
                    }
                })


            }else{
                resolve({status:false})

            }
            
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                let proExist=userCart.product.findIndex(product=> product.item===proId)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'product.item':objectId(proId)},
                    
                    {
                        $inc:{'product.$.quantity':1}
                    }
                      ).then(()=>{
                        resolve()
                      })
                }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
            {
            
                    $push:{product:proObj}
                
                
            }
                ).then((response)=>{
                    resolve()
                })
            }
            }else{
                let cartObj={
                    user:objectId(userId),
                    product:[proObj]

                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
               {
                $match:{user:objectId(userId)}
               },
               {
                $unwind:'$product'
               },
               {
                $project:{
                    item:'$product.item',
                    quantity:'$product.quantity'

                }
               },
               {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
               },
               {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
               }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart){
                count=cart.product.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
       details.count=parseInt(details.count)
       details.quantity=parseInt(details.quantity)

        return new Promise((resolve,reject)=>{
            if(details.count ==-1 && details.quantity ==1){

                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
            {
                $pull:{product:{item:objectId(details.product)}}
                
            }
            
              ).then((response)=>{
                resolve({removeProduct:true})
              })
        
     
        }else{
                        db.get().collection(collection.CART_COLLECTION)
                        .updateOne({_id:objectId(details.cart),'product.item':objectId(details.product)},
                {
                    $inc:{'product.$.quantity':details.count}
                }
                    ).then((response)=>{
                        resolve({status:true})

                    })
                }
                })
        },

    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user:objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                        quantity: '$product.quantity'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product:{$arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.price'}]}}
                    }
                }
            ]).toArray()   
                    
            resolve(total[0].total)
        })
    },
    placeOrder:(order,product,total)=>{
        return new Promise((resolve,reject)=>{
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
               deliveryDetails:{
                mobile:order.Mobile,
                address:order.address,
                pincode:order.pincode
               },
               userId:objectId(order.userId),
               paymentMethod:order['payment-method'],
               product:product,
               totalAmount:total,
               status:status,
               date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).remove({user:objectId(order.userId)})
                resolve()
            })
        })
    },
    getCartProductsList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.product)
        })
    

},

removeCartProduct:(details) => {
    return new Promise((resolve,reject) => {
    db.get().collection(collection.CART_COLLECTION)
    .updateOne({ _id: objectId(details.cart)},
        {
            $pull:{ product: { item: objectId(details.product) } }
        }
    ).then((response) => {
        resolve({ removeProduct: true })
    })
})
},

getTotalAmount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
            
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
           {
            $match:{user:objectId(userId)}
           },
           {
            $unwind:'$product'
           },
           {
            $project:{
                item:'$product.item',
                quantity:'$product.quantity'

            }
           },
           {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
           },
           {
            $project:{
                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
           },
           {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:[{$toInt:'$quantity'},{$toInt:'$product.Price'}]}},
                }
            }
        ]).toArray()
        console.log('hhhhhh');
        console.log(total[0].total);
        resolve(total[0].total)
    })
},
 placeOrder:(order,product,total)=>{
    return new Promise ((resolve,reject)=>{
        console.log(order,product,total);
        let status=order['pament-method']==='COD'?'placed':'pending'
        let orderObj={
            deliveryDetails:{
                mobile:order.mobile,
                address:order.address,
                pincode:order.pincode
            },
            userId:objectId(order.userId),
            paymentMethod:order['payment-method'],
            product:product,
            totalAmount:total,
            status:status,
            date:new Date(),
            // address:ObjectID(order.address),
        }
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
            resolve(response.insertedId)
        })

    })

},
getCartProductList:(userId)=>{
    console.log(userId);
    return new Promise(async(resolve,reject)=>{
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        // response(cart.product)
        console.log(cart);
        resolve(cart.product)
    })
},
getUserOrder:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let order=await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).toArray()

        resolve(order)
    })
},
getOrderProduct:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            console.log(orderItems),
            {
                $match:{_id:objectId(orderId)}
            },
            {
                $unwind:'$product'
            },
            {
                $project:{
                    item:'$product.item',
                    quantity:'$product.quantity'
                }
            }
        ])
    })
},
generateRazorPay:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
        var instance = new Razorpay({ key_id: 'rzp_test_zginGQrlDjXy7d', key_secret: 'URlsfCf9N3d6scwbEVFBQuW7' })
        instance.orders.create({  
            amount: total*100,  
            currency: "INR",  
            // receipt: "" + orderId,
            receipt: "" + objectId(orderId),
        }).then((data)=>{
            resolve(data)
            console.log(data);
        }).catch((error)=>{
            
        })




    })
},
verifyPayment:(details)=>{ 
    return new Promise((resolve,reject)=>{
        const crypto=require('crypto')
        let hmac=crypto.createHmac('sha256','URlsfCf9N3d6scwbEVFBQuW7')
        
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){

            resolve()
        }else{
            reject()
        }
    })
},changePaymentStatus:(orderId)=>{
    return new promises((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'placed'
            }
        }
        ).then(()=>{
             resolve()
        })
    })
},
generatePaypal:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/success"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "product",
                        "sku": "item",
                        "price": total,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "INR",
                    "total": total
                },
                "description": "This is the payment description."
            }]
        };
         
        paypal.payment.create(create_payment_json, function (error, payment) {
        
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                console.log(payment);
                resolve(payment)
            }
        });
        
    })
}
 


}