module.exports = (function() {
  "use strict";
  var module = 'pedidos';
  var _ = require('underscore');
  var counters = require('./counters');

  var list = function(req, res) {
    var orders = req.db.get('orders');
    orders.find({}, function(err, docs) {
      if(err) throw err;
      return res.render('orders/list', { module: module, orders: docs });
    });
  };

  var form = function(req, res) {
    var _id = req.params.id;
    if(!_id) return res.render('orders/form', { module: module });

    var loadProductInfo = function(arr, callback) {
      var productsDb = req.db.get('products');
      var arrLength = arr.length;
      var ids = [];

      var find = _.after(arrLength, function() {
        productsDb.find({ _id: { $in: ids } }, function(err, docs) {
          if(err) throw err;
          callback(docs);
        });
      });

      for(var i = 0; i < arrLength; i++) {
        ids.push(productsDb.id(arr[i]._id));
        find();
      }
    };

    var loadClientInfo = function(_id, callback) {
      var clients = req.db.get('clients');
      clients.findById(_id, function(err, doc) {
        if(err) throw err;
        callback(doc);
      });
    };

    var orders = req.db.get('orders');
    orders.findOne({ _id: _id }, function(err, doc) {
      if(err) throw err;
      var render = _.after(2, function() {
        return res.render('orders/form', { module: module, order: doc });
      });

      loadClientInfo(doc.client, function(info) {
        doc.clientInfo = info;
        render();
      });

      loadProductInfo(doc.products, function(docs) {
        if(!doc.products.length) return render();

        var step = _.after(doc.products.length, function() {
          render();
        });

        doc.products.map(function(product, index) {
          docs.map(function(el) {
            if(product._id.toString() === el._id.toString())
              doc.products[index].name = el.name;
          });
          step();
        });
      });
    });
  };

  var postForm = function(req, res) {
    var _id = req.params.id;

    var data = {
      client: req.body.client
      , car: req.body.car
      , discount: +req.body.discount.replace(',', '.')
      , products: []
      , price: 0
      , date: new Date()
    };

    var products = req.body.product;
    var prices = req.body.price;
    var quantities = req.body.quantity;
    var orderNumber = req.body.orderNumber;
    var productsLength = products.length;

    for(var i = 0; i < productsLength; i++) {
      var price = +prices[i].replace(',', '.')
        , quantity = +quantities[i];

      if(!quantity || !price) continue;

      data.price += (price * quantity);

      data.products.push({
        _id: products[i]
        , price: price
        , quantity: quantity
      });
    }

    var orders = req.db.get('orders');

    if(!_id) {
      counters.getOrder(req.db, function(orderNumber) {
        data.orderNumber = orderNumber;

        orders.insert(data, function(err) {
          if(err) throw err;
          return res.redirect('/'+ module);
        });
      });
    } else {
      orders.update({ _id: orders.id(_id) }, data, function() {
        return res.redirect('/'+ module);
      });
    }

  };

  var remove = function(req, res) {
    if(req.params.id) {
      var orders = req.db.get('orders');
      orders.remove({ _id: req.params.id });
    }
    return res.redirect('/'+ module);
  };

  return {
    list: list
    , form: form
    , remove: remove
    , postForm: postForm
  };
})();
