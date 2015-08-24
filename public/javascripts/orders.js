(function() {
  var showResults = $('.loadClients');
  var showClient = $('.showClient');

  showResults.hide();

  var refreshButtons = function() {
    $('[data-client]').click(function() {
      window.setClient();
    });
  };

  var loadClients = function() {
    if(!this.value) {
      showResults.hide();
      return;
    }

    var query = this.value;
    api.ajax({
      url: '/api/clients'
      , method: 'GET'
      , data: {
        query: query
      }
      , success: function(data) {
        if(!data.length) {
          showResults.html('Sem resultados').show();
          return;
        }

        var toRender = [];
        for(var item in data) {
          if(!+item && +item != 0) continue;
          toRender.push(
            [
              '<a href="javascript:void(0)" onclick="window.setClient(\''
              , data[item]._id.toString()
              , '\', this)">'
              , data[item].client
              , '</a>' ].join('')
          );
        }
        showResults.html(toRender.join('')).show();
        refreshButtons();
      }
    })
  };

  window.setClient = function(query, origin) {
    showResults.hide();
    var selectedName = origin.innerHTML;
    showClient.val(selectedName);

    var carSelect = $('[name="car"]');
    carSelect.html('<option value="">Carregando...</option>').attr('disabled', 'disabled');

    api.ajax({
      url: '/api/client'
      , method: 'GET'
      , data: {
        query: query
      }
      , success: function(data) {
        if(!data.car) return false;
        var toAppend = [];
        for(var i in data.car) {
          if(!+i && +i != 0) continue;
          var car = data.car[i];
          toAppend.push('<option value="'+ car.plate +'">'+ car.model +' ('+ car.plate +')</option>');
        }

        carSelect.html(toAppend).removeAttr('disabled');
      }
    });

    return false;
  };

  showClient
    .focus(loadClients)
    .keyup(loadClients)
    .focusout(function() {
      //showResults.html('').hide();
    });
})();
