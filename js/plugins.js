// Avoid `console` errors in browsers that lack a console.
( function(window, $, undefined) {"use strict";

        $.fn.Liquid7 = function(options) {

            // Extend our default options with those provided.
            // Note that the first argument to extend is an empty
            // object – this is to keep from overriding our "defaults" object.
            var opts = $.extend({}, $.fn.Liquid7.defaults, options), modal = _.pick(opts, 'backdrop', 'keyboard', 'show'), content = "", self = this,IMG_WIDTH = 500;

            this.data = [];
            this.opts = opts;
            this.currentIndex = this.currentIndex || 0;
            this.modal = $(opts.modalContainer);

            this.nextSlide = function() {
                if (!this.opts.isContinousScrolling)
                    return;
                if (this.currentIndex === this.data.length - 1) {
                    this.currentIndex = 0;
                } else {
                    this.currentIndex = this.currentIndex + 1;
                }
                this._buildGallery();
            };
            this.prevSlide = function() {
                if (!this.opts.isContinousScrolling)
                    return;
                if (this.currentIndex === 0) {
                    this.currentIndex = this.data.length - 1;
                } else {
                    this.currentIndex = this.currentIndex - 1;
                }
                this._buildGallery();
            };
            this.swipe = {
                swipeStatus: function(event, phase, direction, distance, fingers) {
                        console.log(phase);
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
                            self.prevSlide()
                        } else if (direction == "left") {
                            self.nextSlide()
                        }
                    }

                },
                threshold : 100
            }

            this._onClick = function(e) {
                // this.attachClick.apply(arguments, this);

                this.currentIndex = $(e.currentTarget).parent().data('index');

                this._buildGallery();
                console.log(this);
                this.modal.modal('show');
            };

            this._buildGallery = function() {
                if (!this.data)
                    return;
                // this.buildingGallery.apply(arguments, this);

                var content = _.template($(this.opts.template).html(), this.data[this.currentIndex]);

                this.modal.html(content);
                // initiate the modal
                this.modal.modal(modal);

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

            $(opts.imageContainer).off("click", 'img').on("click", 'img', $.proxy(this._onClick, this))

            $(opts.modalContainer).swipe(this.swipe);

            return {
                buildingGallery : function() {

                },
                attachClick : function() {

                },
                next : function() {
                    self.trigger("liquid:next")
                    self.nextSlide();
                },
                prev : function() {
                    self.trigger("liquid:prev")
                    self.prevSlide();
                },
                close : function() {
                    self.trigger("liquid:closing")
                    self.modal.modal('hide');
                    self.trigger("liquid:closed")
                },
                open : function() {
                    self.trigger("liquid:opening")
                    self.modal.modal('show');
                    self.trigger("liquid:opened")
                }
            }
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
            isContinousScrolling : true
        };

    }(window, jQuery));

// Place any jQuery/helper plugins in here.
