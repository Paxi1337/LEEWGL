LEEWGL.Lightbox = function(options) {
    this.options = {
        'id': 0,
        'standalone': false,
        'anchor': null,
        'resize': true,
        'link': true,
        'auto-group': true,
        'animation': true,
        'navigation-inside': false,
        'max-height': null,
        'max-width': null,
        'gallery-height': 100,
        'gallery-quantity': 6,
        'title-attribute': 'data-src'
    };

    this.lightbox = {
        'wrapper': null,
        'outer_container': null,
        'inner_container': null,
        'data_container': null,
        'nav_container': null
    };

    this.loading = null;
    this.overlay = null;

    this.images_src = [];
    this.thumbnails_src = [];

    this.img = {
        'img': null,
        'path': null,
        'coordinates': null
    };
    this.image_title = {
        'container': null,
        'text': null
    };
    this.image_desc = {
        'container': null,
        'text': null
    };
    this.gallery = {
        'container': null,
        'imgs': [],
        'next': null,
        'prev': null
    };

    this.next = null;
    this.prev = null;
    this.grouped = false;

    this.sizeFactor = 0.85;
    this.anchor = [];
    this.visible = false;
    this.current_image = 0;
    this.count = 0;
    this.resized = true;
    this.scroll = 0;
    this.initialized = false;

    var extend = new LEEWGL.Class();
    extend.extend(LEEWGL.Lightbox.prototype, LEEWGL.Options.prototype);

    this.setOptions(options);

    this.initialize = function() {
        if (this.options.standalone !== true) {
            var domElements = document.querySelectorAll(this.options.anchor);
            for (var i = 0; i < domElements.length; ++i) {

                this.anchor.push(new LEEWGL.DOM.Element(domElements[i]));
                console.log(this.anchor[i].getChildren('img'));

                if (this.options.link === true) {
                    this.images_src.push(this.anchor[i].get(this.options['title-attribute']));
                    this.thumbnails_src.push(this.anchor[i].getChildren('img')[0].get('src'));
                } else {
                    this.images_src.push(this.anchor[i].get('src'));
                }

                this.anchor[i].set('count', i);


                this.anchor[i].addEvent('click', function(event) {
                    var element = event.target;

                    if (this.options.link === true) {
                        element = (e.target.tagName === 'A') ? event.target : event.target.getParent();
                        this.img.path = element.get(this.options['title-attribute']);
                    } else {
                        element = (e.target.tagName === 'A') ? event.target.getChildren('img')[0] : event.target;
                        this.img.path = element.get('src');
                    }

                    this.image_title.text = element.get('title');
                    this.image_desc.text = element.get('rel');

                    if (this.initialized === false) {
                        this.current_image = (parseInt(element.get('count')));
                        if (this.options['auto-group'] === true) {
                            // / if there is more than one img on the current website
                            if (this.count > 1)
                                this.createGrouped();
                            else
                                this.create();
                        } else {
                            if (event.target.hasClass('grouped') === true)
                                this.createGrouped();
                            else
                                this.create();
                        }
                        this.initialized = true;
                    } else {
                        this.changeImage(element);
                    }
                    return false;
                }.bind(this));
            }
            this.count = this.anchor.length;
        } else {

        }
    };

    this.setupContainers = function() {
        this.lightbox.wrapper = new LEEWGL.DOM.Element('div', {
            'id': 'lb-' + this.options.id,
            'class': 'lb',
            'styles': {
                'display': 'none'
            }
        });

        this.lightbox.outer_container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-outer-' + this.options.id,
            'class': 'lb-outer'
        });

        this.lightbox.inner_container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-inner-' + this.options.id,
            'class': 'lb-inner'
        });

        this.lightbox.data_container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-data-' + this.options.id,
            'class': 'lb-data',
            'styles': {
                'opacity': '0'
            }
        });

        this.lightbox.wrapper.addEvent('click', function(e) {
            this.disappear();
            return false;
        }.bind(this));

        /**
         * close the lightbox by hitting 'esc'
         */
        window.addEvent('keydown', function(e) {
            if (e.key === 'esc') {
                this.lightbox.wrapper.dispatchEvent({
                    'type': 'click'
                });
                return false;
            }
        }.bind(this));

        /**
         * resize event
         */
        if (this.options.resize) {
            window.addEvent('resize', function(e) {
                if (this.resized === false && this.visible === true) {
                    this.resized = true;
                    this.lightbox.data_container.setStyle('opacity', 0);
                    this.scale();
                }
                return false;
            }.bind(this));
        }

        /**
         * insert elements into DOM
         */
        this.lightbox.wrapper.inject(document.body);
        this.lightbox.outer_container.inject(this.lightbox.wrapper);
        this.lightbox.inner_container.inject(this.lightbox.outer_container);

        if (this.image_title.text !== null && typeof this.image_desc.text !== null)
            this.lightbox.data_container.inject(this.lightbox.outer_container);
    };

    /**
     * [create description]
     * calls all functions needed to create a lightbox for one image
     */
    this.create = function() {
        this.grouped = false;
        this.setupContainers();
        this.addOverlay();
        this.addLoadingGif();
        this.addCloseIcon('close.png');
        this.addTitle();
        this.addDescription();
        this.addImage();
    };

    /**
     * [createGrouped description]
     * calls all functions needed to create a lightbox for a group of images
     */
    this.createGrouped = function() {
        this.grouped = true;
        this.setupContainers();
        this.addOverlay();
        this.addLoadingGif();
        this.addCloseIcon('close.png');
        this.addTitle();
        this.addDescription();
        this.addGallery();
        this.addNavigation();
        this.addImage();
    };

    /**
     * [addImage description]
     * Adds an image to the lightbox based on the 'src' attribute from anchor
     */
    this.addImage = function() {
        this.img.img = new LEEWGL.DOM.Element('img', {
            title: 'Click to close the image',
            src: this.img.path
        });

        this.img.img.inject(this.lightbox.inner_container, 'top');

        /**
         * img load event - gets called when image is loaded
         */
        this.img.img.addEvent('load', function() {
            // if (this.options.animation === true)
            // 	this.loading.tween('opacity', 0);
            // else
            this.loading.setStyle('opacity', 0);

            this.scale();
            this.display();
        }.bind(this));
    };

    /**
     * [changeImage description]
     * change the image without opening a new lightbox
     * @param {DOM.Element} image
     */
    this.changeImage = function(image) {
        var src = image.get(this.options['title-attribute']);

        this.image_title.text = image.get('title');
        this.image_desc.text = image.get('rel');
        // this.loading.tween('opacity', 1);

        var run = (function(src) {
            this.lightbox.inner_container.setStyle('opacity', 0);
            this.img.img.set('src', src);
            this.image_title.container.getChildren()[0].set('text', this.image_title.text);
            this.image_desc.container.getChildren()[0].set('text', this.image_desc.text);
        }.bind(this));

        // if (this.options.animation === true) {
        //     var fx = new Fx.Tween(this.lightbox.inner_container, {
        //         property: 'opacity',
        //         duration: 200,
        //         transition: Fx.Transitions.Sine.easeOut
        //     });
        //
        //     fx.start(1, 0).chain(function() {
        //         run.attempt(src);
        //     });
        // } else {
        run(src);
        // }

        if (this.gallery.container !== null)
            this.gallery.imgs[this.current_image].removeClass('active');

        this.img.img.dispatchEvent({
            'type': 'load'
        });

        if (this.current_image !== parseInt(image.get('count')))
            this.current_image = parseInt(image.get('count'));

        if (this.gallery.container !== null)
            this.gallery.imgs[this.current_image].addClass('active');
    };

    /**
     * [addCloseIcon description]
     * Function to add a close icon in the left upper edge
     * @param {string} src
     */
    this.addCloseIcon = function(src) {
        var path = LEEWGL.ROOT + 'img/icons/' + src;

        var close_icon = new LEEWGL.DOM.Element('div', {
            'id': 'lb-close-icon-' + this.options.id,
            'class': 'lb-close-icon',
            'title': 'click to close',
            styles: {
                'background-image': 'url(' + path + ')'
            }
        });

        close_icon.inject(this.lightbox.outer_container);
    };

    /**
     * [addOverlay description]
     * Adds an overlay to document.body
     */
    this.addOverlay = function() {
        this.overlay = new LEEWGL.DOM.Element('div', {
            'id': 'lb-overlay-' + this.options.id,
            'class': 'lb-overlay',
            styles: {
                // 'height': document.body.getScrollSize().y,
                'display': 'none',
                'opacity': 0
            }
        });
        this.overlay.inject(document.body, 'top');
    };

    /**
     * [addLoadingGif description]
     * adds a gif image when lightbox is loading
     */
    this.addLoadingGif = function() {
        this.loading = new LEEWGL.DOM.Element('div', {
            'id': 'lb-loading-' + this.options.id,
            'class': 'lb-loading',
            styles: {
                'top': 0,
                'left': 0
            }
        });

        this.loading.inject(this.lightbox.inner_container);
    };

    /**
     * [addTitle description]
     * Adds a title to the lightbox based on the 'title' attribute from anchor
     */
    this.addTitle = function() {
        this.image_title.container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-title-' + this.options.id,
            'class': 'lb-title'
        });

        if (this.image_title.text === null)
            return;

        var paragraph = new LEEWGL.DOM.Element('p');
        paragraph.set('text', this.image_title.text);
        paragraph.inject(this.image_title.container);
        this.image_title.container.inject(this.lightbox.data_container);
    };

    /**
     * [addDescription description]
     * Adds a description based on the 'rel' attribute from anchor
     */
    this.addDescription = function() {
        this.image_desc.container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-desc-' + this.options.id,
            'class': 'lb-desc'
        });

        if (this.image_desc.text === null)
            return;

        var paragraph = new LEEWGL.DOM.Element('p');
        paragraph.set('text', this.image_desc.text);
        paragraph.inject(this.image_desc.container);
        this.image_desc.container.inject(this.lightbox.data_container);
    };

    /**
     * [addNavigation description]
     * Adds two links to the nav-container with a background-graphic which gets visible when the user moves the mouse into the right or left side of the image
     */
    this.addNavigation = function() {
        /**
         * main nav container
         */
        this.lightbox.nav_container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-nav-' + this.options.id,
            'class': 'lb-nav'
        });

        if (this.options['navigation-inside'] === true)
            this.lightbox.nav_container.inject(this.lightbox.inner_container);
        else
            this.lightbox.nav_container.inject(this.lightbox.wrapper);

        /**
         * prev link
         */
        this.prev = new LEEWGL.DOM.Element('a', {
            'class': 'lb-prev',
            'href': '#',
        });

        this.prev.addEvent('click', function(e) {
            this.changeImage(this.gallery.imgs[this.current_image - 1]);
            return false;
        }.bind(this));
        this.prev.inject(this.lightbox.nav_container);

        /**
         * next link
         */
        this.next = new LEEWGL.DOM.Element('a', {
            'class': 'lb-next',
            'href': '#',
        });

        this.next.addEvent('click', function(e) {
            this.changeImage(this.gallery.imgs[this.current_image + 1]);
            return false;
        }.bind(this));
        this.next.inject(this.lightbox.nav_container);
    };

    /**
     * [addGalleryNavigation description]
     * Adds two links to the gallery container with a background-graphic which gets visible when the user moves the mouse into the right or left side of the image
     */
    this.addGalleryNavigation = function() {
        if (this.options['gallery-quantity'] >= this.count) {
            return;
        }

        this.gallery.prev = new LEEWGL.DOM.Element('a', {
            'class': 'lb-gallery-prev',
            'href': '#',
        });

        this.gallery.next = new LEEWGL.DOM.Element('a', {
            'class': 'lb-gallery-next',
            'href': '#',
        });

        this.gallery.prev.inject(this.gallery.container, 'top');
        this.gallery.next.inject(this.gallery.container, 'bottom');

        // var fx = new Fx.Scroll(this.gallery.container);

        this.gallery.prev.addEvent('click', function(e) {
            // fx.start(-this.gallery.container.getSize().x, 0);
            return false;
        }.bind(this));

        this.gallery.next.addEvent('click', function(e) {
            // fx.start(this.gallery.container.getSize().x, 0);
            return false;
        }.bind(this));
    };

    /**
     * [addGallery description]
     * Adds available pictures as thumbnails to the bottom of the lightbox container
     */
    this.addGallery = function() {
        this.gallery.container = new LEEWGL.DOM.Element('div', {
            'id': 'lb-gallery-' + this.options.id,
            'class': 'lb-gallery',
            styles: {
                'opacity': 0
            }
        });

        this.addGalleryNavigation();

        for (var i = 0; i < this.count; ++i) {
            this.gallery.imgs[i] = new LEEWGL.DOM.Element('img', {
                'class': 'lb-galleryimage',
                'src': (this.thumbnail_src === null) ? this.images_src[i] : this.thumbnail_src[i],
                'title': this.anchor[i].get('title'),
                'rel': this.anchor[i].get('rel'),
                'count': this.anchor[i].get('count'),
                styles: {
                    'height': this.options['gallery-height']
                }
            });

            this.gallery.imgs[i].set(this.options['title-attribute'], this.images_src[i]);

            if (i === (this.count - 1) && this.options.gallery_quantity >= this.count)
                this.gallery.imgs[i].addClass('last');

            this.gallery.imgs[i].addEvent('click', function(e) {
                this.gallery.imgs[this.current_image].removeClass('active');
                this.changeImage(e.target);
                return false;
            }.bind(this));

            if (this.options.link === true) {
                var link = new LEEWGL.DOM.Element('a', {
                    'href': this.images_src[i]
                });

                this.gallery.imgs[i].inject(link);
                link.inject(this.gallery.container);
            } else {
                this.gallery.imgs[i].inject(this.gallery.container);
            }
        }
        this.gallery.container.inject(this.lightbox.wrapper, 'bottom');
        this.gallery.imgs[this.current_image].addClass('active');
    };

    /**
     * [scale description]
     * resize image function
     */
    this.scale = function() {
        // / need to remove the style tag of the image because else javascript
        // / can't get the original height and width
        this.img.img.removeAttribute('style');

        // / need to set wrapper and outer_container to be visible in the DOM
        // / because otherway the img-size is { x : 0, y: 0 }
        this.lightbox.wrapper.setStyle('display', 'block');

        var body_size = document.body.size();
        this.img.coordinates = this.img.img.position();
        var newX = this.img.coordinates.x;
        var newY = this.img.coordinates.y;

        var big_enough = true;

        var container_height = this.lightbox.data_container.size().height;
        var inner_container_padding = {
            'x': parseFloat(this.lightbox.inner_container.getStyle('padding-left')) + parseFloat(this.lightbox.inner_container.getStyle('padding-right')),
            'y': parseFloat(this.lightbox.inner_container.getStyle('padding-top')) + parseFloat(this.lightbox.inner_container.getStyle('padding-bottom')),
        };

        if (this.grouped === true)
            container_height += parseFloat(this.gallery.container.getStyle('height'));

        var max_proportions = {
            x: (body_size.x * this.sizeFactor) - container_height,
            y: (body_size.y * this.sizeFactor) - container_height
        };

        if (this.options.max_width !== null) {
            max_proportions.x = this.options['max-width'];
            max_proportions.y = this.img.coordinates.height * (max_proportions.x / this.img.coordinates.width);
        }

        if (typeOf(this.options.max_height) !== 'null' && max_proportions.y > this.options.max_height) {
            max_proportions.y = this.options['max-height'];
            max_proportions.x = this.img.coordinates.width * (max_proportions.y / this.img.coordinates.height);
        }

        /**
         * if image is too big rescale
         */
        if (newX > max_proportions.x) {
            newX = max_proportions.x;
            newY = this.img.coordinates.height * (newX / this.img.coordinates.width);
        }
        if (newY > max_proportions.y) {
            newY = max_proportions.y;
            newX = this.img.coordinates.width * (newY / this.img.coordinates.height);
        }

        this.img.img.setStyles({
            'width': newX,
            'height': newY,
            'opacity': 0
        });

        /**
         * if too small don't display gallery and description
         */
        if (newX < 400 || newY < 400) {
            container_height = 0;
            big_enough = false;
        }

        this.scroll = newY + inner_container_padding.y + container_height;
        this.scroll = (body_size.y - this.scroll) / 2;

        if (this.grouped === true)
            container_height -= this.gallery.container.size().height;

        /**
         * set width of lightbox outer_container to center it
         */
        var outer_container_width = newX + inner_container_padding.x;
        var outer_container_height = body_size.y - (this.scroll + this.options['gallery-height'] + (body_size.y * 1 / 100));

        this.lightbox.outer_container.setStyles({
            'width': outer_container_width,
            'height': outer_container_height
        });

        this.run(body_size, big_enough);

        /**
         * prev / next buttons
         */

        if (this.prev !== null) {
            if (this.current_image > 0)
                this.prev.setStyles({
                    'height': newY,
                    'display': 'block'
                });
            else
                this.prev.setStyle('display', 'none');
        }

        if (this.next !== null) {
            if (this.current_image < (this.count - 1))
                this.next.setStyles({
                    'height': newY,
                    'display': 'block'
                });
            else
                this.next.setStyle('display', 'none');
        }

        this.lightbox.wrapper.setStyles({
            'top': document.body.getScroll().y + this.scroll,
            'height': body_size.y - this.scroll
        });

        // / set correct height for overlay
        this.overlay.setStyle('height', document.body.getScrollSize().y);
        // / center loading gif
        this.loading.setStyles({
            'left': (newX / 2) - 16,
            'top': (newY / 2) - 16
        });

        this.resized = false;
    };

    /**
     * [run description]
     * Function to display various containers or hide them, calculate gallery width
     * @param  {object} body_size
     * @param  {boolean} big_enough
     */
    this.run = function(body_size, big_enough) {
        this.lightbox.inner_container.setStyle('opacity', 1);
        var gallery_calulation = (function(body_size, big_enough) {
            this.lightbox.inner_container.setStyle('opacity', 1);
            this.img.img.setStyle('opacity', 1);
            if (this.grouped === true && big_enough) {
                // / set gallery container size
                var gallery_width = 0;
                var gallery_img_height = this.options['gallery-height'];
                var gallery_img_width = this.gallery.imgs[0].size().width * (gallery_img_height / this.gallery.imgs[0].size().height);

                for (var i = 0; i < this.gallery.imgs.length && i < this.options['gallery-quantity']; ++i) {
                    gallery_width += gallery_img_width;
                    this.gallery.imgs[i].setStyle('width', gallery_img_width);
                }

                gallery_width += parseFloat(this.gallery.imgs[0].getStyle('margin-right')) * (this.options.gallery_quantity - 1);
                this.gallery.container.setStyle('width', gallery_width);
                this.lightbox.data_container.setStyle('opacity', 1);
                this.gallery.container.setStyle('opacity', 1);
            } else if (big_enough === true) {
                this.lightbox.data_container.setStyle('opacity', 1);
            } else {
                this.lightbox.data_container.setStyle('opacity', 0);
                this.gallery.container.setStyle('opacity', 0);
            }
        }.bind(this));

        // if (this.options.animation === true) {
        //     var fx = new Fx.Tween(this.img.img, {
        //         duration: 500,
        //         transition: Fx.Transitions.Sine.easeOut
        //     });
        //
        //     fx.start('opacity', 1).chain( //
        //         function() {
        //             gallery_calulation.attempt([body_size, big_enough]);
        //         });
        // } else {
        gallery_calulation(body_size, big_enough);
        // }
    };

    /**
     * [show description]
     * Displays the lightbox
     */
    this.show = function() {
        if (this.visible === false) {
            this.overlay.setStyle('display', 'block');
            // if (this.options.animation === true) {
            // 	this.overlay.tween('opacity', 0.85);
            // } else {
            this.overlay.setStyle('opacity', 0.85);
            // }
            this.loading.setStyle('display', 'block');
            this.visible = true;
        }
    };

    /**
     * [hide description]
     * Function to make the lightbox and the overlay disappear
     */
    this.hide = function() {
        if (this.visible === true) {
			this.lightbox.wrapper.setStyle('display', 'none');
			this.lightbox.data_container.setStyle('opacity', '0');

			if (this.grouped === true)
				this.gallery.container.setStyle('opacity', '0');
            //
			// if (this.options.animation === true) {
			// 	var fx = new Fx.Tween(this.overlay, {
			// 		duration : 500,
			// 		transition : Fx.Transitions.Sine.easeOut
			// 	});
			// 	fx.start('opacity', 0).chain( //
			// 	function() {
			// 		this.lightbox.inner_container.tween('opacity', 0);
			// 		this.loading.setStyle('display', 'none');
			// 		this.overlay.setStyle('display', 'none');
			// 	}.bind(this));
			// } else {
				this.loading.setStyle('display', 'none');
				this.overlay.setStyle('display', 'none');
			// }
			this.visible = false;
		}
    };

    this.initialize();
};
