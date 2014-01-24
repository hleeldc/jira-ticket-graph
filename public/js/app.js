angular.module('issue-graph', []).
	directive('svgContainer', function($document) {
		return function(scope, element, attrs) {
			scope.$watch(attrs.svgContainer, function(value) {
				element.html(
					'<object id="obj" type="image/svg+xml" data="' +
					value + '"></object>');
document.getElementById('obj').addEventListener('load', function(e) {
	e.target.contentDocument.addEventListener('click', function(e) {
		if (e.target.tagName == 'text') {
			console.log(e.target.textContent);
		};
	});

});
			});
		}
	});

