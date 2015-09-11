(function() {
  "use strict";

  var SearchBar = React.createClass({
		changeHandler: function(event) {
			this.props.changeHandler(event.target.value);
		}
		, render: function() {
			return (
				<div className="dataTables_filter form-inline">
					<input type="text" placeholder="Pesquisar..." className="form-control" ref="searchInput" value={this.props.search} onChange={this.changeHandler} />
				</div>
			);
		}
	});

  var TableRow = React.createClass({
    rmItem: function() {
      console.log('remove');
    }
    , render: function() {
      var item = this.props.item;
      var date = new Date(item.date);
      var dateStr = [
        date.getDay() < 10 ? '0'+ date.getDay() : date.getDay()
        , date.getMonth() < 11 ? '0'+ (date.getMonth() + 1) : date.getMonth() + 1
        , date.getFullYear() ].join('/');
      return (
        <tr>
          <td>{item.orderNumber}</td>
          <td>{dateStr}</td>
          <td>{item.car}</td>
          <td>
            R$ {parseFloat(item.price - item.discount).toFixed(2).toString().replace('.', ',')}
          </td>
          <td className="nowrap">
            <input type="hidden" ref="_id" value={item._id} />
            <a href={'/pedidos/form/'+ item._id} className="btn btn-primary"><i className="fa fa-edit"></i> Editar</a>
            <button type="button" onClick={this.rmItem} className="btn btn-danger"><i className="fa fa-close"></i> Remover</button>
          </td>
        </tr>
      );
    }
  });

  var EmptyRow = React.createClass({
    render: function() {
      return (
        <tr>
          <td colSpan="5">
            Não há resultados.
          </td>
        </tr>
      );
    }
  });

  var Table = React.createClass({
    render: function() {
      var search = api.changeSpecialChars(this.props.search)
        , rows = [];

      this.props.items.map(function(item, index) {

        if((new RegExp(search, "i")).test(item.orderNumber)
            || (new RegExp(search, "i")).test(item.car))
          rows.push(<TableRow item={item} key={index} />);
      });

      if(!rows.length) rows.push(<EmptyRow key="-1" />);

      return (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Placa</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      );
    }
  });

  var BodyCompose = React.createClass({
    getInitialState: function() {
      return { orders: [], search: '' };
    }
    , componentDidMount: function() {
      this.getContent();
    }
    , searchHandler: function(searchText) {
      this.setState({ search: searchText });
    }
    , getContent: function() {
      var self = this;
      api.ajax({
        url: this.props.url
        , method: 'GET'
        , success: function(data) {
          self.setState({ orders: [] });
          var orders = data.sort(api.orderByNumber);
          self.setState({ orders: orders });
        }
      });
    }
    , render: function() {
      return (
        <div>
          <SearchBar search={this.state.search} changeHandler={this.searchHandler} />
          <Table items={this.state.orders} search={this.state.search} />
        </div>
      );
    }
  });

  React.render(<BodyCompose url="/api/orders" />, document.querySelector('.react-body'));
})();
