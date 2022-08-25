var express = require("express");
var router = express.Router();

var productHelper = require("../helpers/product-helper");
var adminHelper = require("../helpers/admin-helper");
var categoryHelper = require("../helpers/category-helper");
var userHelper = require("../helpers/user-helper");

// const { render } = require('../app');
const { response } = require("express");
const multer = require("multer");
// const upload = multer({ dest: 'uploads/' })

const app = express();

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    // res.render('admin/admin-login',{adminloginpage:true, adminErr:req.session.loginErr})
    res.render("admin/admin-login", { adminErr: req.session.loginErr });
    req.session.loginErr = false;
  }
};

/* GET admin home page. */
//Admin - signup

// router.get('/admin',verifyAdminLogin, function(req, res, next) {
//   res.redirect('/admin/admin-dash',{'loginErr':req.session.loginErr})
// });

router.get("/", verifyAdminLogin, (req, res) => {
    
    res.redirect("/admin/admin-login");
  
    // res.redirect('/')
    req.session.loginErr = false;
  
});


router.get("/admin-signup", (req, res, next) => {
     
      res.render("admin/admin-signup");
      // res.send("sdfghjk   ")
    
  });


  router.post("/admin-signup", (req, res) => {
        
        adminHelper.doAdminSignup(req.body).then(() => {
          res.redirect("/admin/admin-login");
        });
      
    });

//Admin - login

router.get("/admin-login", (req, res) => {
    
    if (req.session.admin) {
      res.render("admin/admin-login");
    }
    // res.send("sdfghjk   ")
  
});


router.post("/admin-login", (req, res) => {
      
      adminHelper.doAdminLogin(req.body).then((response) => {
        if (response.status) {
          req.session.adminloggedIn = true;
          req.session.admin = response.admin;
          res.redirect("/admin/admin-dash");
        } else {
          req.session.loginErr = "Invalid Admin name or Password";
          res.redirect("/admin/admin-login");
        }
      });
   
  });

//Admin - logout



router.get("/admin-logout", (req, res) => {
    try{
    // req.session.destroy()
    req.session.adminloggedIn = null;
    req.session.admin = null;
    res.redirect("/admin/admin-dash");
  }catch(err) {
    res.render("user/404");
  }
});

//Admin - dash



router.get("/admin-dash", verifyAdminLogin, function (req, res, next) {
   
    adminHelper.getAllOrders().then(async (order) => {
      let usr = await adminHelper.getUserDetails();
      let codTotal = await adminHelper.codTotal();
      let paypalTotal = await adminHelper.paypalTotal();
      let rasorpayTotal = await adminHelper.rasorpayTotal();
      console.log(order);
      res.render("admin/admin-dash", {
        order,
        usr,
        admin: true,
        codTotal,
        paypalTotal,
        rasorpayTotal,
      });
    });
  
});

// router.get("/admin-dash", (req, res) => {
//   res.render("admin/admin-dash", { admin: true });
// });

router.get('/pro-detail/:id',async(req,res)=>{
  let product = await adminHelper.getOrderProducts(req.params.id);
	let grandTotal =await adminHelper.orderGrandTotal(req.params.id);
  var discount =grandTotal[0].total - product[0].totalAmount
  res.render('admin/ordered-products-details',{ admin: true,product,grandTotal,discount })
})
 
router.get("/products", (req, res) => {
    
    productHelper.getAllProducts().then((response) => {
      product = response.product;
      res.render("admin/products", { admin: true, product });
    });
  
});



router.get("/view-product", function (req, res, next) {
      try{
      productHelper.getAllProducts().then((response) => {
        product = response.product;
        res.render("admin/view-product", { admin: true, product });
      });
      // res.send("sdfghjk")
    }catch(err) {
      res.render("user/404");
    }
  });



  
  router.get("/product-details", (req, res) => {
      try{
        res.render("admin/product-details", { admin: true });
      }catch(err) {
        res.render("user/404");
      }
    });

//Add product details

router.get("/add-new-products", function (req, res, next) {
    try{
    res.render("admin/add-new-products", { admin: true });
  }catch(err) {
    res.render("user/404");
  }
});



router.get("/product-category", function (req, res, next) {
      try{
      res.render("admin/product-category", { admin: true });
    }catch(err) {
      res.render("user/404");
    }
  });



  
  router.get("/orders", (req, res) => {
        try{
        adminHelper.salesDaily().then((data) => {
          // console.log(data);
          res.render("admin/orders", { admin: true });
        });
      }catch(err) {
        res.render("user/404");
      }
    });





