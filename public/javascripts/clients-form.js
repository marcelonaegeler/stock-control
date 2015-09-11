(function() {
  var btnAdd = $('#addCar');
  var carListTemplate = [ '<div class="row"><div class="form-group col-sm-6">'
    , '<label>Modelo:</label><input type="text" name="car[]" class="form-control" value="" />'
    , '</div><div class="form-group col-sm-4">'
    , '<label>Placa:</label><input type="text" name="plate[]" class="form-control" value="" />'
    , '</div><div class="form-group col-sm-2">'
    , '<button type="button" class="btn btn-danger btn-remove-car" style="margin-top: 16px;">'
    , '<i class="fa fa-close"></i> Remover</button></div></div>' ].join('');

  var updateButtons = function() {
    var btnRemove = $('.btn-remove-car');
    if(btnRemove.length > 1) {
      btnRemove.each(function() {
        $(this)
          .unbind('click')
          .click(function() {
            deleteElement(this);
          })
          .removeAttr('disabled');
      });
    } else {
      btnRemove.each(function() {
        $(this).attr('disabled', 'disabled');
      });
    }
  };

  /*
  * Events
  */
  updateButtons();
  btnAdd.click(function() {
    $('.list-cars').append(carListTemplate);
    updateButtons();
  });

  var deleteElement = function(el) {
    el.parentNode.parentNode.remove();
    updateButtons();
  };
})();
