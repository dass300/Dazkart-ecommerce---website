var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt =require('bcrypt')
var objectId=require('mongodb').ObjectId
const { response } = require('../app')



module.exports={
doAdminLogin:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
         bcrypt.compare(adminData.Password,admin. Password).then((status)=>{
            if(status){
                response.adminIn = admin;
    
                response.status=true
              resolve(response)
    
    
            }else{
                resolve({status:false})
    
            }
        })
       
        
    })
},
doAdminSignup:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        adminData.Password=await bcrypt.hash(adminData.Password,10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then(()=>{
            resolve(adminData)
        })
    })

},
doAdminAddUser: (userData)=>{
    return new Promise (async (resolve,reject)=>{
        let response ={}
        if(userData.Name =='' || userData.Email=='' || userData.Password == '' ){
            response.status=false
            resolve(response)
        }else{
                userData.Password=await bcrypt.hash(userData.Password,10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{  
                    response.status=true;
                    response.userData = userData;
                    resolve(response)
                })
        }
    })
},
getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let listOfUsers = await db.get().collection(collection.USER_COLLECTION).find().toArray()
        resolve(listOfUsers)
    })
},
deleteUser:(usrId)=>{
    return new Promise ((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectId(usrId)}).then((response)=>{
            resolve(response)
        })
    })
},
getUserDetails:(usrId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(usrId)}).then((response)=>{
            resolve(response)
             
        })
    }) 
},
editUserDetail:(usrId, usrDetails)=>{
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
doAdminCheckEmail:(adminData)=>{
    return new Promise(async (resolve,reject)=>{
        let response = {}
        let emailfromdb = await db.get().collection(collection.USER_COLLECTION).findOne({Email:adminData.Email})
        if(!emailfromdb){
                response.status=true;
                resolve(response)
        }else{
            resolve({status:false})
        }
    })
},
blockUser:(usrId, usrDetail)=>{
     
    return new Promise ((resolve,reject)=>{
    

        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(usrId, usrDetail)},
        
        {$set:{

            status:false
        }})

        resolve()

    })

  },

  unblocklUser: (usrId, usrDetail)=>{

    return new Promise((resolve,reject)=>{

        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(usrId, usrDetail)},
        {$set:{
            status:true
        }}
        )

        resolve()
    })

  }



} 