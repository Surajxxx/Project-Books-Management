const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const BookController = require('../controllers/bookController')
const ReviewController = require('../controllers/reviewController')

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

// get one book details including reviewData
router.get('/books/:bookId', BookController.getBookDetails)

// update book details
router.put('/books/:bookId', BookController.updateBooks)

// delete book
router.delete('/books/:bookId', BookController.deleteBook)




//create new review
router.post('/books/:bookId/review', ReviewController.newReview )




module.exports = router