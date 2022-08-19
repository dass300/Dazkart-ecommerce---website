var db = require('../config/connection')
var collection = require('../config/collection');
const { response } = require('express');
var objectId = require('mongodb').ObjectId
module.exports = {
    addProduct: (product) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve()
            })
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            response.product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            response.women = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: "women" }).toArray()
            response.men = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: "men" }).toArray()
            resolve(response)

        })


    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })

    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },
    getOrderProducts: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            // resolve(cartItems);
            console.log('printng get order producta resolve user helper');
            console.log(orderItems);
            resolve(orderItems)
        })
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Name: proDetails.Name,
                        Category: proDetails.Category,
                        Price: proDetails.Price,
                        Description: proDetails.Description,

                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    getAllBanner:()=>{
       
        return new Promise(async(resolve,reject)=>{
          
      let banner =await db.get().collection(collection.BANNER_COLLECTION).aggregate([
         {
           $lookup:
           {
             from:collection.BRAND_COLLECTION,
             localField:'Brand',
             foreignField:'_id',
             as:'brand'
           }
         },
         {
           $unwind:'$brand'
         }
      ]).toArray()
           
      console.log('Bannerrrrrrrrrr');
      console.log(banner);
         
           resolve(banner)
        })
     }
}