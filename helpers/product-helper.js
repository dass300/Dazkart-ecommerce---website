var db=require('../config/connection')
var collection=require('../config/collection');
const { response } = require('express');
var objectId=require('mongodb').ObjectId
 module.exports={
    addProduct:(product)=>{
        return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            resolve()
        })
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            response.product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            response.women =await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"women"}).toArray()
            response.men =await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"men"}).toArray()
            resolve(response)
        
        })

   
    },
 
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
              resolve(response)
            })
        })

    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product) 
            })
        })
    },
      updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                 resolve()
            })
        })
      }
}