(function() {
  "use strict";
  /* globals $, api */

  var clientSelect = $('[name="client"]')
    , carSelect = $('[name="car"]');
  clientSelect.change(function() {
    var query = this.value;
    if(!query) {
      carSelect.html('<option value="">Escolha um cliente</option>').attr('disabled', 'disabled');
      return;
    }

    carSelect.html('<option value="">Carregando...</option>').attr('disabled', 'disabled');

    api.ajax({
      url: '/api/client'
      , method: 'GET'
      , data: { query: query }
      , success: function(data) {
        console.log(data);
        var carsLength = data.car.length;
        var cars = [ '<option value="">Escolha um cliente</option>' ];
        for(var i = 0; i < carsLength; i++) {
          cars.push([ '<option value="', data.car[i].plate,'">', data.car[i].model,'</option>' ].join(''));
        }

        carSelect.html(cars.join('')).removeAttr('disabled');
      }
    });
  });
})();
