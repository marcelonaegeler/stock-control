module.exports = (function() {
  "use strict";
  var list = function(req, res) {
    return res.render('orders/list', { module: 'pedidos' });
  };

  var form = function(req, res) {
    var _id = req.params.id;
    var clients = req.db.get('clients');
    if(!_id) {
      clients.find({}, { _id: 1, client: 1 }, function(err, docs) {
        if(err) throw err;
        return res.render('orders/form', { module: 'pedidos', clients: docs });
      });
    }
  };

  var remove = function(req, res) {
    return res.render('orders/form', { module: 'pedidos' });
  };

  return {
    list: list
    , form: form
    , remove: remove
  };
})();
