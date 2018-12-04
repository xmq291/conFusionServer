const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorite');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .populate('dishes')
    .populate('user')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }), (err) => next(err)
    .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        // check if favorite document already exists
        if (favorite != null) {
            // next check if dish to be added already exists
            for (let i = 0; i < req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) !== -1) {
                    err = new Error('This dish has already exists!');
                    err.status = 403;
                    return next(err);
                }
                favorite.dishes.push(req.body[i]._id);
            }
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        } 
        else {
            Favorite.create({ user: req.user._id })
            // create a favorite document if such a document corresponding to this user does not already exist
            .then((favorite) => {
                for (let i = 0; i < req.body.length; i++) {
                    favorite.dishes.push(req.body[i]._id);
                }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            });
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

// .put(authenticate.verifyUser, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /favorites');
// })

.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        // check if favorite document already exists
        if (favorite != null) {
        // next check if dish to be added already exists
            if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
                err = new Error('This dish has already exists!');
                err.status = 403;
                return next(err);
            }
            favorite.dishes.push(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        } 
        else {
            Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
            // create a favorite document if such a document corresponding to this user does not already exist
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
  
// .put(authenticate.verifyUser, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /favorites/:dishId');
// })
  
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if (favorite != null) {
            favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        } 
        else {
            const err = new Error(`Dish ${req.params.dishId} is not found`);
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;