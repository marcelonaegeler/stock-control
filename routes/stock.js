module.exports = function() {
	var express = require('express')
		, router = express.Router();

	router.get('/login', function(req, res) {
		return res.render('login', { redirect: req.query.redirect });
	});
	router.post('/login', function(req, res) {
		req.session.user = 1;
		return res.redirect(req.body.redirect || '/');
	});
	router.get('/logout', function(req, res) {
		return res.redirect('/login');
	});

	router.get('/', function(req, res) {
		return res.render('index');
	});

	router.get('/estoque', function(req, res) {
		return res.render('stock');
	});

	router.get('/produtos', function(req, res) {
		return res.render('products');
	});

	router.get('/usuarios', function(req, res) {
		return res.render('users/list');
	});
	router.get('/usuarios/novo', function(req, res) {
		return res.render('users/form');
	});
	router.get('/usuarios/editar/:id', function(req, res) {
		var _id = req.params.id;
		return res.render('users/form');
	});

	/*
	 * Clients
	 * */
	router.get('/clientes', function(req, res) {
		var db = req.db;
		var clients = db.get('clients');
		clients.find({}, function(err, docs) {
			if(err) throw err;
			return res.render('clients/list', { module: 'clientes', clients: docs });
		});
	});
	router.get('/clientes/remover/:id', function(req, res) {
		var _id = req.params.id;
		if(!_id) return res.redirect('/clientes');

		var db = req.db;
		var clients = db.get('clients');
		clients.remove({ _id: _id }, function(err) {
			if(err) throw err;
			return res.redirect('/clientes');
		});
	});
	router.get('/clientes/novo', function(req, res) {
		return res.render('clients/form');
	});
	router.get('/clientes/editar/:id', function(req, res) {
		var _id = req.params.id;
		if(!_id) return res.redirect('/clientes');

		var db = req.db;
		var clients = db.get('clients');
		clients.findOne({ _id: _id }, function(err, doc) {
			if(err) throw err;
			return res.render('clients/form', { module: 'clientes', client: doc });
		});
	});
	router.post('/clientes/novo', function(req, res) {
		var db = req.db;
		var clients = db.get('clients');
		var dataSet = {};
		dataSet.client = req.body.client;
		dataSet.phone = req.body.phone;
		dataSet.car = [];

		if(req.body.car && typeof req.body.car == 'object') {
			var car = req.body.car;
			var plate = req.body.plate;
			var carsLength = car.length;
			for(var i = 0; i < carsLength; i++) {
				dataSet.car.push({ model: car[i], plate: plate[i] });
			}
		}

		clients.insert(dataSet, function(err) {
			if(err) throw err;
			return res.redirect('/clientes');
		});
	});
	router.post('/clientes/editar', function(req, res) {
		var _id = req.body._id;
		if(!_id) return res.redirect('/clientes');

		var db = req.db;
		var clients = db.get('clients');

		var dataSet = {};
		dataSet.client = req.body.client;
		dataSet.phone = req.body.phone;
		dataSet.car = [];

		if(req.body.car && typeof req.body.car == 'object') {
			var car = req.body.car;
			var plate = req.body.plate;
			var carsLength = car.length;
			for(var i = 0; i < carsLength; i++) {
				if(car[i] && plate[i])
					dataSet.car.push({ model: car[i], plate: plate[i] });
			}
		}

		clients.update({ _id: _id }, dataSet, function(err) {
			if(err) throw err;
			return res.redirect('/clientes');
		});
	});


	router.get('/pedidos/?', function(req, res) {
		return res.render('orders/list', { module: 'pedidos' });
	});
	router.get('/pedidos/novo/?', function(req, res) {
		return res.render('orders/form', { module: 'pedidos' });
	});
	router.get('/pedidos/editar/?', function(req, res) {
		return res.render('orders/form', { module: 'pedidos' });
	});

  return router;
};
