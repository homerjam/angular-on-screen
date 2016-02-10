(function () {
  'use strict';

  /**
   * Name: angular-on-screen
   * Description: Angular directive which checks if an element is within a certain range of viewport
   * Usage: http://github.com/homerjam/angular-on-screen
   * Author: jameshomer85@gmail.com
   * Licence: MIT
   */

  angular.module('hj.onScreen', [])

    .directive('hjOnScreen', ['$window', '$document', '$timeout',
      function ($window, $document, $timeout) {
        return {
          restrict: 'AC',
          link: function ($scope, $element, attrs) {
            var defaults = {
              scroller: 'window',
              scope: $scope,
              range: 1000,
              onUpdate: function ($el, $scope) {},
              onChange: function ($el, $scope) {},
              once: false,
            //   rangeTop: 1000,
            //   rangeBottom: 1000,
            //   className: 'on-screen',
            };

            var options = angular.extend(defaults, $scope.$eval(attrs.hjOnScreen));

            var scope = options.scope;
            var scroller = options.scroller === 'window' ? $window : $document[0].querySelector(options.scroller);
            var latestKnownScrollY = 0;

            scope.$onScreen = false;

            var throttle = function (func) {
              var timeout;
              return function () {
                var context = this;
                var args = arguments;

                if ($window.requestAnimationFrame) {
                  $window.cancelAnimationFrame(timeout);
                  timeout = $window.requestAnimationFrame(function () {
                    func.apply(context, args);
                    timeout = null;
                  });

                } else {
                  $timeout.cancel(timeout);
                  timeout = $timeout(function () {
                    func.apply(context, args);
                    timeout = null;
                  }, 1000 / 16);
                }
              };
            };

            var update = function () {
              var currentScrollY = latestKnownScrollY;
              var elHeight = $element[0].scrollHeight;
              var elTopYPos = $element[0].offsetTop - currentScrollY;
              var elBottomYPos = elTopYPos + elHeight;
              var scrollerHeight = options.scroller === 'window' ? $window.innerHeight : scroller.clientHeight;
              var onScreen = !(elBottomYPos + (options.rangeTop || options.range) < 0 || elTopYPos - (options.rangeBottom || options.range) > scrollerHeight);
              var onScreenPercent;

              if (elTopYPos > 0) {
                onScreenPercent = Math.min(1, (scrollerHeight - elTopYPos) / elHeight);

              } else if (elBottomYPos < scrollerHeight) {
                onScreenPercent = Math.max(0, elBottomYPos / elHeight);

              } else {
                onScreenPercent = (elHeight + elTopYPos - (elBottomYPos - scrollerHeight)) / elHeight;
              }

              scope.$onScreen = onScreen;
              scope.$onScreenPercent = onScreenPercent;

              if (scope.$onScreen !== scope.$onScreenPrev) {
                if (options.className) {
                  if (scope.$onScreen) {
                    $element[0].classList.add(options.className);
                  } else {
                    $element[0].classList.remove(options.className);
                  }
                }

                options.onChange($element[0], scope);
              }

              scope.$onScreenPrev = onScreen;

              options.onUpdate($element[0], scope);

              if (options.once && onScreen) {
                onDestroy();
              }
            };

            var throttledUpdate = throttle(update);

            var onScroll = function () {
              latestKnownScrollY = options.scroller === 'window' ? scroller.scrollY : scroller.scrollTop;

              throttledUpdate(update);
            };

            var onDestroy = function () {
              angular.element(scroller).off('scroll', onScroll);
            };

            var init = function () {
              update();
            };

            angular.element(scroller).on('scroll', onScroll);

            $scope.$on('$destroy', onDestroy);

            $timeout(init); // delay init incase of ngRepeats

          }
        };
      }
    ]);

})();
