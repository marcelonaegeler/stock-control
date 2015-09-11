module.exports = function() {
	"use strict";
	var express = require('express')
		, router = express.Router()
		, clients = require('../controllers/clients')
		, orders = require('../controllers/orders')
		, products = require('../controllers/products')
		;

  /*
   * API Ajax calls
   * */

 	router.get('/orders', orders.ajaxList);

  router.get('/products', products.list);
	router.get('/search/products', products.search);

  router.post('/product/new', function(req, res) {
  	var products = req.db.get('products');

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
		var dataSet = {};
  	if(req.body.field === 'code'
  		|| req.body.field === 'name'
  		|| req.body.field === 'costPrice'
  		|| req.body.field === 'sellPrice'
  		|| req.body.field === 'stock') {
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
  	products.update({ _id: req.body.id }, { $inc: { stock: +req.body.stock } }, function(err) {
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

	/*
	* Clients
	*/
	router.get('/client', clients.getInfo);
	router.get('/clients', clients.ajaxList);
	router.get('/search/clients', function(req, res) {
		if(!req.query.term) return res.send({ status: 1 });
		var clients = req.db.get('clients');
		clients.find({ name: new RegExp(req.query.term, 'i') }, [ '-phone' ], function(err, docs) {
			if(err) throw err;

			var docsLength = docs.length;
			var clientsDocs = [];
			for(var i = 0; i < docsLength; i++) {
				clientsDocs[i] = {
					_id: docs[i]._id
					, label: docs[i].name
					, car: docs[i].car
				};
				if((i+1) === docsLength) send();
			}
			function send() {
				return res.send(clientsDocs);
			}
		});
	});

  return router;
};