//Add category

router.get("/product-category", function (req, res, next) {
    try{
    res.render("admin/product-category", { admin: true });
  }catch(err) {
    res.render("user/404");
  }
});


  
let fileStorageEnginecategory = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-image/category");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const uploads = multer({ storage: fileStorageEnginecategory });


router.post("/product-category", uploads.array("Image", 4), (req, res) => {
    try{
    var filenames = req.files.map(function (file) {
      return file.filename;
    });
  
    req.body.image = filenames;
    categoryHelper.addCategory(req.body).then(() => {
      res.redirect("/admin/product-category");
    });
  }catch(err) {
    res.render("user/404");
  }
});

//Add product

router.get("/add-product", function (req, res, next) {
    try{
    res.render("admin/add-product", { admin: true });
  }catch(err) {
    res.render("user/404");
  }
});


 

    let fileStorageEngine = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "./public/product-image");
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
      },
    });
 


  

      const upload = multer({ storage: fileStorageEngine });
      router.post("/add-product", upload.array("Image"), (req, res) => {
        var filenames = req.files.map(function (file) {
          return file.filename;
        });
        req.body.image = filenames;
        productHelper.addProduct(req.body).then(() => {
          res.redirect("/admin/add-product");
        });
      });
  






// edit Product details

router.get("/edit-product/:id", verifyAdminLogin, async (req, res) => {
    try{
    let product = await productHelper.getProductDetails(req.params.id);
    res.render("admin/edit-product", { product, admin: true });
  }catch(err) {
    res.render("user/404");
  }
});



try{
    let fileStorageEngines = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "./public/product-image");
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
      },
    });
  }catch(err) {
    res.render("user/404");
    }




    
//     router.post("/edit-product/:id", upload.array("Image"), (req, res) => {
//     try{
//     console.log(req.params);
//     let insertedId = req.params.id;
//     productHelper.updateProduct(req.params.id, req.body).then(() => {
//       res.redirect("/admin/view-product");
//       if (req.files?.Image) {
//         let image = req.files?.Image;
//         image.mv("./public/product-image/" + insertedId + ".jpg");
//       }
//     });
//   }catch(err) {
//     res.render("user/404");
//   }
// });

// Delete Product details

router.get("/delete-product/:id", (req, res) => {
    try{
    let proId = req.params.id;
    productHelper.deleteProduct(proId).then((response) => {
      res.redirect("/admin/view-product");
    });
  }catch(err) {
    res.render("user/404");
  }
});

//Add User

router.get("/add-user", verifyAdminLogin, function (req, res, next) {
    try{
    res.render("admin/add-user", {
      adminAddUserLoginError: req.session.adminAddUsrErr,
      admin: true,
    }); //adminloginpage:true
    req.session.adminAddUsrErr = false;
  }catch(err) {
    res.render("user/404");
  }
});



router.post("/admin-add-user", (req, res) => {
      try{
      adminHelper.doAdminCheckEmail(req.body).then((response) => {
        if (response.status) {
          adminHelper.doAdminAddUser(req.body).then((response) => {
            res.redirect("/admin/add-user");
          });
        } else {
          req.session.adminAddUsrErr = "Email already exist";
          res.redirect("/admin/add-user");
        }
      });
    }catch(err) {
      res.render("user/404");
    }
  });

//List users

router.get("/list-user", verifyAdminLogin, (req, res) => {
    try{
    adminHelper.getAllUsers().then((listOfUsers) => {
      res.render("admin/list-user", { listOfUsers, admin: true });
    });
  }catch(err) {
    res.render("user/404");
  }
});

//Delete User

router.get("/delete-user/:id", (req, res) => {
    try{
    let usrId = req.params.id;
  
    req.session.loggedIn = null;
    req.session.user = null;
    adminHelper.deleteUser(usrId).then((response) => {
      res.redirect("/admin/list-user");
    });
  }catch(err) {
    res.render("user/404");
  }
});

//Edit User

router.get("/edit-user/:id", verifyAdminLogin, async (req, res) => {
    try{
    let usr = await adminHelper.getUserDetails(req.params.id);
    res.render("admin/edit-user", { usr, admin: true });
  }catch(err) {
    res.render("user/404");
  }
});

