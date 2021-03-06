module.exports = function() {
	"use strict";
	var express = require('express')
		, router = express.Router()
		, clients = require('../controllers/clients')
		, orders = require('../controllers/orders')
		;

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
	router.get('/usuarios/form/?:id', function(req, res) {
		var _id = req.params.id;
		if(!_id) return res.render('users/form');
		return res.render('users/form');
	});

	/*
	 * Clients
	 */
	router.get('/clientes', clients.list);
	router.get('/clientes/remove/:id', clients.removeClient);
	router.get('/clientes/form/?:id?', clients.form);

	router.post('/clientes/novo', function(req, res) {
		var clients = req.db.get('clients');
		var dataSet = {};
		dataSet.name = req.body.name;
		dataSet.phone = req.body.phone;
		dataSet.car = [];

		if(req.body.car && typeof req.body.car === 'object') {
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
		dataSet.name = req.body.name;
		dataSet.phone = req.body.phone;
		dataSet.car = [];

		if(req.body.car && typeof req.body.car === 'object') {
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

	/*
	* Orders
	*/
	router.get('/pedidos/?', orders.list)
		.get('/pedidos/form/?:id?', orders.form)
		.get('/pedidos/remove/?:id?', orders.remove)
		.post('/pedidos/form/?:id?', orders.postForm)
		;

  return router;
};
