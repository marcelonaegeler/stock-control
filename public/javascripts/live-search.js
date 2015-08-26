window.inputClientCallback = function(event) {
  var searchResults = this.parentNode.querySelector('.load-block');

  var query = this.value;

  if(!query) {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    return;
  }

  searchResults.style.display = '';
  searchResults.innerHTML = 'Carregando...';

  api.ajax({
    url: '/api/clients'
    , method: 'GET'
    , data: { query: query }
    , success: function(data) {
      if(!data.length) {
        searchResults.innerHTML = 'Sem resultados';
        searchResults.style.display = '';
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
            , '</a>'
          ].join('')
        );
      }

      searchResults.innerHTML = toRender.join('');
      searchResults.style.display = '';
    }
  });
};


window.inputProductCallback = function() {
  var searchResults = this.parentNode.querySelector('.load-block');

  console.log(this.value);

  if(!this.value) {
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    return;
  }

  searchResults.style.display = '';
  searchResults.innerHTML = 'Carregando...';
};


window.setClient = function(id, origin) {
  var searchResults = origin.parentNode;
  searchResults.style.display = 'none';
  searchResults.innerHTML = '';

  var showClientName = origin.parentNode.parentNode.querySelector('.live-search');
  var setClientId = origin.parentNode.parentNode.querySelector('[name="client"]');

  var selectedName = origin.innerHTML;
  showClientName.value = selectedName;
  setClientId.value = id;

  var carSelect = document.querySelector('[name="car"]');
  carSelect.innerHTML = '<option value="">Carregando...</option>';
  carSelect.setAttribute('disabled', 'disabled');

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

      carSelect.innerHTML = toAppend;
      carSelect.removeAttribute('disabled');
    }
  });

  return false;
};


(function() {
  var inputs = document.querySelectorAll('.live-search');

  var searchBlock = function() {
    var searchBlock = document.createElement('span');
    searchBlock.classList.add('load-block');
    searchBlock.innerHTML = 'Carregando...';
    searchBlock.style.display = 'none';
    return searchBlock;
  };

  for(var i in inputs) {
    if(!+i && +i != 0) continue;

    (function() {
      var input = inputs[i];

      input.setAttribute('autocomplete', 'off');
      var callback = eval(input.dataset.callback);

      input.parentNode.appendChild(searchBlock());

      input.onkeyup = callback;
      input.onfocus = callback;
    })();
  }
})();
