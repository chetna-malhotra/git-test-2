var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('./users');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt=require('passport-jwt').ExtractJwt;
var jwt=require('jsonwebtoken');

var config=require('../routes/config.js');
exports.local=passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken=function(user){
    return jwt.sign(user,config.secretKey,{expiresIn:3600});
};

var opts={};
opts.jwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey=config.secretKey;
exports.jwtPassport=passport.use(new JwtStrategy(opts,
    (jwt_payload,done)=>{
        console.log('JWT PAYLOAD :',jwt_payload);
        User.findOne({_id:jwt_payload._id},(err,user)=>{
            if(err){
                return done(err,false);

            }
            else if (user)
            {
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        });
    }));
exports.verifyUser=passport.authenticate('jwt',{session:false});



eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjE4N2JiM2QyMTgzMTMyNDhkYjA3YTIiLCJmaXJzdG5hbWUiOiIiLCJsYXN0bmFtZSI6IiIsImlhdCI6MTU5NTQ0MDQ2NCwiZXhwIjoxNTk1NDQ0MDY0fQ.sHRL5ICAsWGaQX2-ggz_1GnBocYQBW20e-1aZl4rHKw

//DISHROUTER
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const authenticate=require('../models/authenticate');

const Dishes=require('../models/dishes');
const dishRouter=express.Router();
var cors = require('cors');

dishRouter.route('/')
.get((req,res,next)=>{
    Dishes.find({})
    .populate('comments.author').then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    }),(err)=>next(err).catch((err)=>next(err));
})
.post(authenticate.verifyUser,(req,res,next)=>{
    Dishes.create(req.body).then((dish)=>{
        console.log('Dish created');
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }),(err)=>next(err).catch((err)=>next(err));
})
.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on dishes');
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.remove({}).then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }),(err)=>next(err).catch((err)=>next(err));
});

dishRouter.route('/:dishId')

.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        console.log('Dish created');
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }),(err)=>next(err).catch((err)=>next(err));
})

.post(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on dishes/'+req.params.dishId);
})
.put(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new:true})
    .then((dish)=>{
        console.log('Dish created');
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }),(err)=>next(err).catch((err)=>next(err));
})

.delete(authenticate.verifyUser,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish)=>{
        console.log('Dish removed');
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    }),(err)=>next(err).catch((err)=>next(err));
});
/*** jshshsjx 




**/

dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author=req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id).populate('comments.author')
                .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);         
                })
                       
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
        + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            for (var i = (dish.comments.length -1); i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id).populate('comments.author')
                .then((dish)=>{
                  res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);    
                })
                              
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete( authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) 
{

            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);  
                })               
            }, (err) => next(err));
        }
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports=dishRouter;