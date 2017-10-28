/**
 * Persistent array class for google chrome extensions
 *
 * @author DraCzris <draczris@gmail.com>
 */
;(function(){
	var Def = function(){ return constructor.apply(this,arguments); }
	var attr = Def.prototype;

	// list the attributes
	attr.dataSource = null;
	attr.template = null;
	attr.namespace = "";

	/**
	 * Constructor of persistable array
	 */
	function constructor(namespace, template) {

		this.namespace = namespace;
		this.template = template;

		// TODO: refactor and clean this closure
		var that = this;
		var loadingF = function(){console.log("Loading " + that.namespace);};
		var loadedF = function(){that.refresh(); console.log("Loaded " + that.namespace);};
		var savedF = function(){that.refresh(); console.log("Saved " + that.namespace);};


		this.dataSource = new PersistentArray(
			namespace,
			{
				loading: loadingF,
				loaded: loadedF,
				saved: savedF
			}
		);

	}

	/**
	 * DATA MANIPULATION
	 */
	attr.remove = function(id) {
		this.dataSource.remove(id);
	}

	attr.add = function(newItem) {
		this.dataSource.add(newItem);
	}

	/**
	 * RENDERING
	 */
	attr.refresh = function() {
		// clear
		this.getContainerEl().innerHTML = "";

		this.getContainerEl().appendChild(this.prepareRender());
	}

	attr.prepareRender = function() {
		var container = document.createElement('div');
		container.id = this.getDivId();

		// form wrapper
		var form = document.createElement('form');
		form.name = this.getFormId();
		form.id = this.getFormId();
		form.method = 'POST';
		form.action = '';
		container.appendChild(form);

		table = document.createElement('table');
		table.classList.add('table')
		form.appendChild(table);

		// header
		thead = document.createElement('thead');
		table.appendChild(thead);

		tr = document.createElement('tr');
		thead.appendChild(tr);

		for (var i = 0; i < this.template.length; i++) {
			var iTemplate = this.template[i];

			this.createTh(iTemplate.label, tr);
		}

		// remove action
		this.createTh("Actions", tr);

		// items
		tbody = document.createElement('tbody');
		table.appendChild(tbody);

		for (var i = 0; i < this.dataSource.size(); i++) {
			tr = document.createElement('tr');
			tbody.appendChild(tr);

			var item = this.dataSource.getAll()[i];

			for (var x = 0; x < this.template.length; x++) {
				var iTemplate = this.template[x];

				this.createTd(item[iTemplate.name], tr);
			}

			// delete button
			var td = this.createTd("", tr);
			var button = document.createElement('span');
			button.innerHTML = '&times;';
			button.id = this.getDeleteId(i);
			button.classList.add('btn');
			button.classList.add('btn-danger');

			// add item callback
			button.onclick = (function(id, that) {
				return function() {
					that.remove(id);
					return false;
				};
			})(i, this);

			td.appendChild(button);
		}

		tbody.appendChild(this.prepareRenderAddNewRow(form));

		return container;
	}

	attr.prepareRenderAddNewRow = function(form) {

		var tr = document.createElement('tr');

		for (var i = 0; i < this.template.length; i++) {
			var iTemplate = this.template[i];

			var td = this.createTd("", tr);

			var input = document.createElement('input');
			input.type = typeof iTemplate.type !== 'undefined' ? iTemplate.type : "text";
			input.name = iTemplate.name;
			input.classList.add('form-control');
			td.appendChild(input);
		}

		// submit button
		var td = this.createTd("", tr);
		var submit = document.createElement('input');
		submit.type = "submit";
		submit.value = "+";
		submit.id = this.getSubmitId();
		submit.classList.add('btn');
		submit.classList.add('btn-primary');
		
		// add item callback
		var that = this;
		submit.onclick = function() {
			var item = {};

			for (var i = 0; i < that.template.length; i++) {
				var iTemplate = that.template[i];

				item[iTemplate.name] = document[that.getFormId()][iTemplate.name].value;
			}

			that.add(item);

			return false;
		}

		td.appendChild(submit);
		return tr;
	}

	/**
	 * UTILS
	 */

	attr.createTd = function(html, parent) {return this.createElementWithContentAsChildOf("td", html, parent);}
	attr.createTh = function(html, parent) {return this.createElementWithContentAsChildOf("th", html, parent);}

	attr.createElementWithContentAsChildOf = function(elType, html, parent) {
		var el = document.createElement(elType);
		el.innerHTML = html;
		parent.appendChild(el);

		return el;
	}

	attr.getContainerEl = function() {return document.getElementById(this.getContainerId());}

	attr.getFormId = function() {return this.getNamespacedId("form");}
	attr.getContainerId = function() {return this.getNamespacedId("container");}
	attr.getDivId = function() {return this.getNamespacedId("div");}
	attr.getSubmitId = function() {return this.getNamespacedId("submit");}
	attr.getDeleteId = function(id) {return this.getNamespacedId( id + "_delete");}

	attr.getNamespacedId = function(postfix) {
		return this.namespace + "_" + postfix;
	}

	attr._clear = function() {
		this.dataSource._clear();
	}

	attr._load = function() {
		this.dataSource._load();
	}

	window.ArrayCrud = Def;
})();
