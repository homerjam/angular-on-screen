/*
    Name: angular-on-screen
    Description: Angular directive which checks if an element is within a certain range of viewport
    Usage: http://github.com/homerjam/angular-on-screen
    Author: jameshomer85@gmail.com
    Licence: MIT
*/
angular.module('angular-on-screen', []).directive('hjOnScreen', ['$window', '$document', '$timeout',
    function($window, $document, $timeout) {
        'use strict';
        return {
            restrict: 'AC',
            link: function($scope, $element, attrs) {

                var defaults = {
                    scroller: 'window',
                    scope: $scope,
                    range: 1000,
                    // rangeTop: 1000,
                    // rangeBottom: 1000,
                    // className: 'on-screen'
                };

                var options = angular.extend(defaults, $scope.$eval(attrs.hjOnScreen));

                var scope = options.scope,
                    scroller = options.scroller === 'window' ? $window : $document[0].querySelector(options.scroller),
                    latestKnownScrollY = 0,
                    ticking = false;

                scope.onScreen = false;

                var onScroll = function() {
                    latestKnownScrollY = options.scroller === 'window' ? scroller.scrollY : scroller.scrollTop;

                    requestTick();
                };

                var requestTick = function() {
                    if (!ticking) {
                        requestAnimationFrame(update);
                    }

                    ticking = true;
                };

                var update = function() {
                    ticking = false;

                    var currentScrollY = latestKnownScrollY,
                        elHeight = $element[0].scrollHeight,
                        elTopYPos = $element[0].offsetTop - currentScrollY,
                        elBottomYPos = elTopYPos + elHeight,
                        scrollerHeight = options.scroller === 'window' ? $window.innerHeight : scroller.clientHeight,
                        onScreen = !(elBottomYPos + (options.rangeTop || options.range) < 0 || elTopYPos - (options.rangeBottom || options.range) > scrollerHeight),
                        onScreenPercent;

                    if (elTopYPos > 0) {
                        onScreenPercent = Math.min(1, (scrollerHeight - elTopYPos) / elHeight);

                    } else if (elBottomYPos < scrollerHeight) {
                        onScreenPercent = Math.max(0, elBottomYPos / elHeight);

                    } else {
                        onScreenPercent = (elHeight + elTopYPos - (elBottomYPos - scrollerHeight)) / elHeight;
                    }

                    scope.onScreen = onScreen;
                    scope.onScreenPercent = onScreenPercent;

                    if (scope.onScreen !== scope.onScreenPrev) {
                        if (options.className) {                        
                            if (scope.onScreen) {
                                $element[0].classList.add(options.className);
                            } else {
                                $element[0].classList.remove(options.className);
                            }
                        }

                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }

                    scope.onScreenPrev = onScreen;
                };

                $timeout(update); // delay init incase of ngRepeats

                angular.element(scroller).on('scroll', onScroll);

                $scope.$on('$destroy', function() {
                    angular.element(scroller).off('scroll', onScroll);
                });

            }
        };
    }
]);