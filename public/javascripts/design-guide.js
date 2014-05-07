(function () {

    'use strict';

    var app, util = designGuideUtil;

    var CONFIG;

    CONFIG = {
        CLASSNAME_HOVER: 'hove2',
        CLASSNAME_BOX: 'area',
        SELECTOR_BOX: '.area[data-box-index]',
        ARCHIVE_KEY: 'ls-design-guide-data'
    };

    app = angular.module('design-guide', ['ngSanitize']);

    app.directive('loading', function () {

        return {
            restrict: 'E',
            replace: true,
            scope: false,
            template: '<ul class="bokeh"><li></li><li></li><li></li><li></li><li></li></ul>'
        };
    });

    app.filter('layerBox', function ($filter, $sce) {

        return function (box, html, prefix) {

            var each;

            html = html ? html : [];

            prefix = prefix ? prefix : '';

            if (box.boxes) {
                for (var inx = 0; inx < box.boxes.length; inx++) {

                    each = box.boxes[inx];

                    html.push(' ' +
                        '<div data-box-index="' + prefix + inx + '"' +
                        ' class="' + CONFIG.CLASSNAME_BOX + (each.selected ? ' selected' : '') + '"' +
                        ' style="top:' + each.y + 'px;left:' + each.x + 'px;width:' + each.w + 'px;height:' + each.h + 'px"> ');

                    if (each.desc) {
                        html.push('<span class="has-info glyphicon glyphicon-comment"></span> ');
                    }

                    switch (each.guideType) {
                        case 'outer':
                            html.push('<div class="guide-outer"> ');
                            if (each.outerType == 'width' || each.outerType == 'width x height') {
                                html.push('<div class="guide-w guide-dir-' + each.guideAlignV + '"><em style="width:' + each.w + 'px"><div class="line-l" style="width:' + (each.w  / 2 - 20) + 'px"></div><span>' + each.w + '</span><div class="line-r" style="width:' + (each.w / 2 - 20) + 'px"></div></em></div>');    
                            }
                            if (each.outerType == 'height' || each.outerType == 'width x height') {
                                html.push('<div class="guide-h guide-dir-' + each.guideAlignH + '"><em style="height:' + each.h + 'px"><div class="line-t" style="height:' + (each.h  / 2 - 13) + 'px"></div><span>' + each.h + '</span><div class="line-b" style="height:' + (each.h / 2 - 13) + 'px"></div></em></div>');
                            }
                            html.push('</div> ');
                            break;
                        case 'inner':
                            html.push('<div class="guide-inner"><span>' + each.w + ' x ' + each.h + '</span></div>');
                            break;
                        case 'gap':
                            html.push('<div class="guide-gap"> ');
                            if (each.gapType == 'height') {
                                html.push('<div class="guide-h"><em style="height:' + each.h + 'px"><div class="line-t" style="height:' + (each.h  / 2 - 13) + 'px"></div><span>' + each.h + '</span><div class="line-b" style="height:' + (each.h / 2 - 13) + 'px"></div></em></div>');
                            } else {
                                html.push('<div class="guide-w"><em style="width:' + each.w + 'px"><div class="line-l" style="width:' + (each.w  / 2 - 20) + 'px"></div><span>' + each.w + '</span><div class="line-r" style="width:' + (each.w / 2 - 20) + 'px"></div></em></div>');
                            }
                            html.push('</div> ');
                        default:
                            break;

                    }

                    html.push('</div> ');

                    if (each.boxes) {
                        $filter('layerBox')(each, html, prefix + inx + ',');
                    }
                }

            }
            return $sce.trustAsHtml(html.join(' '));
        };

    }).filter('layerTree', function ($filter, $sce) {

        function hasConfiguredChild(box) {

            var inx;

            if (box.selected || box.name || box.guideType) {
                return true;
            }
            if (box.boxes) {
                for (inx = 0; inx < box.boxes.length; inx++) {
                    if (hasConfiguredChild(box.boxes[inx])) {
                        return true;
                    }
                }
            }
            return false;
        }

        return function (box, confOnly, html, prefix) {

            var each, display, inx;

            confOnly = confOnly ? confOnly : false;
            html = html ? html : [];
            prefix = prefix ? prefix : '';

            if (box.boxes) {
                html.push('<ul>');
                for (inx = 0; inx < box.boxes.length; inx++) {
                    each = box.boxes[inx];
                    display = !confOnly || hasConfiguredChild(each);
                    if (display) {
                        html.push('<li data-box-index="' + prefix + inx + '"> ');
                        html.push('<div class="' + (each.selected ? 'selected' : '') + '"> ');
                        html.push(each.name ? each.name : 'item ' + inx);
                        html.push('</div> ');
                        if (each.boxes) {
                            $filter('layerTree')(each, confOnly, html, prefix + inx + ',');
                        }
                        html.push('</li>');
                    }
                }
                html.push('</ul>');
            }
            return $sce.trustAsHtml(html.join(' '));
        };
    });

    app.controller('MainCtrl', function ($scope, $element, $http, $timeout) {

        var SUCCESS = 0;

        var view, imgEl, orgImgEl, _tmp;

        view = {
            uploadForm: $element.find('form'),
            inputFile: $element.find('input:file'),
            canvas: $element.find('canvas').get(0),
            ctx: null
        };

        _tmp = {
            orgImgEl: null,
            edgeImgEl: null,
            canvas: null,
            ctx: null
        };

        var _drag;

        _drag = {
            ondrag: false,
            frIndex: null,
            frIndex_: null
        };

        $scope.data = {
            srcImg: '/images/design_home_sma.png',
            canvas: {
                imgSrc: null,
                width: null,
                height: null
            },
            regions: [],
            box: {},
            jobType: 'divide',
            history: [],
            historyIndex: 0,
            panelWidth: 260
        };

        // select box
        $element.delegate('[data-box-index]', 'click', function (event) {

            $scope.$apply(function () {

                $scope.func.selectBox($(event.currentTarget).attr('data-box-index'));
            });

            event.stopPropagation();
        });

        // merge boxes
        $element.delegate(CONFIG.SELECTOR_BOX, 'mousedown', function (event) {



            if (_drag.ondrag === false) {
                _drag.ondrag = true;
                _drag.frIndex = $(event.currentTarget).attr('data-box-index');
                _drag.frIndex_ = _drag.frIndex.split(',');
            }

        }).delegate(CONFIG.SELECTOR_BOX, 'mousemove', function (event) {

            var range;

            if (_drag.ondrag) {
                range = getIndexRange(_drag.frIndex_, $(event.currentTarget).attr('data-box-index'));
                if (range) {
                    highlight(range);
                }
            }

        }).delegate(CONFIG.SELECTOR_BOX, 'mouseup', function (event) {

            var range, mergedIndex;

            if (_drag.ondrag) {
                range = getIndexRange(_drag.frIndex_, $(event.currentTarget).attr('data-box-index'));
                if (range) {
                    mergedIndex = merge(range);
                    $scope.$apply(function () {
                        $scope.func.selectBox(mergedIndex);
                    });
                }
            }

        });
        $(document.body).on('mouseup', function (event) {

            _drag.ondrag = false;
        });

        // canvas color picker
        $element.delegate('canvas[data-scaled]', 'mousemove', function(event) {

            var imgData = event.target.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data,
                rgb = '#' + (imgData[0]).toString(16) + (imgData[1]).toString(16) + (imgData[2]).toString(16);

            $scope.$apply(function() {
                $scope.data.colorPicked = rgb;
            });

        }).delegate('canvas[data-scaled]', 'mouseout', function(event) {

            $scope.$apply(function() {
                delete $scope.data.colorPicked ;
            });

        }).delegate('canvas[data-scaled]', 'click', function(event) {

            var imgData = event.target.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data,
                rgb = '#' + (imgData[0]).toString(16) + (imgData[1]).toString(16) + (imgData[2]).toString(16);

            if ($scope.data.selectedBox) {
                $scope.$apply(function() {
                    $scope.data.selectedBox.desc = $.trim($scope.data.selectedBox.desc) + ' ' + rgb;
                });    
            }
        });

        $scope.func = {

            // 작업내용 초기화
            clear: function () {

                $scope.func.unselectBox();
                $scope.data.box = {
                    x: 0,
                    y: 0,
                    w: imgEl.width,
                    h: imgEl.height
                };
                $scope.func.divide($scope.data.box);
            },

            // 작업내용 저장
            save: function () {

                localStorage.setItem(CONFIG.ARCHIVE_KEY, JSON.stringify({
                    srcImg: $scope.data.srcImg,
                    box: removeHiddenProp(JSON.parse(JSON.stringify($scope.data.box))),
                    showConfiguredOnly: $scope.data.showConfiguredOnly,
                    hideRect: $scope.data.hideRect
                }));

                alert('작업내용이 저장되었습니다.');
            },

            // 저장된 항목 불러오기
            load: function () {

                var data = localStorage.getItem(CONFIG.ARCHIVE_KEY);

                try {
                    data = JSON.parse(data);
                    $scope.data.srcImg = data.srcImg;
                    $scope.data.box = data.box;
                    $scope.data.showConfiguredOnly = data.showConfiguredOnly;
                    $scope.data.hideRect = data.hideRect;
                } catch (err) {
                    // noop
                }
            },

            // 박스 선택
            selectBox: function (index) {

                var target = getBoxByIndex(index);

                if (target) {
                    $scope.func.unselectBox();
                    $scope.data.selectedBox = target;
                    $scope.data.selectedBox.selected = true;
                    $scope.data.selectedIndex = index;

                    if (target.w < $scope.data.panelWidth) {
                        $scope.data.selectedBox._previewW = target.w;
                        $scope.data.selectedBox._previewH = target.h;
                    } else {
                        $scope.data.selectedBox._previewW = $scope.data.panelWidth;
                        $scope.data.selectedBox._previewH = parseInt(target.h * $scope.data.panelWidth / target.w, 10);
                    }

                    $timeout(function() {

                        var canvas = $('canvas[data-scaled]').get(0),
                            ctx = canvas.getContext('2d');

                        //ctx.fillStyle = 'blue';
                        ctx.drawImage(orgImgEl, target.x, target.y, target.w, target.h, 0,0,$scope.data.selectedBox._previewW, $scope.data.selectedBox._previewH);

                    });
                }
            },

            // 박스 선택 해제
            unselectBox: function () {

                if ($scope.data.selectedBox) {
                    delete $scope.data.selectedBox.selected;
                    $scope.data.selectedBox = null;
                    $scope.data.selectedIndex = null;
                }

            },

            // 박스 나누기
            divide: function (bbox) {

                var boxes, inx;

                if (typeof bbox == 'string') {
                    bbox = getBoxByIndex(bbox);
                }
                if (bbox) {

                    boxes = util.getBBox(imgEl, {
                        x: bbox.x,
                        y: bbox.y,
                        w: bbox.w,
                        h: bbox.h
                    }, bbox.dir);

                    if (boxes.length > 1) {
                        bbox.boxes = boxes;
                        $scope.data.history.push(JSON.stringify($scope.data.box));
                    }
                }
            },

            // 가이드 유형 선택
            setGuideType: function (guideType) {

                if ($scope.data.selectedBox) {

                    if (!$scope.data.selectedBox.setting) {
                        $scope.data.selectedBox.setting = {};
                    }

                    if (guideType == $scope.data.selectedBox.guideType) {
                        delete $scope.data.selectedBox.guideType;
                    } else {
                        $scope.data.selectedBox.guideType = guideType;
                        if (guideType == 'outer' && !$scope.data.selectedBox.outerType) {
                            $scope.data.selectedBox.outerType = 'width x height';
                        }
                        if (guideType == 'gap' && !$scope.data.selectedBox.gapType) {
                            $scope.data.selectedBox.gapType = 'height';
                        }
                        if (!$scope.data.selectedBox.guideAlignV) {
                            $scope.data.selectedBox.guideAlignV = 't';
                        }
                        if (!$scope.data.selectedBox.guideAlignH) {
                            $scope.data.selectedBox.guideAlignH = 'r';
                        }
                    }
                }
            },

            // 가이드 정렬
            setGuideAlign: function(direction) {

                var inx, dir;
                
                if ($scope.data.selectedBox) {
                    for (inx = 0; inx < direction.length; inx++) {
                        dir = direction.charAt(inx).toLowerCase();
                        switch (dir) {
                            case 't':
                            case 'b':
                                $scope.data.selectedBox.guideAlignV = dir;
                                break;
                            case 'l':
                            case 'r':
                                $scope.data.selectedBox.guideAlignH = dir;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        };

        $scope.$watch('data.srcImg', function (newValue, oldValue) {

            if (newValue) {

                util.loadImg(newValue, function (img, src) {

                    var _tmp = {};

                    orgImgEl = img;

                    _tmp.edgeImgEl = Pixastic.process(img, "brightness", {
                        brightness: -30,
                        contrast: 2
                    });
                    _tmp.edgeImgEl = Pixastic.process(_tmp.edgeImgEl, "edges", {
                        mono: true,
                        invert: true
                    });

                    _tmp.canvas = document.createElement('CANVAS');
                    _tmp.canvas.width = img.width;
                    _tmp.canvas.height = img.height;

                    _tmp.ctx = _tmp.canvas.getContext('2d');
                    _tmp.ctx.drawImage(img, 0, 0);

                    imgEl = _tmp.edgeImgEl;

                    if (!$scope.data.box || !$scope.data.box.boxes || $scope.data.box.boxes.length === 0) {
                        $scope.$apply(function () {
                            $scope.data.box = {
                                x: 0,
                                y: 0,
                                w: imgEl.width,
                                h: imgEl.height
                            };
                            $scope.func.divide($scope.data.box);
                        });
                    }
                });
            }
        });

        $scope.func.load();

        function getBoxByIndex(index) {

            var target = $scope.data.box,
                indexes = index.split(',');

            while (indexes.length > 0) {

                index = indexes.shift();
                if (index) {
                    target = target.boxes[index];
                }
            }

            return target;
        }

        function merge(range) {

            var box, target = getBoxByIndex(range.from.prefix);

            $scope.$apply(function () {

                box = target.boxes[range.from.value];
                box.w = target.boxes[range.to.value].x + target.boxes[range.to.value].w - box.x;
                box.h = target.boxes[range.to.value].y + target.boxes[range.to.value].h - box.y;
                delete box.boxes;
                target.boxes.splice(range.from.value, range.to.value - range.from.value + 1, box);
            });

            return range.from.index.join(',');
        }

        function highlight(range, className) {

            className = className ? className : CONFIG.CLASSNAME_HOVER;

            $element.find(CONFIG.SELECTOR_BOX).removeClass(CONFIG.CLASSNAME_HOVER + ' ' + className).each(function (index, item) {

                var that = $(item),
                    indexes = that.attr('data-box-index').split(','),
                    value = parseInt(indexes.pop(), 10),
                    prefix = indexes.join(',');

                if ((range.from.prefix <= prefix && range.from.value <= value) && (prefix <= range.to.prefix && value <= range.to.value)) {
                    that.addClass(className);
                }
            });
        }

        function getIndexRange(frIndex, toIndex) {

            var inx, idx1 = [],
                idx2 = [],
                range, _tmp;

            if (typeof frIndex == 'string') {
                frIndex = frIndex.split(',');
            }
            if (typeof toIndex == 'string') {
                toIndex = toIndex.split(',');
            }
            if (frIndex.join(',') == toIndex.join(',')) {
                return false;
            }

            for (inx = 0; inx < frIndex.length && inx < toIndex.length; inx++) {
                frIndex[inx] = parseInt(frIndex[inx], 10);
                toIndex[inx] = parseInt(toIndex[inx], 10);
                idx1.push(frIndex[inx]);
                idx2.push(toIndex[inx]);
                if (frIndex[inx] != toIndex[inx]) {
                    if (frIndex[inx] > toIndex[inx]) {
                        _tmp = idx1;
                        idx1 = idx2;
                        idx2 = _tmp;
                    }
                    break;
                }
            }

            range = {
                from: {
                    index: idx1,
                    prefix: idx1.join(',').split(','),
                    value: null
                },
                to: {
                    index: idx2,
                    prefix: idx2.join(',').split(','),
                    value: null
                }
            };

            if (range.from.index.join(',') == range.to.index.join(',')) {
                range = false;
            } else {
                range.from.value = parseInt(range.from.prefix.pop(), 10);
                range.from.prefix = range.from.prefix.join(',');
                range.to.value = parseInt(range.to.prefix.pop(), 10);
                range.to.prefix = range.to.prefix.join(',');
            }

            return range;
        }

        function removeHiddenProp(obj) {

            var inx;

            if (obj.boxes && obj.boxes.length) {
                for (inx = 0; inx < obj.boxes.length; inx++) {
                    removeHiddenProp(obj.boxes[inx]);
                }
            }
            if (obj.selected) {
                delete obj.selected;
            }
            return obj;
        }
    });

})();