(function () {
    'use strict';

    function MiniListViewDirective(contentResource, memberResource, mediaResource) {

        function link(scope, el, attr, ctrl) {

            scope.search = "";
            scope.miniListViews = [];
            scope.breadcrumb = [];

            var miniListViewsHistory = [];
            var goingForward = true;
            var skipAnimation = true;

            function onInit() {
                open(scope.node);
            }

            function open(node) {

                goingForward = true;

                var miniListView = {
                    node: node,
                    loading: true,
                    pagination: {
                        pageSize: 10,
                        pageNumber: 1,
                        filter: '',
                        orderDirection: "Ascending",
                        orderBy: "SortOrder",
                        orderBySystemField: true
                    }
                };

                // clear and push mini list view in dom so we only render 1 view
                scope.miniListViews = [];
                scope.miniListViews.push(miniListView);

                // store in history so we quickly can navigate back
                miniListViewsHistory.push(miniListView);

                // get children
                getChildrenForMiniListView(miniListView);

                makeBreadcrumb();

            }

            function getChildrenForMiniListView(miniListView) {

                // start loading animation list view
                miniListView.loading = true;

                // setup the correct resource depending on section
                var resource = "";

                if (scope.entityType === "Member") {
                    resource = memberResource.getPagedResults;
                } else if (scope.entityType === "Media") {
                    resource = mediaResource.getChildren;
                } else {
                    resource = contentResource.getChildren;
                }

                resource(miniListView.node.id, miniListView.pagination)
                    .then(function (data) {
                        // update children
                        miniListView.children = data.items;
                        // update pagination
                        miniListView.pagination.totalItems = data.totalItems;
                        miniListView.pagination.totalPages = data.totalPages;
                        // stop load indicator
                        miniListView.loading = false;
                    });
            }

            scope.openNode = function(event, node) {
			    open(node);
                event.stopPropagation();
            };

            scope.selectNode = function(node) {
                if(scope.onSelect) {
                    scope.onSelect({'node': node});
                }
            };

            /* Pagination */
            scope.goToPage = function(pageNumber, miniListView) {
                // set new page number
                miniListView.pagination.pageNumber = pageNumber;
                // get children
                getChildrenForMiniListView(miniListView);
            };

            /* Breadcrumb */
            scope.clickBreadcrumb = function(ancestor) {

                var found = false;
                goingForward = false;

                angular.forEach(miniListViewsHistory, function(historyItem, index){
                    // We need to make sure we can compare the two id's. 
                    // Some id's are integers and others are strings.
                    // Members have string ids like "all-members".
                    if(historyItem.node.id.toString() === ancestor.id.toString()) {
                        // load the list view from history
                        scope.miniListViews = [];
                        scope.miniListViews.push(historyItem);
                        // clean up history - remove all children after
                        miniListViewsHistory.splice(index + 1, miniListViewsHistory.length);
                        found = true;
                    }
                });

                if(!found) {
                    // if we can't find the view in the history - close the list view
                    scope.exitMiniListView();
                }

                // update the breadcrumb
                makeBreadcrumb();

            };

            scope.showBackButton = function() {
                // don't show the back button if the start node is a list view
                if(scope.node.metaData && scope.node.metaData.IsContainer || scope.node.isContainer) {
                    return false;
                } else {
                    return true;
                }
            };

            scope.exitMiniListView = function() {
                miniListViewsHistory = [];
                scope.miniListViews = [];
                if(scope.onClose) {
                    scope.onClose();
                }
            };

            function makeBreadcrumb() {
                scope.breadcrumb = [];
                angular.forEach(miniListViewsHistory, function(historyItem){
                    scope.breadcrumb.push(historyItem.node);
                });
            }

            /* Search */
            scope.searchMiniListView = function(search, miniListView) {
                // set search value
                miniListView.pagination.filter = search;
                // reset pagination
                miniListView.pagination.pageNumber = 1;
                // start loading animation list view
                miniListView.loading = true;
                searchMiniListView(miniListView);
            };

            var searchMiniListView = _.debounce(function (miniListView) {
                scope.$apply(function () {
                    getChildrenForMiniListView(miniListView);
                });
            }, 500);

            /* Animation */
            scope.getMiniListViewAnimation = function() {

                // disable the first "slide-in-animation"" if the start node is a list view
                if(scope.node.metaData && scope.node.metaData.IsContainer && skipAnimation || scope.node.isContainer && skipAnimation) {
                    skipAnimation = false;
                    return;
                }

                if(goingForward) {
                    return 'umb-mini-list-view--forward';
                } else {
                    return 'umb-mini-list-view--backwards';
                }
            };

            onInit();

        }

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/components/umb-mini-list-view.html',
            scope: {
                node: "=",
                entityType: "@",
                startNodeId: "=",
                onSelect: "&",
                onClose: "&"
            },
            link: link
        };

        return directive;

    }

    angular.module('umbraco.directives').directive('umbMiniListView', MiniListViewDirective);

})();