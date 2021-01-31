const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('./mongoose')
const passport = require('passport')

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
      
       const user = await User.findOne({email: email})
        
        if (user == null) {
            return done(null, false, { message: "No User with that Email"})
        }
        try{
            
            if(await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false,{message: "Password Incorrect"})
            }
            
        } catch(e){
            return done(e)
        }
    
    }
    
    
     passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
     
     passport.serializeUser((user, done) => {
         return done(null, user._id)
     })
     passport.deserializeUser((id, done) => {
            
            User.findOne({_id:id}, (err, user) => {
                done(null, user)
            })
         
     })
}

module.exports = initialize