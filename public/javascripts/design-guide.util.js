var designGuideUtil;

(function () {

    var _history;

    var CONFIG;

    CONFIG = {
        THRESHOLD: 25,
        PADDING_H: 0
    };

    _history = {
        storage: [],
        target: null,
        index: 0,
        sync: function () {

            return;

            if (this.index < 1) {
                view.button.undo.attr('disabled', 'disabled');
                view.button.undo.css('background-color', 'silver');
                view.button.undo.text('undo');
            } else {
                view.button.undo.removeAttr('disabled');
                view.button.undo.css('background-color', '#eee');
                view.button.undo.text('undo : ' + this.index);
            }
            if (this.index + 1 > this.storage.length - 1) {
                view.button.redo.attr('disabled', 'disabled');
                view.button.redo.css('background-color', 'silver');
                view.button.redo.text('redo');
            } else {
                view.button.redo.removeAttr('disabled');
                view.button.redo.css('background-color', '#eee');
                view.button.redo.text('redo : ' + (this.storage.length - this.index - 1));
            }
        },
        _getSnapshot: function () {

            /*var inx, each, snapshot = [];

            for (inx = 0; inx < itemList.length; inx++) {
                each = {
                    cid: itemList[inx].cid,
                    fcAppId: itemList[inx].fcAppId,
                    title: itemList[inx].title,
                    json: itemList[inx].json,
                    isBundle: itemList[inx].isBundle
                };
                snapshot.push(each);
            }*/


            return JSON.stringify(this.target);
        },
        setup: function (data) {

            this.target = data;
            this.storage = [];
            this.storage.push(this._getSnapshot());
            this.index = this.storage.length - 1;
            this.sync();
        },
        put: function () {

            var prev = this.storage[this.index],
                curr = this._getSnapshot(), inx, a1, a2;

            if (prev != curr) {
                this.storage.splice(this.index + 1, this.storage.length - this.index - 1);
                this.storage.push(curr);
                this.index = this.storage.length - 1;
            }
            this.sync();
        },
        undo: function () {

            var selectedCid = selectedItem && selectedItem.cid ? selectedItem.cid : null;

            if (this.index < 1) {
                return;
            }
            unselect();
            this.index--;
            itemList = JSON.parse(this.storage[this.index]);
            render();
            if (selectedCid) {
                setSelectedItem(selectedCid);
            }
            this.sync();
        },
        redo: function () {

            var selectedCid = selectedItem && selectedItem.cid ? selectedItem.cid : null;

            if (this.index + 1 > this.storage.length - 1) {
                return;
            }
            unselect();
            this.index++;
            itemList = JSON.parse(this.storage[this.index]);
            render();
            if (selectedCid) {
                setSelectedItem(selectedCid);
            }
            this.sync();
        }
    };    

    function getPixel(imageData, x, y) {

        var pts = y * imageData.width * 4 + x * 4;

        return {
            x: x,
            y: y,
            r: imageData.data[pts],
            g: imageData.data[pts + 1],
            b: imageData.data[pts + 2]
        };
    }

    function getColorDiff(pixel1, pixel2) {

        return Math.sqrt(Math.pow(pixel1.r - pixel2.r, 2) + Math.pow(pixel1.g - pixel2.g, 2) + Math.pow(pixel1.b - pixel2.b, 2));
    };

    designGuideUtil = {

        history: _history,

        loadImg: function (src, callback) {

            var img = document.createElement('IMG');

            img.onload = function () {

                if (callback) {
                    callback(img, src);
                }
            };

            img.src = src;
        },

        getBBox: function (img, bounding, _dir) {

            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                imgData, x, y, w, h, pixel, pixel_prv, status, lines = [],
                boxes = [],
                lastIndex;

            _dir = _dir ? _dir : 'v';

            if (_dir == 'v') {
                w = bounding.w;
                h = bounding.h;
                canvas.width = bounding.w;
                canvas.height = bounding.h;
                ctx.drawImage(img, bounding.x, bounding.y, bounding.w, bounding.h, 0, 0, bounding.w, bounding.h);
            } else {
                w = bounding.h;
                h = bounding.w;
                canvas.width = bounding.h;
                canvas.height = bounding.w;
                ctx.translate(bounding.h, 0);
                ctx.rotate(Math.PI / 2);
                ctx.drawImage(img, bounding.x, bounding.y, bounding.w, bounding.h, 0, 0, bounding.w, bounding.h);
                ctx.rotate(Math.PI / -2);
                ctx.translate(-bounding.h, 0);
            }

            imgData = ctx.getImageData(0, 0, w, h);

            for (y = 0; y < h; y++) {

                status = {
                    color: null,
                    isEmpty: true
                };
                for (x = CONFIG.PADDING_H, pixel_prv = null; x < w - CONFIG.PADDING_H; x++) {

                    pixel = getPixel(imgData, x, y);
                    if (pixel_prv && getColorDiff(pixel, pixel_prv) > CONFIG.THRESHOLD) {
                        ctx.fillStyle = 'blue';
                        ctx.fillRect(x, y, 1, 1);
                        status.isEmpty = false;
                    }
                    if (pixel_prv === null) {
                        pixel_prv = pixel;
                    }
                    status.pixel = pixel;
                }

                if (!lastIndex || lastIndex.isEmpty != status.isEmpty || getColorDiff(lastIndex.pixel, status.pixel) > CONFIG.THRESHOLD) {

                    if (lastIndex && status.pixel.y - lastIndex.pixel.y > 2) {

                        if (_dir == 'v') {
                            boxes.push({
                                x: bounding.x,
                                y: lastIndex.pixel.y + bounding.y,
                                w: bounding.w,
                                h: status.pixel.y - lastIndex.pixel.y,
                                isEmpty: lastIndex.isEmpty,
                                dir: _dir == 'v' ? 'h' : 'v'
                            });
                        } else {
                            boxes.push({
                                x: lastIndex.pixel.y + bounding.x,
                                y: bounding.y,
                                w: status.pixel.y - lastIndex.pixel.y,
                                h: bounding.h,
                                isEmpty: lastIndex.isEmpty
                            });
                        }
                    }
                    lastIndex = status;
                }
            }

            return boxes;
        }
    };

})();