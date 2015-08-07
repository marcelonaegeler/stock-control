var express = require('express')
	, app = express()
	, swig = require('swig')
	, bodyParser = require('body-parser')
	, monk = require('monk')('localhost:27017/stock')
	;

app.engine('html', swig.renderFile);
app.set('views', __dirname +'/views');
app.set('view engine', 'html');
app.set('view cache', false);
app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set the DB global for requests
app.use(function(req, res, next) {
	req.db = monk;
	next();
});

app.get('/', function(req, res) {
	return res.render('index');
});

app.get('/api/products', function(req, res) {
	var db = req.db;
	var products = db.get('products');
	products.find({}, function(err, docs) {
		if(err) throw err;
		return res.send(docs);
	});
});

app.post('/api/product/new', function(req, res) {
	var db = req.db;
	var products = db.get('products');
	products.insert({ name: req.body.name, stock: +req.body.stock }, function(err) {
		if(err) throw err;
		return res.send({ status: 0 });
	});
});

app.post('/api/product/edit', function(req, res) {
	var db = req.db;
	var products = db.get('products');
	products.findAndModify({ _id: req.body.id }, { $set: { name: req.body.name } }, function(err) {
		if(err) throw err;
		return res.send({ status: 0 });
	});
});

app.post('/api/product/remove', function(req, res) {
	var db = req.db;
	var products = db.get('products');
	products.remove({ _id: req.body.id }, function(err) {
		if(err) throw err;
		return res.send({ status: 0 });
	});
});

app.post('/api/stock/add', function(req, res) {
	var db = req.db;
	var products = db.get('products');
	products.update({ _id: req.body.id }, { $inc: { stock: +req.body.stock } }, function(err, docs) {
		if(err) throw err;
	});
	return res.send({ status: 0 });
});
app.post('/api/stock/rm', function(req, res) {
	var db = req.db;
	var products = db.get('products');

	products.findById(req.body.id, { fields: { _id: 0, stock: 1 } }, function(err, doc) {
		if(err) throw err;
		if(+req.body.stock > doc.stock)
			return res.send({ error: 1, stock: doc.stock });

		products.update({ _id: req.body.id }, { $inc: { stock: -(+req.body.stock) } }, function(err) {
			if(err) throw err;
			return res.send({ error: 0 });
		});
	});
});

app.use(function(req, res, next) {
  return res.render('notFound');
});

app.listen(3001, function() {
	console.log('Magic happens on port 3000');
});
