module.exports = (function() {
  "use strict";
  var module = 'clientes';

  var list = function(req, res) {
		var clients = req.db.get('clients');
    clients.find({}, function(err, docs) {
			if(err) throw err;
			return res.render('clients/list', { module: module, clients: docs });
		});
  };

  var form = function(req, res) {
    var _id = req.params.id;
    if(!_id) return res.render('clients/form', { module: module });

    getClientInfo(req.db, _id, function(doc) {
      return res.render('clients/form', { module: module, client: doc });
    });
  };

  var removeClient = function(req, res) {
		var _id = req.params.id;
		if(!_id) return res.redirect('/clientes');

		var clients = req.db.get('clients');
		clients.remove({ _id: _id }, function(err) {
			if(err) throw err;
			return res.redirect('/clientes');
		});
	};

  var getClientInfo = function(db, query, callback) {
    var clients = db.get('clients');
		clients.findOne({ _id: query }, function(err, doc) {
			if(err) throw err;
			return callback(doc);
		});
  };

  var getInfo = function(req, res) {
    getClientInfo(req.db, req.query.query, function(doc) {
      return res.send(doc);
    });
  };

  return {
    list: list
    , form: form
    , removeClient: removeClient
    , getInfo: getInfo
  };
})();
