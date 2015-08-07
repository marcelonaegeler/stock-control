(function() {
	"use strict";

	// Element that will show the table rows
	var showArea = document.querySelector('.react-body');

	var ProductRow = React.createClass({
		getInitialState: function() {
			return { name: '', defaultName: '', addValue: '', rmValue: '' };
		}
		, componentWillReceiveProps: function(props) {
			this.setState({ name: props.product.name, defaultName: props.product.name });
		}
		, submitAdd: function(event) {
			event.preventDefault();
			var stockAdd = this.state.addValue
				, _id = this.refs._id.getDOMNode().value
				, self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/stock/add'
				, data: { stock: stockAdd, id: _id }
				, success: function(data) {
					self.setState({ addValue: '' });
					return self.props.update();
				}
			});
		}
		, submitRm: function(event) {
			event.preventDefault();
			var stockRm = this.state.rmValue
				, _id = this.refs._id.getDOMNode().value;
			var self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/stock/rm'
				, data: { stock: stockRm, id: _id }
				, success: function(data) {
					if(data.error)
						alert('Não foi possível remover '+ stockRm +' un. '+ (!data.stock ? 'Não há produtos em estoque.' : 'Existe apenas '+ data.stock +' un em estoque.'));
					self.setState({ rmValue: '' });
					return self.props.update();
				}
			});
		}
		, inputAddChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value >= 0) this.setState({ addValue: +event.target.value });
		}
		, inputRmChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value >= 0) this.setState({ rmValue: +event.target.value });
		}
		, keydown: function(event) {
			if(event.keyCode == 109 || event.keyCode == 189) return event.preventDefault();
		}
		, showHideEdit: function(event) {
			var col = this.refs.nameColumn.getDOMNode();
			col.classList.toggle('edit');
			if(col.classList.contains('edit')) this.refs.inputName.getDOMNode().focus();
		}
		, clickCancelRename: function() {
			this.setState({ name: this.state.defaultName });
			this.showHideEdit();
		}
		, inputNameChange: function(event) {
			this.setState({ name: event.target.value });
		}
		, submitName: function(event) {
			event.preventDefault();
			var name = this.state.name
				, _id = this.refs._id.getDOMNode().value
				, self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/product/edit'
				, data: { name: name, id: _id }
				, success: function(data) {
					self.showHideEdit();
					self.setState({ defaultName: self.state.name });
					return self.props.update();
					// return self.props.order();
				}
			});
		}
		, rmItem: function(event) {
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
		, componentDidMount: function() {
			this.setState({ name: this.props.product.name, defaultName: this.props.product.name });
		}
		, render: function() {
			var product = this.props.product;
			return (
				<tr>
					<td className="productName" ref="nameColumn">
						<span className="showName" title="Clique para editar" onClick={this.showHideEdit}>{this.state.name}</span>
						<div className="editName">
							<form onSubmit={this.submitName} className="form-inline">
								<input ref="inputName" value={this.state.name} onChange={this.inputNameChange} className="form-control" />
								<button type="submit" className="btn btn-success" title="Salvar"><i className="fa fa-check"></i></button>
								<button type="button" className="btn btn-danger" onClick={this.clickCancelRename} title="Cancelar"><i className="fa fa-remove"></i></button>
							</form>
						</div>
					</td>
					<td>{product.stock}</td>
					<td>
						<form onSubmit={this.submitAdd} className="form-inline">
							<input type="text" ref="add" className="form-control" value={this.state.addValue} onChange={this.inputAddChange} onKeyDown={this.keydown} />
							<button type="submit" className="btn btn-success"><i className="fa fa-check"></i></button>
						</form>
					</td>
					<td>
						<form onSubmit={this.submitRm} className="form-inline">
							<input type="text" ref="rm" className="form-control" value={this.state.rmValue} onChange={this.inputRmChange} onKeyDown={this.keydown} />
							<button type="submit" className="btn btn-danger"><i className="fa fa-remove"></i></button>
							<input type="hidden" ref="_id" value={product._id} />
						</form>
					</td>
					<td>
						<button type="button" className="btn btn-danger" onClick={this.rmItem}><i className="fa fa-remove"></i> Remover</button>
					</td>
				</tr>
			);
		}
	});

	var ProductNotFound = React.createClass({
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

	var ProductRows = React.createClass({
		render: function() {
			var rows = []
				, search = api.changeSpecialChars(this.props.search) // remove accents to compare
				, self = this;
			this.props.products.map(function(product, index) {
				var name = api.changeSpecialChars(product.name); // remove accents to compare

				if((new RegExp(search, "i")).test(name))
					rows.push(<ProductRow update={self.props.update} order={self.props.order} product={product} key={index} />);
			});

			if(!rows.length)
				rows.push(<ProductNotFound key="-1" />);

			return (
				<div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
							<table className="table" cellPadding="0" cellSpacing="0">
								<thead>
									<tr>
										<th>Produto</th>
										<th>Estoque</th>
										<th>Adicionar</th>
										<th>Remover</th>
										<th>Remover produto</th>
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
	
	var AddForm = React.createClass({
		clickHandler: function() {
			React.findDOMNode(this.refs.showHide).classList.toggle('open');
		}
		, submitHandler: function(event) {
			event.preventDefault();
			var self = this;

			var name = this.refs.name.getDOMNode()
				, stock = this.refs.stock.getDOMNode();
			var nameVal = name.value.trim()
				, stockVal = stock.value.trim();

			if(!nameVal) return;
			if(!stockVal) stockVal = 0;

			var sent = { name: nameVal, stock: stockVal };
			
			api.ajax({
				method: 'POST'
				, url: '/api/product/new'
				, data: sent
				, success: function(data) {
					name.value = "";
					stock.value = "";
					return self.props.submitHandler(sent);
				}
			});
		}
		, render: function() {
			return (
				<form className="form-inline text-right" onSubmit={this.submitHandler}>
					<label className="form-label">
						Produto: <input type="text" className="form-control" ref="name" />
					</label>
					<label className="form-label">
						Estoque: <input type="text" className="form-control" ref="stock" />
					</label>
					<button type="submit" className="btn btn-primary"><i className="fa fa-plus"></i></button>
      	</form>
				/*
				<div className="optionArea">
					<div className="wrapper">
						<button type="button" className="material-icons" onClick={this.clickHandler}>add</button>
						<div className="addProduct" ref="showHide">
							<form action="" id="addForm" onSubmit={this.submitHandler}>
								<label>Name: <input type="text" ref="name" /></label>
								<label>Stock: <input type="text" ref="stock" /></label>
								<button type="submit">Add</button>
							</form>
						</div>
					</div>
				</div>
				*/
			);
		}
	});
	
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
	      	//self.setState({ products: [] });
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
          	<div className="col-sm-6">
							<SearchBar search={this.state.search} changeHandler={this.searchHandler} />
						</div>
						<div className="col-sm-6">
							<AddForm submitHandler={this.getContent} />
						</div>
					</div>
					<ProductRows update={this.getContent} order={this.order} search={this.state.search} products={this.state.products} />
				</div>
			);
		}
	});
	
	React.render(<BodyCompose url="/api/products" />, showArea);
})();