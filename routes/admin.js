var express = require("express");
var router = express.Router();

var productHelper = require("../helpers/product-helper");
var adminHelper = require("../helpers/admin-helper");
var categoryHelper = require("../helpers/category-helper");

// const { render } = require('../app');
const { response } = require("express");
const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

const app = express()


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

router.get("/admin-login",(req,res) => {
  if(req.session.admin){

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

router.get("/admin-logout",(req, res) => {
  // req.session.destroy()
  req.session.adminloggedIn = null;
  req.session.admin = null;
  res.redirect("/admin/admin-dash");
});

//Admin - pages

//Admin - dash

router.get("/admin-dash", verifyAdminLogin, function (req, res, next) {
  productHelper.getAllProducts().then((product) => {
    res.render("admin/admin-dash", { product,admin: true });
  });
});

// router.get("/admin-dash", (req, res) => {
//   res.render("admin/admin-dash", { admin: true });
// });

router.get("/products", (req, res) => {
  productHelper.getAllProducts().then((response) => {
    product = response.product
    res.render("admin/products", {admin:true, product });
  });
});

router.get("/view-product", function (req, res, next) {
  productHelper.getAllProducts().then((response) => {
    product = response.product
    res.render("admin/view-product", { admin:true,  product});
  });
  // res.send("sdfghjk")
});

router.get("/product-details", (req, res) => {
  res.render("admin/product-details", { admin: true });
});

//Add product details
router.get("/add-new-products", function (req, res, next) {
  res.render("admin/add-new-products", { admin: true });
});

router.get("/product-category", function (req, res, next) {
  res.render("admin/product-category", { admin: true });
});

router.get("/orders", (req, res) => {
  res.render("admin/orders", { admin: true });
});

// router.get("/add-product", function (req, res, next) {
//   res.render("admin/add-product", { admin: true });
// });


// router.post("/add-product", (req, res) => {


//   productHelper.addProduct(req.body, (insertedId) => {
//     let image = req.files.Image;
//     image.mv("./public/product-image/" + insertedId + ".jpg", (err, done) => {
//       if (!err) {
//         res.render("admin/add-product");
//       } else {
//       }
//     });
//   });
// });

//Add category
router.get("/product-category", function (req, res, next) {
  res.render("admin/product-category", { admin: true });
});

let fileStorageEnginecategory = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-image/category");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const uploads=multer({storage:fileStorageEnginecategory})


router.post("/product-category",uploads.array('Image',4),(req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  })

  req.body.image=filenames;

  categoryHelper.addCategory(req.body).then(() => {
    res.redirect('/admin/product-category')
  });
});

//Add product
router.get("/add-product", function (req, res, next) {
  res.render("admin/add-product", { admin: true });
});

let fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-image");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});
const upload=multer({storage:fileStorageEngine})


router.post("/add-product",upload.array('Image'),(req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  })

  req.body.image=filenames;

  productHelper.addProduct(req.body).then(() => {
    res.redirect('/admin/add-product')
  });
});



// edit Product details
router.get("/edit-product/:id", verifyAdminLogin, async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render("admin/edit-product", { product, admin: true });
});

let fileStorageEngines = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-image");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});




// router.post("/edit-product", uploaded.array('Image'),(req, res) => {
//   var filenames = req.files.map(function (file) {
//     return file.filename;
//   })

//   req.body.image=filenames;

//   productHelper.updateProduct(req.params.id,req.body).then(() => {
//     res.redirect('/admin/edit-product')
//   });
// });



router.post("/edit-product/:id", upload.array('Image'), (req, res) => {
    let insertedId = req.params.id;
    productHelper.updateProduct(req.params.id, req.body).then(() => {
        res.redirect("/admin/view-product");
        if (req.files?.Image) {
            let image = req.files?.Image;
            image.mv("./public/product-image/" + insertedId + ".jpg");
          }
        });
      });
      
      
      
      // Delete Product details
      router.get("/delete-product/:id", (req, res) => {
        let proId = req.params.id;
        productHelper.deleteProduct(proId).then((response) => {
          res.redirect("/admin/view-product");
        });
      });



      //Add User
      router.get("/add-user", verifyAdminLogin, function (req, res, next) {
        res.render("admin/add-user", {
          adminAddUserLoginError: req.session.adminAddUsrErr,
          admin: true,
        }); //adminloginpage:true
  req.session.adminAddUsrErr = false;
});

router.post("/admin-add-user", (req, res) => {
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
});

//List users
router.get("/list-user", verifyAdminLogin, (req, res) => {
  adminHelper.getAllUsers().then((listOfUsers) => {
    res.render("admin/list-user", { listOfUsers, admin: true });
  });
});

//Delete User
router.get("/delete-user/:id", (req, res) => {
  let usrId = req.params.id;

  req.session.loggedIn = null;
  req.session.user = null;
  adminHelper.deleteUser(usrId).then((response) => {
    res.redirect("/admin/list-user");
  });
});
//Edit User
router.get("/edit-user/:id", verifyAdminLogin, async (req, res) => {
  let usr = await adminHelper.getUserDetails(req.params.id);
  res.render("admin/edit-user", { usr, admin: true });
});

router.post("/edit-user/:id", async (req, res) => {
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
});

router.get("/user-manage", function (req, res, next) {
  adminHelper.getAllUsers().then((listOfUsers) => {
    res.render("admin/user-manage", { admin: true, listOfUsers });
  });
});

// --------------blocking of user---------------

router.get("/block/:id", (req, res) => {
  let usrId = req.params.id;

  adminHelper.blockUser(usrId).then(() => {
    req.session.user = null;
    req.session.loggedIn = null;

    res.redirect("/admin/user-manage");
  });
});

// -------------------unblocking of user----------------

router.get("/unblock/:id", (req, res) => {
  let usrId = req.params.id;
  adminHelper.unblocklUser(usrId).then(() => {
    res.redirect("/admin/user-manage");
  });
});


router.get("/order-summary",function (req, res) {
  res.render("admin/order-summary", { admin: true });
});



module.exports = router;
