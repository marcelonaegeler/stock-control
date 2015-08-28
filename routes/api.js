module.exports = function() {
	var express = require('express')
		, router = express.Router();

  /*
   * API Ajax calls
   * */
  router.get('/products', function(req, res) {
  	var db = req.db;
  	var products = db.get('products');
  	products.find({}, function(err, docs) {
  		if(err) throw err;
  		return res.send(docs);
  	});
  });

  router.post('/product/new', function(req, res) {
  	var db = req.db;
  	var products = db.get('products');

  	if(!req.body.name || !req.body.code) return res.send({ status: 1 });

  	var data = {
  		name: req.body.name
  		, stock: +req.body.stock || 0
  		, code: req.body.code
  		, costPrice: req.body.costPrice || 0
  		, sellPrice: req.body.sellPrice || 0
  	};

  	products.insert(data, function(err) {
  		if(err) throw err;
  		return res.send({ status: 0 });
  	});
  });

  router.post('/product/edit', function(req, res) {
  	if(req.body.field == 'code'
  		|| req.body.field == 'name'
  		|| req.body.field == 'costPrice'
  		|| req.body.field == 'sellPrice'
  		|| req.body.field == 'stock') {
  		var dataSet = {};
  		dataSet[req.body.field] = req.body.value;
  	} else {
  		return res.send({ status: 1 });
  	}
  	var db = req.db;
  	var products = db.get('products');

  	products.update({ _id: req.body.id }, { $set: dataSet }, function(err) {
  		if(err) throw err;
  		return res.send({ status: 0 });
  	});
  });

  router.post('/product/remove', function(req, res) {
  	var db = req.db;
  	var products = db.get('products');
  	products.remove({ _id: req.body.id }, function(err) {
  		if(err) throw err;
  		return res.send({ status: 0 });
  	});
  });

  router.post('/stock/add', function(req, res) {
  	var db = req.db;
  	var products = db.get('products');
  	products.update({ _id: req.body.id }, { $inc: { stock: +req.body.stock } }, function(err, docs) {
  		if(err) throw err;
  	});
  	return res.send({ status: 0 });
  });
  router.post('/stock/rm', function(req, res) {
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

	router.get('/clients', function(req, res) {
		if(!req.query.query) return res.send({ status: 1 });
		var clients = req.db.get('clients');
		clients.find({ client: new RegExp(req.query.query, 'i') }, [ '-phone', '-car' ], function(err, docs) {
			if(err) throw err;
			return res.send(docs);
		});
	});
	router.get('/client', function(req, res) {
		if(!req.query.query) return res.send({ status: 1 });
		var clients = req.db.get('clients');
		clients.findOne({ _id: req.query.query }, function(err, doc) {
			if(err) throw err;
			return res.send(doc);
		});
	});

  return router;
};
