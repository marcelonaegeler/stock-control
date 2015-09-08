(function() {
	"use strict";

	/*
	* Money input
	*/
	var MoneyInput = React.createClass({
		getInitialState: function() {
			return { value: this.props.val };
		}
		, componentDidMount: function() {
			VMasker(this.refs.input.getDOMNode()).maskMoney({
				precision: 2
				, separator: ','
				, delimiter: '.'
			});
		}
		, render: function() {
			return (
				<input type="text" className="form-control" ref="input" onChange={this.props.change} value={this.state.value} />
			)
		}
	});



	/*
	* Editable Table
	*/
	var EditableTable = React.createClass({
		mapHead: function(col, index) {
			return (<th key={index}>{col}</th>);
		}
		, render: function() {

			var search = api.changeSpecialChars(this.props.search)
				, self = this
				, rows = [];

			this.props.products.map(function(product, index) {
				var name = api.changeSpecialChars(product.name); // remove accents to compare

				if((new RegExp(search, "i")).test(name) || (new RegExp(search, "i")).test(product.code))
					rows.push(<EditableRow product={product} update={self.props.update} key={index} />);
			});

			if(!rows.length) rows.push(<NotFoundRow key="-1" />);

			return (
				<div className="row">
          <div className="col-sm-12">
						<div className="table-responsive">
							<table className="table editable" cellPadding="0" cellSpacing="0">
								<thead>
									<tr>
										{this.props.columns.map(this.mapHead)}
									</tr>
								</thead>
								<tbody>
									{rows}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			);
		}
	});

	var EditableRow = React.createClass({
		rmItem: function(event) {
			var _id = this.refs._id.getDOMNode().value;
			var self = this;

			if(!confirm('Deseja mesmo excluir este produto?')) return;

			api.ajax({
				method: 'POST'
				, url: '/api/product/remove'
				, data: { id: _id }
				, success: function(data) {
					return self.props.update();
				}
			});
		}
		, render: function() {
			return (
				<tr>
					<EditableCell update={this.props.update} prop={this.props.product.code} propName="code" productId={this.props.product._id} />
					<EditableCell update={this.props.update} prop={this.props.product.name} propName="name" productId={this.props.product._id} />
					<EditableCell update={this.props.update} prop={this.props.product.costPrice} propName="costPrice" productId={this.props.product._id} currencyField="true" />
					<EditableCell update={this.props.update} prop={this.props.product.sellPrice} propName="sellPrice" productId={this.props.product._id} currencyField="true" />
					<td>
						<input type="hidden" ref="_id" value={this.props.product._id} />
						<button type="button" onClick={this.rmItem} className="btn btn-danger"><i className="fa fa-close"></i> Remover</button>
					</td>
				</tr>
			);
		}
	});

	var NotFoundRow = React.createClass({
		render: function() {
			return (
				<tr>
					<td colSpan="5" style={{textAlign: 'center'}}>
						Não foram encontrados resultados.
					</td>
				</tr>
			);
		}
	});

	var EditableCell = React.createClass({
		getInitialState: function() {
			return { value: this.props.prop, tmpValue: this.props.prop };
		}
		, inputChange: function(event) {
			this.setState({ tmpValue: event.target.value });
		}
		, saveNewValue: function(event) {
			event.preventDefault();
			this.setState({ value: this.state.tmpValue });

			var data = {};
			data.field = this.props.propName;
			data.id = this.props.productId;
			data.value = this.state.tmpValue;

			var self = this;
			api.ajax({
				url: '/api/product/edit'
				, method: 'POST'
				, data: data
				, success: function(res) {
					self.props.update();
				}
			});
		}
		, editField: function() {
			var column = this.refs.column.getDOMNode();
			column.classList.toggle('open');
			this.setState({ tmpValue: this.state.value });
			if(column.classList.contains('open'))
				this.refs.input.getDOMNode().focus();
		}
		, componentDidMount: function() {
			if(this.props.currencyField) {
				VMasker(this.refs.input.getDOMNode()).maskMoney({
					precision: 2
					, separator: ','
					, delimiter: '.'
				});
			}
		}
		, render: function() {
			return (
				<td ref="column">
					<span className="field-label textAlign" onClick={this.editField} title="Clique para editar">
						{this.props.currencyField ? 'R$ ' : ''}{this.state.value}
					</span>
					<form className="form-inline field-editable" onSubmit={this.saveNewValue}>
						<input type="text" ref="input" className="form-control" onChange={this.inputChange} value={this.state.tmpValue} />
						<button type="submit" className="btn btn-success" title="Salvar"><i className="fa fa-check"></i></button>
						<button type="button" className="btn btn-danger" onClick={this.editField} title="Cancelar"><i className="fa fa-close"></i></button>
					</form>
				</td>
			);
		}
	});


	/*
	* Search Bar
	*/
	var SearchBar = React.createClass({
		changeHandler: function() {
			this.props.changeHandler(this.refs.searchInput.getDOMNode().value);
		}
		, render: function() {
			return (
				<div className="dataTables_filter form-inline">
					<label>
						Pesquisar:
						<input type="text" placeholder="Digite aqui..." className="form-control" ref="searchInput" value={this.props.search} onChange={this.changeHandler} />
					</label>
				</div>
			);
		}
	});

	/*
	* Product add form
	*/
	var ProductForm = React.createClass({
		submitHandler: function(event) {
			event.preventDefault();
			var self = this;
			var form = event.target;

			var name = this.refs.name.getDOMNode().value.trim()
				, code = this.refs.code.getDOMNode().value.trim()
				, stock = +this.refs.stock.getDOMNode().value.trim() || 0
				, costPrice = this.refs.costPrice.getDOMNode().value.trim() || 0
				, sellPrice = this.refs.sellPrice.getDOMNode().value.trim() || 0
				;

			if(!name || !code) return;

			var sent = {
				name: name
				, stock: stock
				, code: code
				, costPrice: costPrice
				, sellPrice: sellPrice
			};

			api.ajax({
				method: 'POST'
				, url: '/api/product/new'
				, data: sent
				, success: function(data) {
					form.reset();
					return self.props.submitHandler(sent);
				}
			});
		}
		, render: function() {
			return (
				<form onSubmit={this.submitHandler} style={{padding: '0 20px'}}>
					<div className="form-group">
						<label htmlFor="code" className="form-label">Código:</label>
						<input id="code" type="text" className="form-control" ref="code" />
					</div>
					<div className="form-group">
						<label htmlFor="name" className="form-label">Produto:</label>
						<input id="name" type="text" className="form-control" ref="name" />
					</div>
					<div className="form-group">
						<label htmlFor="costPrice" className="form-label">Preço de custo (R$):</label>
						<MoneyInput id="costPrice" ref="costPrice" />
					</div>
					<div className="form-group">
						<label htmlFor="sellPrice" className="form-label">Preço de venda (R$):</label>
						<MoneyInput id="sellPrice" ref="sellPrice" />
					</div>
					<div className="form-group">
						<label htmlFor="stock" className="form-label">Estoque:</label>
						<input id="stock" type="text" className="form-control" ref="stock" />
					</div>

					<button type="submit" className="btn btn-primary">Cadastrar</button>
      	</form>
			);
		}
	});

	/*
	* Compose body
	*/
	var BodyCompose = React.createClass({
		getInitialState: function() {
			return { products: [], search: '' };
		}
		// Get the content via Ajax
		, getContent: function() {
			var self = this;
			api.ajax({
				url: this.props.url
				, method: 'GET'
				, success: function(data) {
					self.setState({ products: [] });
					var products = data.sort(api.orderByName);
					self.setState({ products: products });
				}
			});
		}
		, order: function() {
			this.setState({ products: this.state.products.sort(api.orderByName) });
		}
		// Handle the search input changes
		, searchHandler: function(searchText) {
			this.setState({ search: searchText });
		}
		// Get Ajax content
		, componentDidMount: function() {
			this.getContent();
		}
		, render: function() {
			return (
				<div>
					<div className="row">
						<div className="col-sm-12">
							<div className="jumbotron ">
								<ProductForm submitHandler={this.getContent} />
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<SearchBar search={this.state.search} changeHandler={this.searchHandler} />
						</div>
						<div className="col-sm-6">

						</div>
					</div>
					<EditableTable products={this.state.products} columns={this.props.columns} search={this.state.search} update={this.getContent} order={this.order} />
				</div>
			);
		}
	});

	var showArea = document.querySelector('.react-body');
	var columns = [ 'Código', 'Nome', 'Valor de custo', 'Valor de venda', 'Remover' ];

	React.render(<BodyCompose url="/api/products" columns={columns} />, showArea);
})();
