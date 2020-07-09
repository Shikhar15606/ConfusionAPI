const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');
const user = require('../models/user');
const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions,authenticate.verifyUser,(req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
        Favorites.find({user : req.user._id})
        .populate('user')  
        .populate('dishes')  
        .then((dishes)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);
        }), (err) => next(err)
        .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
        .then((favorite)=>{
            if(favorite != null)
            {
                for (i = 0; i < req.body.length; i++ )
                if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
                    favorite.dishes.push(req.body[i]);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else{
                Favorites.create({user:req.user._id})
                .then((favorite)=>{
                    for(i=0;i<req.body.length;i++)
                    {
                        if(favorite.dishes.indexOf(req.body[i]._id == -1))
                            favorite.dishes.push(req.body[i]);
                    }
                    favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    })
                    },(err) => next(err))
                .catch((err) => next(err));
            }
        },(err) => next(err))
        .catch((err) => next(err));
})

.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
        Favorites.findOneAndDelete({user : req.user._id})
        .then((dishes)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dishes);
        }), (err) => next(err)
        .catch((err) => next(err)); 
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser ,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
        .then((favorite)=>{
            if(favorite != null)
            {
                if (favorite.dishes.indexOf(req.params.dishId) < 0) {                
                    favorite.dishes.push(req.body);
                    favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    })
                    .catch((err) => {
                        return next(err);
                    })
            }
            }
            else{
                Favorites.create({user:req.user._id,dishes:[req.body]})
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });  
            }
            }).catch((err) => {
                return next(err);
            })
        })

.put(cors.cors,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+req.params.dishId);
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
        .then((favorite) => {
            var x = favorite.dishes.indexOf(req.params.dishId)
            if(x === -1)
            {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json({status:"Dish Not Found in your Favourites"});
            }
            else{
                dishes.dishes.splice(x,1);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favouriteRouter;