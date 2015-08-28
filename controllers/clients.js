module.exports = (function() {
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

    var clients = req.db.get('clients');
		clients.findOne({ _id: _id }, function(err, doc) {
			if(err) throw err;
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

  return {
    list: list
    , form: form
    , removeClient: removeClient
  }
})();
