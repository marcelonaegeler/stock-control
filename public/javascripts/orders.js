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
    $.ajax({
      url: '/api/clients'
      , type: 'GET'
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
            [ '<a href="javascript:void(0)" data-client="', data[item]._id.toString(),'"', '">', data[item].client, '</a>' ].join('')
          );
        }
        showResults.html(toRender.join('')).show();
        refreshButtons();
      }
    })
  };

  window.setClient = function() {
    //showResults.hide();

    console.log('pl');
    var query = this.dataset.id;
    $.ajax({
      url: '/api/client'
      , type: 'GET'
      , data: {
        query: query
      }
      , success: function(data) {
        console.log(data);
      }
    });

    return false;
  };

  showClient
    .focus(loadClients)
    .keyup(loadClients)
    .focusout(function() {
      showResults.html('').hide();
    });
})();
