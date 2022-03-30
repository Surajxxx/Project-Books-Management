const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const BookModel = require('../models/bookModel')

const authentication = async function(req, res, next){
    try{
        const token = req.headers['x-api-key']
        const secretKey = "asdfgh!@#41234sasdg565"

        if(!token){
        return res.status(401).send({status: false, message : "Please provide token"})
        }

        const decodedToken = jwt.verify(token, secretKey) 

        if(!decodedToken){
        return res.status(401).send({status : false, message: "authentication failed"})
        }
        // setting a key in request,  "decodedToken" which consist userId and exp.
        req.decodedToken = decodedToken
        
        next()

    }catch(err){
       
        res.status(500).send({error : err.message})
    }
}

const authorization = async function(req, res,next){
    try{
        const bookId = req.params.bookId
        const decodedToken = req.decodedToken
       
        if(mongoose.Types.ObjectId.isValid(bookId) == false){
        return res.status(400).send({status : false, message : "bookId is not valid"})
        }

        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

        if(!bookByBookId){
        return res.status(404).send({status : false, message : `no book found by ${bookId}`})    
        }

        if((decodedToken.userId != bookByBookId.userId)){
        return res.status(403).send({status : false, message : `unauthorized access`})
        }
        // checking jwt token expiry
        if((Date.now() > (decodedToken.exp * 1000))){
        return res.status(403).send({status : false, message : `session expired, please login again`})
        }
        
        next()

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.authentication = authentication
module.exports.authorization = authorization