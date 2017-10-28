if (window.ArrayCrud) {
	var tags = new ArrayCrud(
		"tags",
		[{name: "keyword", label: "Keyword"},{name: "color", label: "Color"},{name: "font-color", label: "Font color"}]
	);
	tags._load();

	var payvalue = new ArrayCrud(
		"payvalue",
		[{name: "from", label: "From", type: "date"},{name: "value", label: "Value"}]
	);
	payvalue._load();
}

[].forEach.call(document.querySelectorAll('[data-bind]'), function(input){
	bindInput(input);
});
