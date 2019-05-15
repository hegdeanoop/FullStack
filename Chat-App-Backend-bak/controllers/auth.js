const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Helpers = require('../Helpers/helpers');
const User = require('../models/userModel');
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
    
     if(error &&  error.details) {
     return res 
         .status(HttpStatus.BAD_REQUEST)
         .json({ msg: error.details })
     }
     const userEmail = await User.findOne({ 
         email: Helpers.lowerCase(req.body.email) 
        });
     if(userEmail) {
         return res
         .status(HttpStatus.CONFLICT)
         .json({message: 'Email already exists'});
     }
     const userName = await User.findOne({
         username: Helpers.firstUpper(req.body.username)
        });
     if(userName) {
         return res
         .status(HttpStatus.CONFLICT)
         .json({message: 'Username already exist'});
       }
     
       return bcrypt.hash(value.password, 10 ,(err, hash) => { 
           if(err) {
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
              const token = jwt.sign({ data: user }, dbConfig.secret, {
                expiresIn: '5h'
              });
              res.cookie('auth', token);
              res
                .status(HttpStatus.CREATED)
                .json({ message: 'User created successfully', user, token });
            })
            .catch(err => {
              res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error occured' });
            });
       });
    }
  }