router.post("/edit-user/:id", async (req, res) => {
      try{
      // let id=req.params.id
      if (req.body.Name == "" || req.body.Email == "") {
        let res_edituser = "Enter Name or Email";
        let editusr = true;
        let usr = await adminHelper.getUserDetails(req.params.id);
        res.render("admin/edit-user", { editusr, res_edituser, usr, admin: true });
        editusr = false;
      } else {
        req.session.user = req.body;
        adminHelper.editUserDetail(req.params.id, req.body).then(() => {
          res.redirect("/admin/list-user");
        });
      }
    }catch(err) {
      res.render("user/404");
    }
  });

  
  router.get("/user-manage", function (req, res, next) {
    try{
    adminHelper.getAllUsers().then((listOfUsers) => {
      res.render("admin/user-manage", { admin: true, listOfUsers });
    });
  }catch(err) {
    res.render("user/404");
  }
});

// --------------blocking of user---------------


router.get("/block/:id", (req, res) => {
    try{
    let usrId = req.params.id;
  
    adminHelper.blockUser(usrId).then(() => {
      req.session.user = null;
      req.session.loggedIn = null;
  
      res.redirect("/admin/user-manage");
    });
  }catch(err) {
    res.render("user/404");
  }
});

// -------------------unblocking of user----------------


router.get("/unblock/:id", (req, res) => {
    try{
    let usrId = req.params.id;
    adminHelper.unblocklUser(usrId).then(() => {
      res.redirect("/admin/user-manage");
    });
  }catch(err) {
    res.render("user/404");
  }
});



router.get("/order-summary", function (req, res) {
      try{
      res.render("admin/order-summary", { admin: true });
    }catch(err) {
      res.render("user/404");
    }
  });


  
  router.get("/cancel/:id", (req, res) => {
        try{
        adminHelper.cancelOrder(req.params.id).then(() => {
          res.redirect("/admin/admin-dash");
        });
      }catch(err) {
        res.render("user/404");
      }
    });


    
    router.get("/shipp/:id", (req, res) => {
          try{
          adminHelper.shippOrder(req.params.id).then(() => {
            res.redirect("/admin/admin-dash");
          });
        }catch(err) {
          res.render("user/404");
        }
      });


      
      router.get("/delivered/:id", (req, res) => {
            try{
            adminHelper.deliverOrder(req.params.id).then(() => {
              res.redirect("/admin/admin-dash");
            });
          }catch(err) {
            res.render("user/404");
          }
        });
          
//post changeStatus
router.post("/changeStatus/:id", async (req, res) => {
    try{
    // console.log(req.body.changeStatus + "     order id is     " + req.params.id);
  
    await adminHelper
      .updateStatus(req.body.changeStatus, req.params.id)
      .then(() => {
        res.redirect("admin/admin-dash");
      });
    }catch(err) {
      res.render("user/404");
    }
  });


  
  router.get("/", verifyAdminLogin, async function (req, res, next) {
    try{
    let totalOrders = await adminHelper.allOrders();
    totalOrders = totalOrders.length;
    let user = await userHelper.getAllUsers();
    user = user.length;
    let products = await productHelper.getAllProduct();
    products = products.length;
    let cod = await adminHelper.codTotal();
    let paypal = await adminHelper.paypalTotal();
    let rasor = await adminHelper.rasorpayTotal();
    let sales = cod + paypal + rasor;
    // console.log("printing cod   " + cod);
    res.render("admin/adminhome", {
      totalOrders,
      user,
      products,
      cod,
      rasor,
      paypal,
      sales,
    });
  }catch(err) {
    res.render("user/404");
  }
});




router.get("/coupon", (req, res) => {
    try{
    adminHelper.getCoupons().then((coupons) => {
      res.render("admin/coupon", { admin: true , coupons});
    })
  }catch(err) {
    res.render("user/404");
  }
});



  
  router.post("/coupon", (req, res) => {

      try{

      req.body.users = [];

      adminHelper.addCoupon(req.body).then((response) => {

        // console.log(response);
    
        res.redirect("/admin/coupon");
      });

    }catch(err) {

      res.render("user/404");
    }

  });


    
    router.get("/banner-management", function (req, res, next) {

        try{

        res.render("admin/banner-management", { admin: true });

      }catch(err) {

        res.render("user/404");

      }

    });

  


module.exports = router;
