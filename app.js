"use strict";
var express = require('express')
	, app = express()
	, swig = require('swig')
	, bodyParser = require('body-parser')
	, cookieParser = require('cookie-parser')
	, session = require('express-session')
	, monk = require('monk')('localhost:27017/stock')
	;

app.engine('html', swig.renderFile);
app.set('views', __dirname +'/views');
app.set('view engine', 'html');
app.set('view cache', false);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  cookieName: 'user'
  , secret: 'Stock application'
  , duration: 30 * 60 * 1000
  , activeDuration: 5 * 60 * 1000
  , httpOnly: true
  , secure: true
  , ephemeral: true
  , saveUninitialized: true
  , resave: true
}));

// Set the DB global for requests
app.use(function(req, res, next) {
	req.db = monk;
	//if(!req.session.user && !req.originalUrl.match('/login')) return res.redirect('/login?redirect='+ req.originalUrl);
	next();
});

app.use('/api', require('./routes/api')());
app.use('/', require('./routes/stock')());

/*
 * Not found
 * */
app.use(function(req, res) {
	res.render('notFound');
});

/*
* Listen
*/
app.listen(3001, function() {
	console.log('Magic happens on port 3001');
});
