var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
var authenticate = require('../models/authenticate');
const cors=require('./cors');

var router = express.Router();
router.use(bodyParser.json());

router.options('*',cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      return next(err);
    } else {
      res.statusCode = 200;
      res.setHeader('Content_type', 'application/json');
      res.json(users);
    }
  })
});

router.post('/signup', cors.corsWithOptions,(req, res, next) => {
  User.register(new User({
      username: req.body.username
    }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          err: err
        });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err, user) => {
          passport.authenticate('local')(req, res, () => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                err: err
              });
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              status: 'Registration Successful!'
            });
          });
        });
      }
    });
});

router.post('/login',cors.corsWithOptions, (req, res,next) => {

  
  passport.authenticate('local',(err,user,info)=>{
    if(err)
      return next(err);
    if(!user){
       res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: false,
    status: 'Login unsuccesful!',
    err:info
  });
    }
    req.logIn(user,(err)=>{
      if(err){
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.json({
          success: false,
          status: 'Login unsuccesful!',
          err:'Could not login user!'
    });
      }
    var token = authenticate.getToken({
      _id: req.user._id,
      firstname: req.user.firstname,
      lastname: req.user.lastname
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        status: 'You are successfully logged in!',
        token: token
    });

    });
  })(req,res,next);
  var token = authenticate.getToken({
    _id: req.user._id,
    firstname: req.user.firstname,
    lastname: req.user.lastname
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    status: 'You are successfully logged in!',
    token: token
  });
});


router.get('/logout', cors.corsWithOptions,(req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
});
router.get('/facebook/token',passport.authenticate('facebook-token'),
  (req,res)=>{
    if(req.user){
      var token=authenticate.getToken({_id:req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
    success: true,
    status: 'You are successfully logged in!',
    token: token
  });
    }

})
router.get('checkJWTToken',cors.corsWithOptions,(req,res)=>{
  passport.authenticate('jwt',{session:false},(err,user,info)=>{
  if(err)
    return next(err);
  if(!user){
    res.statusCode=401;
    res.setHeader=('Content-Type','application/json');
    return res.json({status:'JWT invalid',success:false,err:info});
  }
  else{
    res.statusCode=200;
    res.setHeader=('Content-Type','application/json');
    return res.json({status:'JWT valid',success:true,err:info});
  } 
  })
 
})
module.exports = router;