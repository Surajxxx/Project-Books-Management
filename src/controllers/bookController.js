const BookModel = require('../models/bookModel')
const UserModel = require('../models/userModel')
const { default: mongoose } = require('mongoose')
const moment  = require('moment')
const ISBN = require('isbn-validate')

// validation functions 
    const isValid = function(value){
        if(typeof (value) == 'undefined' || value == null) return false
        if(typeof (value) == 'string' && value.trim().length == 0) return false
        return true
    }

    const isValidRequestBody = function(object){
    return (Object.keys(object).length > 0)
    }

    const isValidIdType = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
    }

      
    // const isValidISBN = function(value){
    //     return ISBN.Validate(value)
    // }

// handler function for new book entry    
const registerBook = async function (req, res){
    try{
        const requestBody = req.body 
        const queryParams = req.query

            if(isValidRequestBody(queryParams)){
            return  res.status(400).send({status: false, message : "invalid endpoint"})
            }

            if(!isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "Book data is required to create a new user"})
            }   

        const {title, excerpt, userId, ISBN, category, subcategory, releasedAt} = requestBody

            if(!isValid(title)){
            return  res.status(400).send({status : false, message : `title is required`})
            }

        const isTitleUnique = await BookModel.findOne({title : title, isDeleted : false})

            if(isTitleUnique){
            return  res.status(400).send({status : false, message : `title already exist`})
            }

            if(!isValid(excerpt)){
            return  res.status(400).send({status : false, message : `excerpt is required`})
            }

            if(!isValid(userId)){
            return  res.status(400).send({status : false, message : `userId is required`})
            }

            if(!isValidIdType(userId)){
            return  res.status(400).send({status : false, message : `enter a valid userId`})
            }

        const isUserExistWithID = await UserModel.findById(userId)    

            if(!isUserExistWithID){
            return  res.status(400).send({status : false, message : "no user exist with this ID"})
            }

            if(!isValid(ISBN)){
            return  res.status(400).send({status : false, message : `ISBN is required`})
            }
//! isbn validation work pending
            // if(isValidISBN(ISBN)){
            // return  res.status(400).send({status : false, message : `enter a valid ISBN`})
            // }

        const isUniqueISBN = await BookModel.findOne({ISBN : ISBN})    

            if(isUniqueISBN){
            return  res.status(400).send({status : false, message : `ISBN already exist`})
            }

            if(!isValid(category)){
            return  res.status(400).send({status : false, message : `category is required`})
            }

            if(!isValid(subcategory)){
            return  res.status(400).send({status : false, message : `subcategory is required`})
            }

            if(!isValid(releasedAt)){
            return  res.status(400).send({status : false, message : `releasedAt is required`})
            }

            
            if(!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)){
            return  res.status(400).send({status : false, message : `released date format should be YYYY-MM-DD`})
            }
            

            if(moment(releasedAt).isValid() == false){
            return res.status(400).send({status : false, message : "enter a valid released date"})    
            }

        const bookData = {title, excerpt, userId, ISBN, category, subcategory, releasedAt, isDeleted: false, reviews: 0}

        const newBook = await BookModel.create(bookData)

        res.status(201).send({status: true, message: "new book added successfully", data : newBook })

    }catch(err){
        res.status(500).send({error : err.message})
    }
}


const booksList = async function(req, res){
    try{
        
        const requestBody = req.body
        const queryParams = req.query
        const filterConditions = {isDeleted : false}

            if(isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "data is not required in body"})
            } 
            
      if(isValidRequestBody(queryParams)){

        const {userId, category, subcategory} = queryParams

            if(isValid(userId) && isValidIdType(userId)){                
            const userById = await UserModel.findById(userId)   
                if(userById){
                    filterConditions['userId'] = userId
                }
            }
            
            if(isValid(category)){
                filterConditions['category'] = category.trim()               
            }

            if(isValid(subcategory)){
                filterConditions['subcategory'] = subcategory.trim()               
            }
            console.log(filterConditions)
        const bookListAfterFiltration = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1, releasedAt : 1, reviews : 1 })

            if(bookListAfterFiltration.length == 0){
            return  res.status(404).send({status : false, message : "no books found"})
            }

        res.status(200).send({status : true, message : "filtered Book list is here", bookList : bookListAfterFiltration })

      }else{
            const bookList = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1, releasedAt : 1, reviews : 1 })

                if(bookList.length == 0){
                return res.status(404).send({status : false, message : "no books found"})
                }

            res.status(200).send({status : true, message : "Book list is here", bookList : bookList})
      } 

    }catch(err){
        res.status(500).send({error : err.message})
    }
}


module.exports.registerBook = registerBook
module.exports.booksList = booksList