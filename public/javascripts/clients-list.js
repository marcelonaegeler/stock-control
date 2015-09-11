(function() {
  "use strict";

  var SearchBar = React.createClass({
		changeHandler: function() {
			this.props.changeHandler(this.refs.searchInput.getDOMNode().value);
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
      var cars = [];
      var propCars = this.props.item.car;

      var separe = function(index) {
        return ((index+1) != propCars.length) ? ', ' : '';
      };

      propCars.map(function(car, index) {
        cars.push(<span key={index}>{car.plate} ({car.model}){separe(index)}</span>);
      });
      if(!cars.length) cars.push(<span>Sem carros</span>);

      return (
        <tr>
          <td>{this.props.item.name}</td>
          <td>{this.props.item.phone}</td>
          <td>{cars}</td>
          <td className="nowrap">
            <input type="hidden" ref="_id" value={this.props.item._id} />
            <a href={'/clientes/form/'+ this.props.item._id} className="btn btn-primary"><i className="fa fa-edit"></i> Editar</a>
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
          <td colSpan="4">
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
        var name = api.changeSpecialChars(item.name); // remove accents to compare

        if((new RegExp(search, "i")).test(name))
          rows.push(<TableRow item={item} key={index} />);
      });

      if(!rows.length) rows.push(<EmptyRow key="-1" />);

      return (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Carros</th>
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
			return { clients: [], search: '' };
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
					self.setState({ clients: [] });
					var clients = data.sort(api.orderByName);
					self.setState({ clients: clients });
				}
			});
    }
    , render: function() {
      return (
        <div>
          <SearchBar search={this.state.search} changeHandler={this.searchHandler} />
          <Table items={this.state.clients} search={this.state.search} />
        </div>
      );
    }
  });

	React.render(<BodyCompose url="/api/clients" />, document.querySelector('.react-body'));
})();
