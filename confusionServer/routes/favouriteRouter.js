const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../models/authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            // extract favourites that match the req.user.id
            if (favourites) {
                user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user_favourites) {
                    var err = new Error('You have no favourites!');
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(user_favourites);
            } else {
                var err = new Error('There are no favourites');
                err.status = 404;
                return next(err);
            }
            
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user) 
                    user = new Favourites({user: req.user.id});
                for(let i of req.body){
                    if(user.dishes.find((d_id) => {
                        if(d_id._id){
                            return d_id._id.toString() === i._id.toString();
                        }
                    }))
                        continue;
                    user.dishes.push(i._id);
                }
                user.save()
                    .then((userFavs) => {
                        Favourites.findById(userFavs._id)
                        .populate('user')
                        .populate('dishes')
                        .then((userFavs))=>{
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }
                    }, (err) => next(err))
                    .catch((err) => next(err));
                
            })
            .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var favToRemove;
            if (favourites) {
                favToRemove = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            } 
            if(favToRemove){
                favToRemove.remove()
                .then((result) => {
                        Favourites.findById(userFavs._id)
                        .populate('user')
                        .populate('dishes')
                        .then((result))=>{
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                        console.log("Favourites CDeleted");
                    }
                    }, (err) => next(err));
                
            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({userreq.user._id})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            if (!favourites) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                return res.json({"exists": false,"favourites":favourites});
               
               
            } else {
                if(favourites.dishes.indexOf(req.params.dishId)<0){
                 res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                return res.json({"exists": false,"favourites":favourites});
                }
                else{
                    res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                return res.json({"exists": true,"favourites":favourites});
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, 
    (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                var user;
                if(favourites)
                    user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
                if(!user) 
                    user = new Favourites({user: req.user.id});
                if(!user.dishes.find((d_id) => {
                    if(d_id._id)
                        return d_id._id.toString() === req.params.dishId.toString();
                }))
                    user.dishes.push(req.params.dishId);
                
                user.save()
                   .then((userFavs) => {
                        Favourites.findById(userFavs._id)
                        .populate('user')
                        .populate('dishes')
                        .then((userFavs))=>{
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(userFavs);
                        console.log("Favourites Created");
                    }
                    }, (err) => next(err))
                    .catch((err) => next(err));

            })
            .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favourites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({})
        .populate('user')
        .populate('dishes')
        .then((favourites) => {
            var user;
            if(favourites)
                user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
            if(user){
                user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
                user.save()
                    .then((result) => {
                        Favourites.findById(userFavs._id)
                        .populate('user')
                        .populate('dishes')
                        .then((result))=>{
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(result);
                        console.log("Favourite Deleted");
                    }
                    }, (err) => next(err));
                
            } else {
                var err = new Error('You do not have any favourites');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favouriteRouter;