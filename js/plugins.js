// Avoid `console` errors in browsers that lack a console.
( function(window, $, undefined) {

        $.fn.Liquid7 = function(options) {

            // Extend our default options with those provided.
            // Note that the first argument to extend is an empty
            // object – this is to keep from overriding our "defaults" object.
            var opts = $.extend({}, $.fn.Liquid7.defaults, options), 
                modal = _.pick(opts, 'backdrop', 'keyboard', 'show'), 
                content = "", 
                self = this,
                IMG_WIDTH = 500,
                priv = {};

            this.data = [];
            this.opts = opts;
            this.currentIndex = this.currentIndex || 0;
            this.modal = $(opts.modalContainer);

            /**
             * Create Toggler;
             */
            
            $(this.opts.toggle).on("click", function() {
                
                var opts = self.opts,
                    container = $(opts.galleryContainer),
                    switchMode = $(opts.galleryContainer).data('mode'),
                    currentMode = switchMode.split("|");
            
                function switchCase() {
                    return (currentMode[0] === "list") ? "grid" : "list"; 
                }
                var newMode = switchCase();
                container.data().mode = newMode + "|" + switchMode[1];

                container.toggleClass('list');
                $(opts.previewContainer).toggleClass('hide');
                $(opts.previewContainer).toggleClass(opts.gridClass);
                self.trigger('mode.' + newMode);
            });

            priv.nextSlide = function() {
                self.trigger('liquid:before[next]');
                if (!self.opts.isContinousScrolling)
                    return;
                if (self.currentIndex === self.data.length - 1) {
                    self.currentIndex = 0;
                } else {
                    self.currentIndex = self.currentIndex + 1;
                }
                priv._buildGallery();
                self.trigger('liquid:after[next]');
            };
            priv.prevSlide = function() {
                self.trigger('liquid:before[prev]');
                if (!self.opts.isContinousScrolling)
                    return;
                if (self.currentIndex === 0) {
                    self.currentIndex = self.data.length - 1;
                } else {
                    self.currentIndex = self.currentIndex - 1;
                }
                priv._buildGallery();
                self.trigger('liquid:after[prev]');
            };
            priv.swipe = {
                swipeStatus: function(event, phase, direction, distance, fingers) {
                    self.trigger('liquid:before[swipe]');
                    if (phase == "move" && (direction == "left" || direction == "right")) {
                        
                        if (direction == "left") {
                            distance = -distance
                        }
                        $(self.opts.modalContainer + ">div").css("left", distance);

                    } else if (phase == "cancel") {
                        $(self.opts.modalContainer + ">div").css("left", "");
                    }

                    // Else end means the swipe was completed, so move to the next image
                    else if (phase == "end") {
                        if(distance<150) {
                            $(self.opts.modalContainer + ">div").css("left", "");
                            return;
                        } 
                        if (direction == "right") {
                            priv.prevSlide()
                        } else if (direction == "left") {
                            priv.nextSlide()
                        }
                    }
                    self.trigger('liquid:after[swipe]');
                },
                threshold : 100
            }
            priv._checkMode = function() {
                var modeCont = $(self.opts.galleryContainer),
                    mode = modeCont.data('mode'),
                    mode = mode.split('|');
                this.mode = mode[0];
                if(this.mode === 'grid') $(self.opts.previewContainer).addClass('hide');
            }
            priv._onClick = function(e) {
                self.trigger('liquid:before[click]');
                var prevCont = $(self.opts.previewContainer);

                priv._checkMode();
                this.currentIndex = $(e.currentTarget).parent().data('index');

                priv._buildGallery();
                
                if(self.mode !== "list" && !prevCont.is(":visible")) {
                    this.modal.modal('show');
                } else {
                    if(!prevCont.is(":visible")) {
                        this.modal.modal('show');
                    }
                }
            };
            priv._displayMode = function() {
                var content = "";
                priv._checkMode();
                                    
                switch(this.mode) {
                    case "grid":
                    
                        break;
                    case "list":
                        $(self.opts.galleryContainer).addClass('list');
                        self._buildGallery()
                        break;
                }
            };
            priv._buildGallery = function() {
                if (!self.data)
                    return;
                self.trigger('liquid:before[build]');

                var content = _.template($(self.opts.template).html(), self.data[self.currentIndex]),
                    prevCont = $(self.opts.previewContainer);
                if(this.mode === "list") {
                    prevCont.html(content);
                     if(!prevCont.is(":visible")) {
                         self.modal.html(content);
                        // initiate the modal
                         self.modal.modal(modal);
                     }
                } else {
                    self.modal.html(content);
                    // initiate the modal
                    self.modal.modal(modal);
                }
                self.trigger('liquid:after[build]');

            };
            // Initiate the gallery data;
            _.each($(opts.imageContainer), function(obj, index) {
                var tempObj = {
                        src : $(obj).attr('href'),
                        thumb : $(obj).find('img').attr('src'),
                        title : "no title"
                    }, 
                    images = new Image();
                images.src = $(obj).data('payloads').href;
                this.data.push($.extend({}, tempObj, $(obj).data('payloads')));
                $(obj).data('index', index);
            }, this);

            $(opts.imageContainer).off("click", 'img').on("click", 'img', $.proxy(priv._onClick, this))

            $(opts.modalContainer).swipe(priv.swipe);

            priv._displayMode();
            
            this.on('mode.list', $.proxy(priv._displayMode, this));

            
            return $.extend({}, this, {
                next : function() {
                    priv.nextSlide();
                },
                prev : function() {
                    priv.prevSlide();
                },
                close : function() {
                    self.modal.modal('hide');
                },
                open : function() {
                    self.trigger("liquid:opening");
                    self.modal.modal('show');
                    self.trigger("liquid:opened");
                }
            });
        };
        /*
        $.fn.Liquid7.extends({
        data : []
        })
        */
        // Plugin defaults – added as a property on our plugin function.
        $.fn.Liquid7.defaults = {
            // bootstraps modal settings
            backdrop : true, // this will create a black backdrop
            keyboard : true, // enable keyboard shortcut
            show : false, // Shows the modal when initialized.

            // this settings
            template : '#gallery-template', // templatecontainer
            modalContainer : '#liquid-modal-gallery', // containers of the modal
            galleryContainer : '#liquid-gallery', // containst the set of images
            imageContainer : '.thumb-container', //
            listContainer: "#list-container",
            previewContainer: "#preview-container",
            gridClass: "col-lg-4 col-md-4 col-sm-4 col-xs-12",
            toggle: "#switcher",
            isContinousScrolling : true
        };

    }(window, jQuery));

// Place any jQuery/helper plugins in here.
