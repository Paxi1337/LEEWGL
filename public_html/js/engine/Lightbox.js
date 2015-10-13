/**
 * The Lightbox class is able to automatically group images together if more than one image with the given anchor is found on site.
 * It is capable of automatically resize the lightbox when the browser window gets resized.
 *
 * @constructor
 * @param {string} options.anchor
 * @param {bool} options.resize
 * @param {bool} options.link - if set to true [default] the lightbox class relies on the images being wrapped by an a-element. The src of the full-size image is then in the 'href'-tag of the a-element
 * @param {bool} options.auto-group
 * @param {bool} options.animation
 * @param {bool} options.navigation-inside
 * @param {number} options.max-width
 * @param {number} options.max-height
 * @param {number} options.min-width
 * @param {number} options.min-height
 * @param {number} options.gallery-height
 * @param {number} options.gallery-quantity
 * @param {string} options.title-attribute
 * @param {number} options.size-factor
 */
LEEWGL.Lightbox = function(options) {
  LEEWGL.REQUIRES.push('Lightbox');

  /** @inner {object} */
  this.options = {
    'anchor': null,
    'resize': true,
    'link': true,
    'auto-group': true,
    'animation': true,
    'navigation-inside': false,
    'max-width': null,
    'max-height': null,
    'min-width': 400,
    'min-height': 400,
    'gallery-height': 100,
    'gallery-quantity': 6,
    'title-attribute': 'data-src',
    'size-factor': 0.85
  };

  /** @inner {object} */
  this.lightbox = {
    'wrapper': null,
    'outerContainer': null,
    'innerContainer': null,
    'dataContainer': null,
    'navContainer': null
  };

  /** @inner {number} */
  this.id = LEEWGL.Lightbox.LightboxCount++;
  /** @inner {LEEWGL.DOM.Element} */
  this.loading = null;
  /** @inner {LEEWGL.DOM.Element} */
  this.overlay = null;

  this.images = [];
  this.thumbnails = [];
  this.activeImage = new LEEWGL.DOM.Element('img');

  /** @inner {object} */
  this.imageTitle = {
    'container': null,
    'text': null
  };
  /** @inner {object} */
  this.imageDesc = {
    'container': null,
    'text': null
  };
  /** @inner {object} */
  this.gallery = {
    'container': null,
    'imgs': [],
    'next': null,
    'prev': null
  };

  /** @inner {LEEWGL.DOM.Element} */
  this.next = null;
  /** @inner {LEEWGL.DOM.Element} */
  this.prev = null;
  /** @inner {bool} */
  this.grouped = false;

  /** @inner {bool} */
  this.initialized = false;
  /** @inner {Array} */
  this.anchor = [];
  /** @inner {number} */
  this.activeImageID = 0;
  /** @inner {number} */
  this.count = 0;
  /** @inner {bool} */
  this.visible = false;

  this.body = new LEEWGL.DOM.Element(document.body);

  extend(LEEWGL.Lightbox.prototype, LEEWGL.Options.prototype);

  this.setOptions(options);

  /**
   * Initializes the lightbox
   */
  this.initialize = function() {
    if (this.initialized === false) {
      var domElements = document.querySelectorAll(this.options.anchor);
      if (this.options['auto-group'] === true) {
        if (domElements.length > 1)
          this.createGrouped();
        else
          this.create();
      } else {
        var tmp = new LEEWGL.DOM.Element(domElements[0]);
        if (tmp.hasClass('grouped'))
          this.createGrouped();
        else
          this.create();
      }
      this.initialized = true;
    }
  };

  this.setupContainers = function() {
    var that = this;

    this.lightbox.wrapper = new LEEWGL.DOM.Element('div', {
      'id': 'lb-' + this.id,
      'class': 'lb',
      'tabindex' : -1,
      'styles': {
        'display': 'none'
      }
    });

    this.lightbox.outerContainer = new LEEWGL.DOM.Element('div', {
      'id': 'lb-outer-' + this.id,
      'class': 'lb-outer'
    });

    this.lightbox.innerContainer = new LEEWGL.DOM.Element('div', {
      'id': 'lb-inner-' + this.id,
      'class': 'lb-inner'
    });

    this.lightbox.dataContainer = new LEEWGL.DOM.Element('div', {
      'id': 'lb-data-' + this.id,
      'class': 'lb-data',
      'styles': {
        'opacity': '0'
      }
    });

    /**
     * Close the lightbox by hitting 'esc'
     */
    this.lightbox.wrapper.addEvent('keydown', function(e) {
      if (e.keyCode === LEEWGL.KEYS.ESC) {
        that.hide();
        e.preventDefault();
      }
    });

    if (this.options.resize === true) {
      addEventToWindow('onresize', function(e) {
        if (that.visible === true)
          that.scale();
      });
    }

    /** Title */
    this.imageTitle.container = new LEEWGL.DOM.Element('div', {
      'id': 'lb-title-' + this.id,
      'class': 'lb-title'
    });

    this.imageTitle.container.inject(this.lightbox.dataContainer);

    /** Description */
    this.imageDesc.container = new LEEWGL.DOM.Element('div', {
      'id': 'lb-desc-' + this.id,
      'class': 'lb-desc'
    });

    this.imageDesc.container.inject(this.lightbox.dataContainer);

    this.lightbox.wrapper.inject(this.body);
    this.lightbox.outerContainer.inject(this.lightbox.wrapper);
    this.lightbox.innerContainer.inject(this.lightbox.outerContainer);
    this.lightbox.dataContainer.inject(this.lightbox.outerContainer);
  };
  /**
   * calls all functions needed to create a lightbox for one image
   */
  this.create = function() {
    this.grouped = false;
    this.setupContainers();
    this.addOverlay();
    this.addLoadingGif();
    this.addCloseIcon('close_circle.png');
    this.addImage();
  };
  /**
   * calls all functions needed to create a lightbox for a group of images
   */
  this.createGrouped = function() {
    this.grouped = true;
    this.setupContainers();
    this.addOverlay();
    this.addLoadingGif();
    this.addCloseIcon('close_circle.png');
    this.addGallery();
    this.addNavigation();
  };
  /**
   * Reiterates through given element selector [this.options.anchor] and registers click event to open lightox
   */
  this.update = function() {
    this.anchor = [];
    this.images = [];
    this.thumbnails = [];
    var that = this;
    var domElements = document.querySelectorAll(this.options.anchor);

    var getImage = function(anchor, count) {
      var children = anchor.getChildren();
      if (that.options.link === true) {
        if (anchor.get('href') === null) {
          for (var i = 0; i < children.length; ++i) {
            getImage(children[i]);
          }
          return null;
        } else {
          that.thumbnails.push(new LEEWGL.DOM.Element('img', {
            'src': anchor.getChildren('img')[0].get('src')
          }));
          that.images.push(new LEEWGL.DOM.Element('img', {
            'src': anchor.get('href'),
            'count': count
          }));
          anchor.set('count', count);
          return anchor;
        }
      } else {
        if (anchor.get('src') === null) {
          for (var i = 0; i < children.length; ++i) {
            getImage(children[i]);
          }
          return null;
        } else {
          that.images.push(new LEEWGL.DOM.Element('img', {
            'src': anchor.get('src'),
            'count': count
          }));
          return anchor;
        }
      }
    };

    var registerEvent = function(handler, image) {
      handler.addEvent('click', function(e) {
        var anchor = e.target;
        that.imageTitle.text = image.get('title');
        that.imageDesc.text = image.get('rel');
        that.changeImage(parseInt(image.get('count')));
        e.preventDefault();
        e.stopPropagation();
      });
    };

    for (var i = 0; i < domElements.length; i++) {
      var anchor = new LEEWGL.DOM.Element(domElements[i]);
      this.anchor.push(anchor);
      image = getImage(anchor, i);
      registerEvent(anchor, image);
    }
    this.count = this.anchor.length;

    this.updateGallery();
  };

  /**
   * Adds an image to the lightbox
   */
  this.addImage = function() {
    var that = this;
    this.lightbox.innerContainer.grab(this.activeImage, 'top');

    this.activeImage.addEvent('load', function() {
      // if (this.options.animation === true)
      // 	this.loading.tween('opacity', 0);
      // else
      that.loading.setStyle('opacity', 0);
      that.scale();
      that.show();
    });
  };
  /**
   * Change the image without opening a new lightbox
   * @param {number} imageID
   */
  this.changeImage = function(imageID) {
    var that = this;

    this.lightbox.wrapper.e.focus();

    if (this.gallery.container !== null) {
      this.gallery.imgs[this.activeImageID].removeClass('active-lb');
      this.gallery.imgs[imageID].removeClass('active-lb');
    }

    // this.loading.tween('opacity', 1);
    this.activeImageID = imageID;
    var run = (function() {
      that.lightbox.innerContainer.setStyle('opacity', 0);
      that.activeImage.set('src', that.images[imageID].get('src'));
      that.imageTitle.container.set('text', that.imageTitle.text);
      that.imageDesc.container.set('text', that.imageDesc.text);
    });

    // if (this.options.animation === true) {
    //     var fx = new Fx.Tween(this.lightbox.innerContainer, {
    //         property: 'opacity',
    //         duration: 200,
    //         transition: Fx.Transitions.Sine.easeOut
    //     });
    //
    //     fx.start(1, 0).chain(function() {
    //         run.attempt(src);
    //     });
    // } else {
    run();
    // }

    this.activeImage.dispatchEvent({
      'type': 'load'
    });
  };
  /**
   * Function to add a close icon in the right upper edge
   * @param {string} src
   */
  this.addCloseIcon = function(src) {
    var that = this;
    var path = LEEWGL.ROOT + 'img/icons/' + src;
    var close_icon = new LEEWGL.DOM.Element('div', {
      'id': 'lb-close-icon-' + this.id,
      'class': 'lb-close-icon',
      'title': 'click to close',
      styles: {
        'background-image': 'url(' + path + ')'
      }
    });
    close_icon.inject(this.lightbox.outerContainer);

    close_icon.addEvent('click', function(e) {
      that.hide();
      e.preventDefault();
    });
  };
  /**
   * Adds an overlay to document.body
   */
  this.addOverlay = function() {
    this.overlay = new LEEWGL.DOM.Element('div', {
      'id': 'lb-overlay-' + this.id,
      'class': 'lb-overlay',
      styles: {
        'height': this.body.size()['scroll-height'] + 'px',
        'display': 'none',
        'opacity': 0
      }
    });
    this.overlay.inject(this.body, 'top');
  };
  /**
   * Adds a gif image when lightbox is loading
   */
  this.addLoadingGif = function() {
    this.loading = new LEEWGL.DOM.Element('div', {
      'id': 'lb-loading-' + this.id,
      'class': 'lb-loading',
      styles: {
        'top': 0,
        'left': 0
      }
    });
    this.loading.inject(this.lightbox.innerContainer);
  };
  /**
   * Adds two links to the nav-container with a background-graphic which gets visible when the user moves the mouse into the right or left side of the image
   */
  this.addNavigation = function() {
    var that = this;

    this.lightbox.navContainer = new LEEWGL.DOM.Element('div', {
      'id': 'lb-nav-' + this.id,
      'class': 'lb-nav'
    });

    if (this.options['navigation-inside'] === true)
      this.lightbox.navContainer.inject(this.lightbox.innerContainer);
    else
      this.lightbox.navContainer.inject(this.lightbox.outerContainer);

    this.prev = new LEEWGL.DOM.Element('a', {
      'class': 'lb-prev',
      'href': '#',
    });

    this.prev.addEvent('click', function(e) {
      that.changeImage(that.gallery.imgs[that.activeImageID - 1]);
      e.preventDefault();
    });
    this.prev.inject(this.lightbox.navContainer);

    this.next = new LEEWGL.DOM.Element('a', {
      'class': 'lb-next',
      'href': '#',
    });

    this.next.addEvent('click', function(e) {
      that.changeImage(that.gallery.imgs[that.activeImageID + 1]);
      e.preventDefault();
    });
    this.next.inject(this.lightbox.navContainer);
  };
  /**
   * Adds two links to the gallery container with a background-graphic which gets visible when the user moves the mouse into the right or left side of the image
   */
  this.addGalleryNavigation = function() {
    if (this.options['gallery-quantity'] >= this.count)
      return;

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

    this.gallery.prev.addEvent('click', function(e) {
      // fx.start(-this.gallery.container.getSize().x, 0);
      e.preventDefault();
    });

    this.gallery.next.addEvent('click', function(e) {
      // fx.start(this.gallery.container.getSize().x, 0);
      e.preventDefault();
    });
  };

  /**
   * Adds available pictures as thumbnails to the bottom of the lightbox container
   */
  this.addGallery = function() {
    var that = this;
    this.gallery.container = new LEEWGL.DOM.Element('div', {
      'id': 'lb-gallery-' + this.id,
      'class': 'lb-gallery',
      styles: {
        'opacity': 0
      }
    });

    this.addGalleryNavigation();

    this.gallery.container.inject(this.lightbox.wrapper, 'bottom');
    this.gallery.imgs[this.activeImageID].addClass('active-lb');
  };

  this.updateGallery = function() {
    if (this.gallery.container === null)
      return;

    for (var i = 0; i < this.count; ++i) {
      var src = (typeof this.thumbnails[i] !== 'undefined') ? this.thumbnails[i].get('src') : this.images[i].get('src');
      this.gallery.imgs[i] = new LEEWGL.DOM.Element('img', {
        'class': 'lb-galleryimage',
        'src': src,
        'title': this.anchor[i].get('title'),
        'rel': this.anchor[i].get('rel'),
        'count': this.anchor[i].get('count'),
        styles: {
          'height': this.options['gallery-height'] + 'px'
        }
      });

      this.gallery.imgs[i].set(this.options['title-attribute'], this.images[i].get('src'));

      if (i === (this.count - 1) && this.options['gallery_quantity'] >= this.count)
        this.gallery.imgs[i].addClass('last');

      this.gallery.imgs[i].addEvent('click', function(e) {
        that.gallery.imgs[that.activeImageID].removeClass('active-lb');
        that.changeImage(that.gallery.imgs[i].get('count'));
        e.preventDefault();
      });

      if (this.options.link === true) {
        var link = new LEEWGL.DOM.Element('a', {
          'href': this.images[i].get('src')
        });
        this.gallery.imgs[i].inject(link);
        link.inject(this.gallery.container);
      } else {
        this.gallery.imgs[i].inject(this.gallery.container);
      }
    }
  };

  /**
   * Set dimensions of image and containers
   */
  this.scale = function() {
    var that = this;
    /** need to remove the style tag of the image because else javascript
        can't get the original height and width */
    this.activeImage.removeAttribute('style');
    /** need to set wrapper and outerContainer to be visible in the DOM
        because otherway the img-size is { x : 0, y: 0 } */
    this.lightbox.wrapper.setStyle('display', 'block');

    var bodySize = this.body.size();
    var imageSize = this.activeImage.size();
    var newX = imageSize.width;
    var newY = imageSize.height;
    var bigEnough = true;
    var additionalContainerHeight = this.lightbox.dataContainer.size().height;
    var innerContainerPadding = {
      'x': parseFloat(this.lightbox.innerContainer.getStyle('padding-left')) + parseFloat(this.lightbox.innerContainer.getStyle('padding-right')),
      'y': parseFloat(this.lightbox.innerContainer.getStyle('padding-top')) + parseFloat(this.lightbox.innerContainer.getStyle('padding-bottom')),
    };

    if (this.imageTitle.text === null) {
      additionalContainerHeight = 0;
      this.lightbox.dataContainer.setStyle('opacity', 0);
    }

    if (this.grouped === true)
      additionalContainerHeight += parseFloat(this.gallery.container.getStyle('height'));

    var getMaxDimensions = function() {
      var dimensions = {
        x: (bodySize.width * that.options['size-factor']) - additionalContainerHeight,
        y: (bodySize.height * that.options['size-factor']) - additionalContainerHeight
      };

      if (that.options['max-width'] !== null) {
        dimensions.x = that.options['max-width'];
        dimensions.y = imageSize.height * (dimensions.x / imageSize.width);
      }

      if (that.options['max-height'] !== null && dimensions.y > that.options['max_height']) {
        dimensions.y = that.options['max-height'];
        dimensions.x = imageSize.width * (dimensions.y / imageSize.height);
      }
      return dimensions;
    };

    var maxDimensions = getMaxDimensions();

    var calculateImageSize = function() {
      var size = {
        'width': imageSize.width,
        'height': imageSize.height
      };

      if (size.width > maxDimensions.x) {
        size.width = maxDimensions.x;
        size.height = imageSize.height * (size.width / imageSize.width);
      }
      if (size.height > maxDimensions.y) {
        size.height = maxDimensions.y;
        size.width = imageSize.width * (size.height / imageSize.height);
      }

      if (size.width < that.options['min-width'] || size.height < that.options['min-height']) {
        size.width = that.options['min-width'];
        size.height = imageSize.height * (size.width / imageSize.width);
        additionalContainerHeight = 0;
        bigEnough = false;
      }
      return size;
    };

    var newImageSize = calculateImageSize();
    var scroll = newImageSize.height + innerContainerPadding.y + additionalContainerHeight;
    scroll = this.body.getScroll().y + ((bodySize['display-height'] - scroll) / 2);

    /**
     * set width of lightbox outerContainer to center it
     */
    var outerContainerWidth = newImageSize.width + innerContainerPadding.x;
    var outerContainerHeight = (newImageSize.height + additionalContainerHeight);

    this.activeImage.setStyles({
      'width': newImageSize.width + 'px',
      'height': newImageSize.height + 'px',
      'opacity': 0
    });

    this.lightbox.wrapper.setStyle('height', bodySize['scroll-height'] + 'px');
    this.overlay.setStyle('height', this.body.size()['scroll-height'] + 'px');

    this.lightbox.outerContainer.setStyles({
      'top': scroll + 'px',
      'width': outerContainerWidth + 'px',
      'height': outerContainerHeight + 'px'
    });

    if (this.prev !== null) {
      if (this.activeImageID > 0) {
        this.prev.setStyles({
          'height': newImageSize.height + 'px',
          'display': 'block'
        });
      } else {
        this.prev.setStyle('display', 'none');
      }
    }

    if (this.next !== null) {
      if (this.activeImageID < (this.count - 1)) {
        this.next.setStyles({
          'height': newImageSize.height + 'px',
          'display': 'block'
        });
      } else {
        this.next.setStyle('display', 'none');
      }
    }

    // / center loading gif
    this.loading.setStyles({
      'left': (newImageSize.width / 2) - 16 + 'px',
      'top': (newImageSize.height / 2) - 16 + 'px'
    });

    this.run(bodySize, bigEnough);
  };
  /**
   * Function to display various containers or hide them and calculate the gallery width
   * @param  {object} bodySize
   * @param  {bool} bigEnough
   */
  this.run = function(bodySize, bigEnough) {
    var that = this;
    this.lightbox.innerContainer.setStyle('opacity', 1);
    var gallery_calulation = (function(bodySize, bigEnough) {
      that.lightbox.innerContainer.setStyle('opacity', 1);
      that.activeImage.setStyle('opacity', 1);
      if (that.grouped === true) {
        // / set gallery container size
        var gallery_width = 0;
        var gallery_img_height = that.options['gallery-height'];
        var gallery_img_width = that.gallery.imgs[0].size().width * (gallery_img_height / that.gallery.imgs[0].size().height);

        for (var i = 0; i < that.gallery.imgs.length && i < that.options['gallery-quantity']; ++i) {
          gallery_width += gallery_img_width;
          that.gallery.imgs[i].setStyle('width', gallery_img_width + 'px');
        }

        gallery_width += parseFloat(that.gallery.imgs[0].getStyle('margin-right')) * (that.options.gallery_quantity - 1);
        that.gallery.container.setStyle('width', gallery_width + 'px');

        if (bigEnough === true) {
          if (that.imageTitle.text !== null)
            that.lightbox.dataContainer.setStyle('opacity', 1);
          that.gallery.container.setStyle('opacity', 1);
        } else {
          that.lightbox.dataContainer.setStyle('opacity', 0);
          that.gallery.container.setStyle('opacity', 0);
        }
      } else {
        if (bigEnough === true && that.imageTitle.text !== null)
          that.lightbox.dataContainer.setStyle('opacity', 1);
        else
          that.lightbox.dataContainer.setStyle('opacity', 0);
      }
    });

    // if (this.options.animation === true) {
    //     var fx = new Fx.Tween(this.img.img, {
    //         duration: 500,
    //         transition: Fx.Transitions.Sine.easeOut
    //     });
    //
    //     fx.start('opacity', 1).chain( //
    //         function() {
    //             gallery_calulation.attempt([bodySize, bigEnough]);
    //         });
    // } else {
    gallery_calulation(bodySize, bigEnough);
    // }
  };

  /**
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
   * Function to make the lightbox and the overlay disappear
   */
  this.hide = function() {
    if (this.visible === true) {
      this.lightbox.wrapper.setStyle('display', 'none');
      this.lightbox.dataContainer.setStyle('opacity', '0');

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
      // 		this.lightbox.innerContainer.tween('opacity', 0);
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

/** @global */
LEEWGL.Lightbox.LightboxCount = 0;
