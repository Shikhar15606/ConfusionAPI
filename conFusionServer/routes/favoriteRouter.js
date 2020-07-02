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
        .then((dishes)=>{
            if(dishes != null)
            {
                var x = -1;
                var y = null;
                req.body.forEach(element => {
                    if(dishes.dishes.indexOf(element._id) != -1 ) 
                    {
                        x = 0;
                        y = element._id;
                    }
                    else
                    {
                        dishes.dishes.push(element); 
                        dishes.save();
                    }
                });
                if(x === -1)
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes);
                }
                else
                {
                    res.statusCode = 403;
                    res.end(y+' dish already exists');
                }
            }
            else{
                // Favorites.findOne({user : req.user._id})
                Favorites.create({user:req.user._id,dishes:req.body})
                .then((dishes)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes);
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
.get(authenticate.verifyUser ,cors.cors,(req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/'+req.params.dishId);
})

.post(cors.corsWithOptions,authenticate.verifyUser ,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
        .then((dishes)=>{
            if(dishes != null)
            {
                var x = dishes.dishes.indexOf(req.params.dishId)
                if(x === -1){
                    dishes.dishes.push(req.params.dishId); 
                    dishes.save();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dishes);
                }
                else{
                    res.statusCode = 403;
                    res.end(req.params.dishId + ' Already Exists ');
                }
            }
            else{
                Favorites.create({user:req.user._id,dishes:[req.body]})
                    .then((resp)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    }), (err) => next(err)
                    .catch((err) => next(err));
            }
        }), (err) => next(err)
        .catch((err) => next(err));
})

.put(cors.cors,authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+req.params.dishId);
})

.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user : req.user._id})
        .then((dishes) => {
            var x = dishes.dishes.indexOf(req.params.dishId)
            if(x === -1)
            {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json({status:"Dish Not Found in your Favourites"});
            }
            else{
                dishes.dishes.splice(x,1);
                dishes.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

module.exports = favouriteRouter;