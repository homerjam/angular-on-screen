# angular-on-screen

Angular directive which checks if an element is within a certain range of viewport

## Installation

`$ bower install angular-on-screen --save`

## Usage

	// `scroller` defaults to the window

	// optionally override `range` with `rangeTop` / `rangeBottom`

	// scope defaults to directive $scope but can be passed alternative object/scope to set properties on (eg. for ng-repeat)

	// if `className` is set this class will be applied to the directive $element if in range

	<div class="scroller" style="overflow: scroll">

		<div ng-repeat="image in images" hj-on-screen="{scroller: '.scroller', scope: image, range: 1000, className: 'on-screen'}">

			<img ng-if="image.onScreen" ng-src="{{image.src}}">

		</div>

	</div>

## License

MIT