var db=require('../config/connection')
var collection=require('../config/collection');
const { response } = require('express');
var objectId=require('mongodb').ObjectId

module.exports={
    addCategory:(category)=>{
        return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
            resolve()
        })
        })
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection( collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        
        })

    },

 
    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
              resolve(response)
            })
        })

    },
    getProductDetails:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)}).then((category)=>{
                resolve(category) 
            })
        })
    },

      updateCategory:(catId,catDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:objectId(catId)},{
                $set:{
                    Name:catDetails.Name,
                    Description:catDetails.Description,
                    price:catDetails.Price,
                    Category:catDetails.Category
                }
            }).then((response)=>{
                 resolve()
            })
        })
      }
}