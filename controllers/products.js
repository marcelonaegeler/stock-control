module.exports = (function() {
  "use strict";

  var list = function(req, res) {
    var products = req.db.get('products');
  	products.find({}, function(err, docs) {
  		if(err) throw err;
  		return res.send(docs);
  	});
  };

  var search = function(req, res) {
    if(!req.query.term) return res.send({ status: 1 });
		var clients = req.db.get('products');
		clients.find({ name: new RegExp(req.query.term, 'i') }, function(err, docs) {
			if(err) throw err;

			var docsLength = docs.length;
			var productsDocs = [];
			for(var i = 0; i < docsLength; i++) {
				productsDocs[i] = {
					_id: docs[i]._id
					, label: docs[i].name
					, price: docs[i].sellPrice
				};
				if((i+1) === docsLength) send();
			}

			function send() {
				return res.send(productsDocs);
			}
		});
  };

  return {
    list: list
    , search: search
  };
})();
