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

    app = angular.module('design-guide', ['ngSanitize', 'ui.bootstrap', function ($provide) {

        return $provide.decorator('$rootScope', [
            '$delegate', function ($delegate) {
            $delegate.safeApply = function (fn) {
                var phase = $delegate.$$phase;
                if (phase === "$apply" || phase === "$digest") {
                    if (fn && typeof fn === 'function') {
                        fn();
                    }
                } else {
                    $delegate.$apply(fn);
                }
            };
            return $delegate;
        }]);
    }]);

    app.directive('loading', function () {

        return {
            restrict: 'E',
            replace: true,
            scope: false,
            template: '<ul class="bokeh"><li></li><li></li><li></li><li></li><li></li></ul>'
        };
    }).directive('ruler', function () {

        return {
            restrict: 'E',
            replace: true,
            scope: false,
            template: '<div class="ruler"></div>',
            controller: function($scope, $element) {

                var type = $element.attr('type'),
                    limit = parseInt($element.attr('limit'), 10) / 100, html = [], inx;

                if (!limit || isNaN(limit)) {
                    limit = 50;
                }
                if (type == 'horizontal') {
                    $element.addClass('ruler-h');
                } else {
                    $element.addClass('ruler-v');
                }
                for (inx = 0; inx < limit; inx++) {
                    if (type == 'horizontal') {
                        html.push('<div style="left:' + (inx * 100 + 3) + 'px;top:1px">' + (inx * 100) + '</div>');    
                    } else {
                        html.push('<div style="top:' + (inx * 100 + 1) + 'px;left:3px">' + (inx * 100) + '</div>');    
                    }
                }
                $element.append(html.join(''));
            }
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
                        html.push('<div class="comment-box"> ');
                        html.push('<span class="has-info glyphicon glyphicon-comment"></span> ');
                        html.push('<div class="balloon"><pre>' + each.desc + '</pre></div> ');
                        html.push('</div> ');
                    }

                    switch (each.guideType) {
                        case 'outer':
                            html.push('<div class="guide-outer"> ');
                            if (each.outerType == 'width' || each.outerType == 'width x height') {
                                html.push('<div class="guide-w guide-dir-' + each.guideAlignV + '"><em style="width:' + each.w + 'px"><div class="line-l" style="width:' + (each.w / 2 - 20) + 'px"></div><span>' + each.w + '</span><div class="line-r" style="width:' + (each.w / 2 - 20) + 'px"></div></em></div>');
                            }
                            if (each.outerType == 'height' || each.outerType == 'width x height') {
                                html.push('<div class="guide-h guide-dir-' + each.guideAlignH + '"><em style="height:' + each.h + 'px"><div class="line-t" style="height:' + (each.h / 2 - 13) + 'px"></div><span>' + each.h + '</span><div class="line-b" style="height:' + (each.h / 2 - 13) + 'px"></div></em></div>');
                            }
                            html.push('</div> ');
                            break;
                        case 'inner':
                            html.push('<div class="guide-inner"><span>' + each.w + ' x ' + each.h + '</span></div>');
                            break;
                        case 'gap':
                            html.push('<div class="guide-gap"> ');
                            if (each.gapType == 'height') {
                                html.push('<div class="guide-h"><em style="height:' + each.h + 'px"><div class="line-t" style="height:' + (each.h / 2 - 13) + 'px"></div><span>' + each.h + '</span><div class="line-b" style="height:' + (each.h / 2 - 13) + 'px"></div></em></div>');
                            } else {
                                html.push('<div class="guide-w"><em style="width:' + each.w + 'px"><div class="line-l" style="width:' + (each.w / 2 - 20) + 'px"></div><span>' + each.w + '</span><div class="line-r" style="width:' + (each.w / 2 - 20) + 'px"></div></em></div>');
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
                html.push('<ul class="list-group">');
                for (inx = 0; inx < box.boxes.length; inx++) {
                    each = box.boxes[inx];
                    display = !confOnly || hasConfiguredChild(each);
                    if (display) {
                        html.push('<li class="list-group-item" data-box-index="' + prefix + inx + '"> ');
                        html.push('<div class="' + (each.selected ? 'selected' : '') + '"> ');
                        html.push(each.name ? each.name : 'item ' + inx);
                        if (each.guideType) {
                            html.push('<span class="glyphicon glyphicon-resize-vertical"></span>');
                        }
                        if (each.desc) {
                            html.push('<span class="glyphicon glyphicon-comment"></span>');
                        }
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
    }).filter('markupSkeleton', function ($filter, $sce) {

        function hasNamedChild(box) {

            var inx;

            if (box.name) {
                return true;
            }
            if (box.boxes) {
                for (inx = 0; inx < box.boxes.length; inx++) {
                    if (hasNamedChild(box.boxes[inx])) {
                        return true;
                    }
                }
            }
            return false;
        }

        return function (box, html, indent, doNotClean) {

            var each, display, inx, newHtml;

            html = html ? html : [];
            indent = indent ? indent : '';

            if (box.boxes) {
                for (inx = 0; inx < box.boxes.length; inx++) {
                    each = box.boxes[inx];
                    display = hasNamedChild(each);
                    if (display) {
                        if (each.name) {
                            indent += '    ';
                            html.push('');
                            html.push(indent + '<!-- ' + each.name + ' -->');
                            html.push(indent + '<div>');
                            html.push(indent + '    <-- ');
                            html.push(indent + '        name : ' + each.name);
                            if (each.desc) {
                                html.push(indent + '        desc : ' + each.desc.replace(/\n/gm, ' ').replace(/\s+/gm, ' '));
                            }
                            if (each.guideType == 'outer' && each.outerType == 'width') {
                                html.push(indent + '        size (width) : ' + each.w);
                            } else if (each.guideType == 'outer' && each.outerType == 'height') {
                                html.push(indent + '        size (height) : ' + each.h);
                            } else {
                                html.push(indent + '        size : ' + each.w + ' x ' + each.h);
                            }
                            html.push(indent + '    -->');
                        }

                        if (each.boxes) {
                            $filter('markupSkeleton')(each, html, indent, true);
                        }
                        if (each.name) {
                            html.push(indent + '</div>');
                            html.push(indent + '<!-- //' + each.name + ' -->');
                            html.push('');
                            indent = indent.replace(/^    /, '');
                        }
                    }
                }
            }

            if (!doNotClean) {
                newHtml = [];
                for (inx = 0; inx < html.length; inx++) {
                    html[inx] = html[inx].replace(/^    /, '');
                    if (newHtml.length === 0 && $.trim(html[inx]) === '') {
                        // skip - 첫줄에 공백인 경우 스킵
                    } else if (newHtml.length > 0 && newHtml[newHtml.length - 1] === '' && $.trim(html[inx]) === '') {
                        // skip - 두줄 연속 공백인 경우 스킵
                    } else {
                        newHtml.push(html[inx]);
                    }
                }
                return $sce.trustAsHtml(newHtml.join('\n'));
            } else {
                return $sce.trustAsHtml(html.join('\n'));
            }
        };
    });

    app.controller('MainCtrl', function ($scope, $element, $http, $timeout, $location, $filter, $modal) {

        var SUCCESS = 0;

        var view, imgEl, orgImgEl, _tmp, globalScope = $scope,
            _drag, search = $location.search();

        view = {
            uploadForm: $element.find('form'),
            inputFile: $element.find('input:file'),
            magnify: {
                canvas: $element.find('canvas.magnify').get(0),
                ctx: null
            }
        };
        view.magnify.ctx = view.magnify.canvas.getContext('2d');
        view.magnify.ctx.strokeStyle = 'red';

        _tmp = {
            orgImgEl: null,
            edgeImgEl: null,
            canvas: null,
            ctx: null
        };

        _drag = {
            ondrag: false,
            frIndex: null,
            frIndex_: null
        };

        $scope.data = {
            _workName: null,
            _workId: null,
            srcImg: '/images/design_home_smb.png',
            //srcImg: '/images/design_home.jpg',
            box: {},
            history: [],
            historyIndex: 0,
            panelWidth: 400,
            recentFiles: []
        };

        $scope.$watch('data._workId', function (newValue, oldValue) {

            if (newValue) {
                $location.search({
                    workId: newValue
                }).replace();
            } else {
                $location.search({}).replace();
            }
        });

        $scope.$watch('data.selectedIndex', function (newValue, oldValue) {

            if (newValue) {
                $timeout(function () {

                    $(window).on('scroll.connectLine resize.connectLine', function () {

                        util.connectLine($('.panel-selected'), $('.area[data-box-index="' + newValue + '"]'));
                    }).trigger('scroll.connectLine');
                });
            } else {
                $(window).off('scroll.connectLine resize.connectLine');
            }
        });

        $scope.$watch('data.box', function(newValue, oldValue) {

            if (newValue) {
                $scope.data.markup = $filter('markupSkeleton')(newValue);
            }

        }, true);

        // select box
        $element.delegate('[data-box-index]', 'click', function (event) {

            $scope.$root.safeApply(function () {

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
                    $scope.$root.safeApply(function () {
                        $scope.func.selectBox(mergedIndex);
                    });
                }
            }

        });
        $(document.body).on('mouseup', function (event) {

            _drag.ondrag = false;
        });

        // canvas color picker
        $element.delegate('canvas[data-scaled]', 'mousemove', function (event) {

            var W = 7,
                H = 7;

            var imgData = event.target.getContext('2d').getImageData(event.offsetX - ((W - 1) / 2), event.offsetY - ((H - 1) / 2), W, H).data,
                eW = parseInt(view.magnify.canvas.width / W, 10),
                eH = parseInt(view.magnify.canvas.height / H, 10),
                ynx, xnx, inx, rgb;

            for (ynx = 0; ynx < H; ynx++) {
                for (xnx = 0; xnx < W; xnx++) {
                    inx = (ynx * W + xnx) * 4;
                    rgb = 'rgb(' + imgData[inx] + ',' + imgData[inx + 1] + ',' + imgData[inx + 2] + ')';
                    view.magnify.ctx.fillStyle = rgb;
                    view.magnify.ctx.fillRect(xnx * eW, ynx * eH, eW, eH);
                }
            }
            view.magnify.ctx.rect(eW * ((W - 1) / 2) + 0.5, eH * ((H - 1) / 2) + 0.5, eW - 1, eH - 1);
            view.magnify.ctx.stroke();

            $scope.$root.safeApply(function () {

                var r, g, b;
                imgData = event.target.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;
                r = (imgData[0]).toString(16);
                g = (imgData[1]).toString(16);
                b = (imgData[2]).toString(16);
                r += (r.length < 2 ? '0' : '');
                g += (g.length < 2 ? '0' : '');
                b += (b.length < 2 ? '0' : '');
                $scope.data.colorPicked = '#' + r + g + b;
            });

        }).delegate('canvas[data-scaled]', 'mouseout', function (event) {

            $scope.$root.safeApply(function () {
                delete $scope.data.colorPicked;
            });

        }).delegate('canvas[data-scaled]', 'click', function (event) {

            if ($scope.data.selectedBox && $scope.data.colorPicked) {
                $scope.$root.safeApply(function () {
                    $scope.data.selectedBox.desc = $.trim($scope.data.selectedBox.desc) + ' ' + $scope.data.colorPicked;
                });
            }
        });

        $scope.func = {

            // 신규 작업 시작
            createNew: function() {

                $scope.func.clear();
                $scope.data._workId = null;
                $scope.data._workName = null;
            },

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

            // 작업재용 삭제
            remove: function () {

                if ($scope.data._workId) {

                    if (confirm('삭제하시겠습니가?')) {

                        $http.delete('/work/' + $scope.data._workId).success(function () {

                            $scope.func.createNew();
                        });
                    }
                }
            },

            // 작업내용 저장
            save: function () {

                var modalInstance;

                modalInstance = $modal.open({
                    templateUrl: '/modal/saveAs',
                    size: 'sm',
                    controller: function ($scope, $modalInstance, $http, content, workId, name) {

                        $scope.data = {
                            workId: workId,
                            name: name,
                            content: JSON.stringify(content)
                        };

                        $scope.func = {
                            save: function (saveAsNew) {

                                var url = '/work';

                                if (!saveAsNew && $scope.data.workId) {
                                    url += '/' + $scope.data.workId;
                                }

                                $http.post(url, {
                                    name: $scope.data.name,
                                    content: $scope.data.content
                                }).success(function (data) {

                                    if (data.code == 200) {

                                        $modalInstance.close({
                                            workId: data.result.id,
                                            workName: $scope.data.name
                                        });
                                    } else {
                                        alert(data.message);
                                    }
                                });
                            },
                            cancel: function () {

                                $modalInstance.dismiss('cancel');
                            }
                        };
                    },
                    resolve: {
                        workId: function () {

                            return globalScope.data._workId;
                        },
                        name: function () {

                            return globalScope.data._workName;
                        },
                        content: function () {

                            return {
                                srcImg: $scope.data.srcImg,
                                box: removeHiddenProp(JSON.parse(JSON.stringify($scope.data.box))),
                                showConfiguredOnly: $scope.data.showConfiguredOnly,
                                hideRect: $scope.data.hideRect
                            };
                        }
                    }
                });

                modalInstance.result.then(function (info) {

                    if (info && info.workId) {
                        globalScope.data._workName = info.workName ? info.workName : 'noname';
                        globalScope.data._workId = info.workId;
                    }
                });
            },

            // 저장된 항목 불러오기
            browse: function () {

                var modalInstance;

                modalInstance = $modal.open({
                    templateUrl: '/modal/browse',
                    controller: function ($scope, $modalInstance, $http) {

                        $scope.data = {
                            files: []
                        };

                        $scope.func = {
                            load: function (file) {
                                $http.get('/work/' + file.workId).success(function (data) {

                                    if (data.code == 200) {
                                        globalScope.func.load(data.result.content, file.workId, file.filename);
                                        $modalInstance.close();
                                    } else {
                                        alert(data.message);
                                    }
                                });
                            },
                            cancel: function () {
                                $modalInstance.dismiss('cancel');
                            }
                        };
                        $http.get('/work').success(function (data) {

                            if (data.code == 200) {
                                $scope.data.files = data.result.files;
                            } else {
                                alert(data.message);
                            }
                        });
                    }
                });
            },

            loadByWorkId: function(workId) {

                $http.get('/work/' + search.workId).success(function (data) {

                    if (data.code == 200) {
                        $scope.func.load(data.result.content, search.workId, data.result.filename);
                    }
                });
            },

            // 저장된 항목 불러오기 (문자열)
            load: function (data, workId, name) {

                $scope.data.recentFiles.unshift({
                    workId: workId,
                    workName: name,
                    time: new Date()
                });

                try {
                    $scope.func.unselectBox();
                    data = JSON.parse(data);
                    $scope.data.srcImg = data.srcImg;
                    $scope.data.box = data.box;
                    $scope.data.showConfiguredOnly = data.showConfiguredOnly;
                    $scope.data.hideRect = data.hideRect;
                    if (workId) {
                        $scope.data._workName = name ? name : 'noname';
                        $scope.data._workId = workId;
                    }
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

                    $timeout(function () {

                        var canvas = $('canvas[data-scaled]').get(0),
                            ctx = canvas.getContext('2d');

                        //ctx.fillStyle = 'blue';
                        ctx.drawImage(orgImgEl, target.x, target.y, target.w, target.h, 0, 0, $scope.data.selectedBox._previewW, $scope.data.selectedBox._previewH);

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
            setGuideAlign: function (direction) {

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
                    $scope.data.imgWidth = imgEl.width;
                    $scope.data.imgHeight = imgEl.height;

                    if (!$scope.data.box || !$scope.data.box.boxes || $scope.data.box.boxes.length === 0) {
                        $scope.$root.safeApply(function () {
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

        // 최초 인입시 파라미터값 확인 (작업ID 가 있으면 로드)
        if (search && search.workId) {

            $scope.func.loadByWorkId(search.workId);
        }
        //$scope.func.load();

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

            $scope.$root.safeApply(function () {

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