const express = require('express')
const bcrypt = require('bcrypt') 
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const User = require('./mongoose')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')


if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}


initializePassport(
    passport
    //   (email) => {
    //    User.findOne({email: email}, (err, user) => {
    //        if (err) {return err}
    //        else {
    //         console.log(user)   
    //         return user
    //     }
    //    })
    // },
    // (id) => {
    //     User.find({_id: id}, (err, user) => {
    //        if (err) {
    //            return err
    //        } else {
    //            return user
    //        }
    //     })
    //}
//     email => {
//         return users.find(user => user.email === email)
// },
// id => {
//     return users.find(user => user.id === id)
// }
)

const app = express()


// const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use('/articles', articleRouter)

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name
    })
})



app.get('/read', checkAuthenticated, async (req, res) => {
    try{

        const articles = await Article.find().sort({createdAt: 'desc'}).populate('user')
        res.render('articles/index.ejs', {articles: articles, req: req})      
    }
    catch(e) {
        console.log(e)
    }
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/read',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {
        err: undefined
    })
})

app.post('/register', async (req, res) => {
    try {

    if (req.body.password.length <= 7) {
            return res.render('register.ejs', {
                err: "Password should be of minimum 7"
            })
        }
     const hashedPassword = await bcrypt.hash(req.body.password, 10)
    
      if(await User.findOne({email: req.body.email})) {
            return res.render('register.ejs', {
                err: "Email is already registered"
            })
      }
      
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
       
        await user.save()
        res.redirect('/login')
        
    } catch {
        res.redirect('/register')
    }
    
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})



app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})


function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
       return res.redirect('/')
    }
    next()
}

module.exports = checkAuthenticated
app.listen(3000)