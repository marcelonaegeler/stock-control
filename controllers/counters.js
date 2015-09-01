module.exports = (function() {
  "use strict";

  var getOrder = function(db, cb) {
    var counters = db.get('counters');
    counters.update({ name: 'orders' }, { $inc: { number: 1 } }, function(err) {
      if(err) throw err;
      counters.findOne({ name: 'orders' }, { nubmer: 1 }, function(err, doc) {
        return cb(doc.number);
      });
    });
  };

  return {
    getOrder: getOrder
  };
})();
