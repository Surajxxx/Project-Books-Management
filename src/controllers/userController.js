const UserModel = require('../models/userModel')
const jwt = require("jsonwebtoken")


// validation functions 
const isValid = function(value){
    if(typeof (value) == 'undefined' || value == null) return false
    if(typeof (value) == 'string' && value.trim().length == 0) return false
    if(typeof (value) == 'number' ) return false
    if(typeof (value) == 'object') return false
    return true
}

const isValidRequestBody = function(object){
    return (Object.keys(object).length > 0)
}

const isValidEmail = function(email){
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regexForEmail.test(email)
}

const isValidPhone = function(phone){
    const regexForMobile = /^[6-9]\d{9}$/
    return regexForMobile.test(phone)
}


// handler function for registering new user

const registerUser = async function(req, res){

    try{
            const requestBody = req.body
            const queryParams = req.query


            // query params must be empty
            if(isValidRequestBody(queryParams)){
            return    res.status(400).send({status: false, message : "invalid endpoint"})
            }

            if (!isValidRequestBody(requestBody)){
            return    res.status(400).send({status : false, message : "user data is required to create a new user"})
            }    
            // using destructuring then individually validating each key    
            const {title, name, phone, email, password} = requestBody
                
            if(!isValid(title)){
            return    res.status(400).send({status : false, message : `title is required and should be valid format like: "Mr"`})
            }

            if(!(["Mr", "Mrs", "Miss"].includes(title.trim()))){
            return    res.status(400).send({status : false, message : `title must be provided from these values: Mr/Mrs/Miss`})
            }

            if(!isValid(name)){
            return    res.status(400).send({status : false, message : `name is required and should be in valid format like : "JOHN"`})
            }

            if(!isValid(phone)){
            return    res.status(400).send({status : false, message : "mobile number is required"})
            }

            if(!isValidPhone(phone)){
            return    res.status(400).send({status : false, message : " please enter a valid 10 digit mobile number without country code and 0"})
            }

            if(!isValid(email)){
            return    res.status(400).send({status : false, message : "email address is required"})
            }

            if(!isValidEmail(email)){
            return    res.status(400).send({status : false, message : " please enter a valid email address"})
            }

            if(!isValid(password)){
            return    res.status(400).send({status : false, message : "password is required"})
            }
            
            if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/.test(password)){
            return    res.status(400).send({status : false, message : "password should be: 8 to 15 characters, at least one letter and one number "})
            }
            
            const isEmailUnique = await UserModel.findOne({email})
            
            if(isEmailUnique){
            return    res.status(400).send({status : false, message : `email: ${email} already exist`})
            }
            
            const isPhoneUnique = await UserModel.findOne({phone})
        
            if(isPhoneUnique){
            return    res.status(400).send({status : false, message : `mobile number: ${phone} already exist`})
            }
            
    // validation ends here
            
                const newUser = await UserModel.create(requestBody)

                res.status(201).send({status : true, message : "new user registered successfully", data : newUser})
           
    }catch(err){
            res.status(500).send({error : err.message})
    }

}


// handler function for user login 

const userLogin = async function(req, res){

    try{
        const requestBody = req.body
        const queryParams = req.query

            // query params must be empty
            if(isValidRequestBody(queryParams)){
            return  res.status(400).send({status: false, message : "invalid endpoint"})  
            }

            if(!isValidRequestBody(requestBody)){
            return  res.status(400).send({status: false, message : "please provide input credentials"})    
            }

        const userName = requestBody.email
        const password = requestBody.password    
            // validating userName and password
            if(!isValid(userName)){
            return  res.status(400).send({status: false, message : "email is required"})    
            }

            if(!isValid(password)){
            return  res.status(400).send({status: false, message : "password is required"})    
            }

            if(!isValidEmail(userName)){
            return  res.status(400).send({status: false, message : "please enter a valid email address"})   
            }

            if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/.test(password)){
            return  res.status(400).send({status : false, message : "password should be: 8 to 15 characters, at least one letter and one number "})
            }

        const loginUser = await UserModel.findOne({email : userName.toLowerCase().trim(), password: password})

            if(!loginUser){
            return  res.status(404).send({status : false, message : "invalid login credentials" })
            }

        const userID = loginUser._id        
        const payLoad = {userId : userID }
        const secretKey = "asdfgh!@#41234sasdg565"

       // creating JWT
        const token = jwt.sign(payLoad, secretKey,  {expiresIn : "7d"})
        
        res.header("x-api-key", token)

        res.status(200).send({status: true, message: "login successful" , data: token})

    }catch(err){
            res.status(500).send({error : err.message})
    }
}


module.exports.registerUser = registerUser
module.exports.userLogin = userLogin