(function() {
  "use strict";
  /* globals $ */
  var clientInput = $('.loadClient')
    , carSelect = $('[name="car"]')
    , client = $('[name="client"]');

  clientInput.autocomplete({
    source: '/api/search/clients'
    , focus: function(event, ui) {
      clientInput.val(ui.item.label);
    }
    , select: function(event, ui) {
      clientInput.val(ui.item.label);
      client.val(ui.item._id);
      var itemsCars = ui.item.car;
      var carsLength = itemsCars.length;
      var cars = [ '<option value="">Escolha um cliente</option>' ];
      for(var i = 0; i < carsLength; i++) {
        cars.push([ '<option value="', itemsCars[i].plate,'">', itemsCars[i].model,'</option>' ].join(''));
      }

      carSelect.html(cars.join('')).removeAttr('disabled');

      return false;
    }
  }).data('autocomplete')._trigger('select');

  var addProduct = (function() {
    var body = $('.tableBody');
    var template = function() {
      var tpl = [];
      tpl.push([
        '<tr><td><input type="text" name="productLabel[]" class="form-control loadProduct" /><input type="hidden" name="product[]" /></td>'
        , '<td><input type="text" name="priceLabel[]" class="form-control maskMoney" disabled /><input type="hidden" name="price[]" /></td>'
        , '<td><input type="text" name="quantity[]" class="form-control" disabled /></td>'
        , '<td><button type="button" class="btn btn-danger rmProduct" disabled>Remover</button></td></tr>'
      ].join(''));
      return tpl;
    };

    var add = function() {
      var row = template();
      body.append(row);
      refreshActions();
    };

    var remove = function() {
      $(this).parent().parent().remove();
      refreshActions();
      updateTotal();
    };

    var autocomplete = function() {
      var product = $('.loadProduct');

      product.each(function() {
        var self = $(this);
        var product = self.parent().find('[name="product[]"]')
          , price = self.parent().parent().find('[name="price[]"]')
          , priceLabel = self.parent().parent().find('[name="priceLabel[]"]')
          , quantity = self.parent().parent().find('[name="quantity[]"]')
          ;

        self.autocomplete({
          source: '/api/search/products'
          , focus: function(event, ui) {
            self.val(ui.item.label);
          }
          , select: function(event, ui) {
            self.val(ui.item.label);
            product.val(ui.item._id);
            price.val(ui.item.price);
            priceLabel.val(ui.item.price);
            quantity.removeAttr('disabled');

            return false;
          }
        });
      });
    };

    var updateTotal = function() {
      var total = 0;
      var quantityLength = $('[name="quantity[]"]').size();
      $('[name="quantity[]"]').each(function(index) {
        var qtd = +this.value;
        var value = $(this).parent().parent().find('[name="price[]"]').val().replace(',', '.');
        total += (qtd * +value);
        if((index + 1) === quantityLength) showTotal(total);
      });

      function showTotal(val) {
        val = parseFloat(val).toFixed(2);
        $('[name="subtotal"]').val(val.toString().replace('.', ','));

        var total = val;
        var discountValue = $('[name="discount"]').val();
        var discount = discountValue ? (/([0-9]+\,[0-9]{2})$/.exec(discountValue)[1]).replace(',', '.') : 0;
        discount = +discount;

        total = (total > discount ? total - discount : 0);
        total = parseFloat(total).toFixed(2);
        $('[name="total"]').val(total.toString().replace('.', ','));

      }
    };


    var refreshActions = function() {
      var removeBtns = $('.rmProduct');
      removeBtns
        .unbind('click')
        .click(remove);

      $('.maskMoney').maskMoney({
        affixesStay: false
        , prefix: 'R$ '
        , decimal: ','
      });

      $('[name="quantity[]"]')
        .unbind('change')
        .maskMoney({ precision: 0, thousands: '' })
        .keyup(updateTotal);

      $('[name="discount"]').keyup(updateTotal);

      autocomplete();

      if(removeBtns.size() > 1) removeBtns.removeAttr('disabled');
      else removeBtns.attr('disabled', 'disabled');
    };

    (function() {
      refreshActions();
    })();

    return {
      add: add
    };
  })();

  $('.addProduct').click(addProduct.add);

  window.removeRow = function(btn) {
    $(btn).parent().parent().remove();
  };
})();
