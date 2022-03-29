const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const BookController = require('../controllers/bookController')
const ReviewController = require('../controllers/reviewController')
const MiddleWares = require('../middlewares/auth')

//test-api
router.get('/test-me',  function(req, res){
    res.send({status:true, message : "test-api working fine"})
})

// new user register and user login
router.post('/register', UserController.registerUser)
router.get('/login', UserController.userLogin)



// new book registration
router.post('/books', MiddleWares.authentication ,BookController.registerBook )

// get list of all books 
router.get('/books' , MiddleWares.authentication , BookController.booksList)

// get one book details including reviewData
router.get('/books/:bookId', MiddleWares.authentication, BookController.getBookDetails)

// update book details
router.put('/books/:bookId', MiddleWares.authentication, MiddleWares.authorization, BookController.updateBooks)

// delete book
router.delete('/books/:bookId', MiddleWares.authentication, MiddleWares.authorization, BookController.deleteBook)




//create new review
router.post('/books/:bookId/review', ReviewController.newReview )

//update review
router.put('/books/:bookId/review/:reviewId', ReviewController.updateReview)

//delete review
router.delete('/books/:bookId/review/:reviewId', ReviewController.deleteReview)




module.exports = router