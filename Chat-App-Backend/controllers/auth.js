const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');
const dbConfig = require('../config/secret');

module.exports = {
  async CreateUser(req,res) {
      const schema = Joi.object().keys({
        username: Joi.string()
          .min(5)
          .max(10)
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string()
          .min(5)
          .required()
      });

      const { error, value } = Joi.validate(req.body, schema);
      if (error && error.details) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          //console.log(req.body);
           const userEmail = await User.findOne
          .json({ msg: error.details });
      }
     //console.log(req.body);
      const userEmail = await User.findOne({ 
        email: Helpers.lowerCase(req.body.email) 
      });
      if (userEmail) {
        return res
          .status(HttpStatus.CONFLICT)
          .json({message: 'Email Already exists'});
      }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username)
    });
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({message: 'Username already exists'});
    } 
    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Error hashing password'});
        }
        const body = {
           username: Helpers.firstUpper(value.username),
           email: Helpers.lowerCase(value.email),
           password: hash
        };
        User.create(body)
           .then(user => {
               const token = jwt.sign({data: user}, dbConfig.secret, {
                   expiresIn: "1h"
               });
             res.cookie('auth', token);
             res
               .status(HttpStatus.CREATED)
               .json({message: 'User created successfully', user, token });
          })
          .catch(err => {
             res
               .status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json({message: 'Error Occured' });
        });
    }); 
  },
  async LoginUser(req,res) {
     if (!req.body.username || !req.body.password) {
       return res
       .status(HttpStatus.NOT_FOUND)
       .json({message: 'No Empty fields allowed'});
     }
     await User.findOne({username: Helpers.firstUpper(req.body.username)}).then(user => {
         if (!user) {
           return res
           .status(HttpStatus.NOT_FOUND)
           .json({message: 'Username not Found'});
         }

        return bcrypt.compare(req.body.password, user.password).then((result) => {
           if(!result) {
             return res
             .status(HttpStatus.INTERNAL_SERVER_ERROR)
             .json({message: 'Password is incorrect'});
           }
           const token = jwt.sign({data: user}, dbConfig.secret,{
             expiresIn: "1h"
           });
           res.cookie('auth',token);
           return res
           .status(HttpStatus.OK)
           .json({message: 'Login successful', user, token});
         }) 
     })
     .catch(err => {
       return res
       .status(HttpStatus.INTERNAL_SERVER_ERROR)
       .json({message: 'Error occoured'});
     })
   }
};