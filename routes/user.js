const { response } = require('express');

var express = require('express');
var router = express.Router();
var MongoClient=require('mongodb').MongoClient
var objectId=require('mongodb').ObjectId

const productHelper=require('../helpers/product-helper')
const userHelper=require('../helpers/user-helper')

let user
const verifyLogin = (req,res,next)=>{
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.render('user/user-login', {loginErr:req.session.loginErr})
    req.session.loginErr=false
  }
}

/* GET user homepage. */



//verify login

router.get('/',async function(req, res, next) {
  let user=req.session.user
   let cartCount=null
   if(req.session.user){
     let cartCount=await userHelper.getCartCount(req.session.user._id)
     productHelper.getAllProducts().then((response)=>{
      
      product = response.product
      women = response.women
      men = response.men

      res.render('user/home-one',{product,women,men,user,user_log:req.session.user,cartCount});
      // res.render('user/home-one',{product,women,men,user,user:req.session.user,cartCount});
    })
    }else{

      productHelper.getAllProducts().then((response)=>{
        
        product = response.product
        women = response.women
        men = response.men

        res.render('user/home-one',{product,women,men,admin:false,user:true,cartCount});
      })
    }
    
   
  
});




//signup
router.get('/user-signup', (req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/user-signup')
  }
})



router.post('/user-signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    req.session.user=response
    req.session.userloggedIn=true
    if (response.status) {
      res.redirect('/user-signup')
    } else {
      user = response.userData
      res.render('user/otp-verify')
    }
  })
  
  // res.redirect('user/user-signup')
})

//otp
// router.get('/otp-verify', function(req, res, next) {
//   res.render('user/otp-verify',{user:true});
// });

router.post('/otp-verify',(req,res)=>{
  userHelper.signupOtp(req.body,user).then((response)=>{req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')
  })
  
  // res.redirect('user/user-signup')
})


//login
router.get('/user-login',(req, res,) =>{
  if(req.session.userloggedIn){
    res.redirect('/')
  }else
  res.render('user/user-login',{'loginErr':req.session.userloginErr})
  req.session.userloginErr=false
});

router.post('/user-login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }else{
      req.session.userloginErr="Invalid Username or Password"
      res.redirect('/user-login') 
    }
  })
})


//logout

router.get('/user-logout',(req,res)=>{
  // req.session.destroy()
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')

})


//user profile
router.get('/user-profile',function(req, res, next) {
  res.render('user/user-profile',{user,user:req.session,});
});

//home one
router.get('/home-one', function(req, res, next) {
  res.render('user/home-one',{user,user:req.session,});
});

//select product
router.get('/select-product/:id',async(req, res, next)=> {
let product =await productHelper.getProductDetails(req.params.id)
  res.render('user/select-product',{product,user,user:req.session});
});



//user cartclscls
router.get('/cart',verifyLogin,async( req,res)=>{
  let product=await userHelper.getCartProducts(req.session.user._id)
  let user=req.session.user
  let totalValue=0
  if(product.length>=1){
  user=req.session.user._id
    totalValue=await userHelper.getTotalAmount(req.session.user._id)
    console.log('total:'+ totalValue);
    let cartCount=await userHelper.getCartCount(req.session.user._id)
    res.render('user/cart',{product,totalValue,user:true,user,user_log:req.session.user,cartCount})
    // res.render('user/cart',{product,totalValue,user:true,user,user:req.session.user,cartCount})
  }else{
    let user=req.session.user._id
    res.render('user/cart',{product,totalValue,user_log:req.session.user,user:true})
    // res.render('user/cart',{product,totalValue,user:req.session.user,user:true})
  }
})

// add to cart
router.get('/add-to-cart/:id',(req,res)=>{
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
    // res.redirect('/')
  })
})

router.post('/change-product-quantity',(req,res)=>{
  userHelper.changeProductQuantity(req.body).then(async (response)=>{

    response.total=await userHelper.getTotalAmount(req.body.user)
    res.json (response)
  })
})


  
//remove product
router.post('/remove-product',(req,res)=>{
userHelper.removeCartProduct(req.body).then(async (response)=>{  
  // response.total=await userHelper.getTotalAmount(req.body.user)

res.json(response)
})
})
 

//place order
router.get('/place-order',verifyLogin,async function(req, res) {
  let total =await userHelper.getTotalAmount(req.session.user._id)
  console.log(req.session.user)
  res.render('user/place-order',{user:true,total,user:req.session.user});
});

router.post('/place-order',async(req,res)=>{
console.log('jjjjjt');
  console.log(req.body);

  let product=await userHelper.getCartProductList (req.body.userId)
  let totalPrice=await userHelper.getTotalAmount(req.body.userId)
  console.log(product,totalPrice);
  userHelper.placeOrder(req.body,product,totalPrice).then((orderId)=>{

    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      let id=objectId(orderId)
      userHelper.generateRazorPay(id,totalPrice).then((response)=>{
        console.log(id,totalPrice);
res.json(response)
      })
    }
  })
})


//order success
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:true,user:req.session.user})
})


//orders
router.get('/order',async(req,res)=>{
  let order=await userHelper.getUserOrder(req.session.user._id)
  res.render('user/order',{user:true,user:req.session.user,order})

})

// router.get('/view-order-product',async(req,res)=>{
//   let product=await userHelper.getOrderProduct(req.params.id)
//   res.render('user/view-order-product',{user:true,user:req.session.user,product})
// })

//view-order-product
router.get('/view-order-product',(req,res)=>{
  res.render('user/view-order-product',{user:true,user:req.session.user})
})


router.post('/verify-payment',(req,res)=> {
  userHelper.verifyPayment(req.body).then(()=>{
     userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true })
     })
  }).catch((err)=>{
    res.json({status:false,errMsg:''})
  })
})




router.get('/wishlist',(req,res)=>{
  res.render('user/wishlist')
})

2


module.exports =router;
