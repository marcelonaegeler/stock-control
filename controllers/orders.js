module.exports = (function() {
  "use strict";
  var list = function(req, res) {
    var orders = req.db.get('orders');
    orders.find({}, function(err, docs) {
      if(err) throw err;
      return res.render('orders/list', { module: 'pedidos', orders: docs });
    });
  };

  var form = function(req, res) {
    var _id = req.params.id;
    if(!_id) return res.render('orders/form', { module: 'pedidos' });

    var products = [];
    var loadProductInfo = function(arr, callback) {
      var productsDb = req.db.get('products');
      var arrLength = arr.length;
      var ids = [];
      for(var i = 0; i < arrLength; i++) {
        ids.push(arr[i]._id);
        if((i+1) === arrLength) find();
      }

      function find() {
        console.log(ids);
        productsDb.findById({ $in: ids }, function(err, docs) {
          if(err) throw err;
          console.log(docs);
        });
      }
      /*
      for(var i = 0; i < productsLength; i++) {
        productsDb.find({ _id: { $in toLoad[i]._id }, { name: 1 }, function(err, doc) {
          products.push(toLoad[i]);
          console.log(toLoad);
          /*
          products[i].name = doc.name;
          if(products.length === productsLength) {
            products = toLoad;
            callback();
          }

        });
      }
      */
    };

    var orders = req.db.get('orders');
    orders.findOne({ _id: _id }, function(err, doc) {
      if(err) throw err;

      loadProductInfo(doc.products, function() {
        doc.products = products;
        return res.render('orders/form', { module: 'pedidos', order: doc });
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
      orders.insert(data, function(err) {
        if(err) throw err;
        return res.redirect('/pedidos');
      });
    } else {
      console.log("%s", 'Editing!');
    }


  };

  var remove = function(req, res) {
    return res.render('orders/form', { module: 'pedidos' });
  };

  return {
    list: list
    , form: form
    , remove: remove
    , postForm: postForm
  };
})();
