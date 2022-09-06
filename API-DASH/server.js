// consists of secrey key 
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
var mysql = require('mysql');

var con = mysql.createConnection({

    host: "rms-rds-wordpress.cofzj8tutyxc.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "Dcse123#",
    database: "PV_solar_system",

});

const app = express();
const port = process.env.PORT || 4000;

const customers = [
  {
    name: "adnan",
    id: 1
  },
  {
    name: "amjid",
    id: 2
  },
  {
    name: "umair",
    id: 3
  }
];
// hard coded user details
const userData = {
  userId: "789789",
  name: "adi",
  username: "adi",
  password: "123",
  isAdmin: true
};

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});


// database queries 
app.get('/checkconn', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM sensor_data", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      return res.json({result});
    });
  }); 

});

app.post('/registor_admin', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  const sql = "INSERT INTO Admin (email, name, password) VALUES ?"; 
   var values = [
     [req.body.email, req.body.name, req.body.password]
   ];
  con.query(sql, [values] , function (err, result) {   
    if (err) throw err;
    console.log(result);
    return res.json({result});
    });

});

// add customer data
app.post('/customer/add', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  const sql_customer = "INSERT INTO customer (name, address, co_id, cnic, phone_no) VALUES ?";
  const sql_control_unit = "INSERT INTO control_unit (co_id, gps_location) VALUES ?";
  
  const customer_data =[
    [req.body.name, req.body.address, req.body.control_unit, req.body.cnic, req.body.phone]
  ];
  const control_unit_data = [
    [req.body.control_unit, req.body.location]
  ];
  console.log(customer_data);
  console.log(control_unit_data)

  con.query(sql_control_unit, [control_unit_data] , function (err, result) {   
    if (err)
    {
      return res.json({status: 0})
    }

    con.query(sql_customer, [customer_data] , function (err, result) {   
      if (err)
      {
        return res.json({status: 0})
      }

      return res.json({status: 1});
      });
    });

});

app.post('/customer/update', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  const id = req.body.id;
  console.log(id);
  const sql_customer = "UPDATE customer SET name=?, address=?, co_id=?, cnic=?, phone_no=? WHERE cu_id=?";
  const sql_control_unit = "UPDATE control_unit SET co_id=?, gps_location=? WHERE co_id=?";
  
    con.query(sql_customer,  [req.body.name, req.body.address, req.body.control_unit, req.body.cnic, req.body.phone, id] , function (err, result) {   
      if (err)
      {
        return res.json({status: 0})
      }
      console.log(result);

      return res.json({status: 1});
      });

});

// request handlers
app.get('/customers', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  con.query("SELECT * FROM customer", function (err, result, fields) {
    if (err) throw err;
    return res.json({result});
  }); 

});

// edit customer records
app.post('/customer/edit', (req, res) => {
  //if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  console.log(req.body.id);
  con.query("SELECT * FROM customer WHERE cu_id=?",[req.body.id], function (err, result, fields) {
    if (err) throw err;
    const data = JSON.parse(JSON.stringify(result));
    var mydata = result;
    

    con.query("SELECT * FROM control_unit WHERE co_id=?",[data[0]['co_id']], function (err, result, fields) {
      if (err) throw err;
      const newdata = JSON.parse(JSON.stringify(result));
      let gps_location = newdata[0]['gps_location'];

      return res.json({mydata, gps_location});
    });
  
  });


});



// validate the user credentials
app.post('/users/signin', function (req, res) {
  // query database
  const user = req.body.username;
  const pwd = req.body.password;

  con.query("SELECT * FROM Admin WHERE email=?",user, function (err, result) {
        if (err) throw err;

        var userdata = JSON.parse(JSON.stringify(result));
        console.log(user);
        console.log(userdata);

        const username = userdata[0]['email'];
        const password = userdata[0]['password'];

        // return 400 status if username/password is not exist
      if (!user || !pwd) {
        return res.status(400).json({
          error: true,
          message: "Username or Password required."
        });
      }

      // return 401 status if the credential is not match.
      if (user !== username || pwd !== password) {
        return res.status(401).json({
          error: true,
          message: "Username or Password is Wrong."
        });
      }

      // generate token
      const token = utils.generateToken(userData);
      // get basic user details
      const userObj = utils.getCleanUser(userData);
      // return the token along with user details
      const status = 1;
      return res.json({ user: userObj, token, status });
  });

});


// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the userId does not match.
    if (user.userId !== userData.userId) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

app.listen(port, () => {
  console.log('Server started on: ' + port);
});
