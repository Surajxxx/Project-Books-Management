const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const BookController = require('../controllers/bookController')

//test-api
router.get('/test-me',  function(req, res){
    res.send({status:true, message : "test-api working fine"})
})

// new user register and user login
router.post('/register', UserController.registerUser)
router.get('/login', UserController.userLogin)

// new book registration
router.post('/books', BookController.registerBook )

// get list of all books 
router.get('/books', BookController.booksList)
module.exports = router