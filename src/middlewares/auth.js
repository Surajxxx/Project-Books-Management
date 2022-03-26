const jwt = require('jsonwebtoken')

const authentication = async function(req, res, next){
    try{

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.authentication = authentication