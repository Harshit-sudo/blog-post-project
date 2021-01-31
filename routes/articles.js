const express = require('express')
const Article = require('./../models/article')
const methodOverride = require('method-override')
const Comment = require('./../models/comment')
const User = require('../mongoose')
const router = express.Router()

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}


router.get('/new', checkAuthenticated, (req, res) => {
    res.render('articles/new.ejs', {article: new Article()})
})


router.get('/:slug', checkAuthenticated, async (req, res) => {
    const article =  await Article.findOne({slug: req.params.slug})
    
    if(article == null) { return res.redirect('/') }
    res.render('articles/show.ejs', {article: article, req: req})

})



router.post('/', checkAuthenticated, async (req, res, next) => {
     
     let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        user: req.session.passport.user
    })
    try{
      article = await article.save()
      res.redirect('/read')
    } catch(e) {
        res.render('articles/new.ejs', {article: article})
    }
})



router.get('/edit/:id',checkAuthenticated, async (req, res) =>{
    
    const article = await Article.findById(req.params.id)
    const articles = await Article.find().sort({createdAt: 'desc'}).populate('user')
    
    res.render('articles/edit.ejs', { article: article })
})


router.put('/:id',checkAuthenticated, async (req, res, next) => {
     
    req.article = await Article.findById(req.params.id)
    next()
 }, saveArticleandRedirect('edit'))


 router.delete('/:id', checkAuthenticated, async (req, res) => {
    
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/read')
})

router.post('/comment/:id', checkAuthenticated, async(req, res) => {
        let comment = new Comment({
            comment: req.body.comment,
            person: req.session.passport.user,
            blog: req.params.id
        })

        
        let user = await User.findById(req.session.passport.user)
        
        try {
            comment = await comment.save()
            let article = await Article.findOne({_id: req.params.id})
            article.comments = article.comments.concat({commentId: comment._id, comment: comment.comment,person: user.name})
            await article.save()
            res.redirect(`/articles/${article.slug}`)
        } catch(e) {
            res.redirect(`/articles/${article.slug}`)
        }
})
 
function saveArticleandRedirect(path) {
    return async (req, res) => {
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdown =req.body.markdown
        try{
          article = await article.save()
          res.redirect(`/articles/${article.slug}`)
        } catch(e) {
            res.render(`articles/${path}.ejs`, {article: article})
        }
    }
}
module.exports = router