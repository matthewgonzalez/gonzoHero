/*  -------------------------------------------------------------
 *  Project:        gonzoHero (gonzoHero.jquery.js)
 *  Description:    Another jQuery slider.
 *  Author:         Matthew Gonzalez (matthewgonzalez on github)
 *  License:        MIT.
 */

// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, undefined ) {
    
    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.
    
    // window is passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'gonzoHero',
        document = window.document,
        defaults = {
            autoAnimate:      true,
            height:           null,
            speed:            5000,
            controlOffset:    -60
        };

    // The actual plugin constructor
    function gonzoHero( element, options ) {
        this.el = element;

        // jQuery has an extend method which merges the contents of two or 
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = "gonzoHero";
        
        this.init();
    }

    gonzoHero.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance, 
        // e.g., this.element and this.options
        var $this             = $(this.el);
        var currentPosition   = 0;
        var slides            = $this.children(".slide");
        var slideWidth        = slides.width();
        var slideOuterWidth   = slides.outerWidth(true);
        var numberOfSlides    = slides.length;
        var slideHeight       = this.options.height;
        var animateSlides     = this.options.autoAnimate;
        var animateSpeed      = this.options.speed;
        
        $this
          .addClass('gonzoHero')
          .css({ height: slideHeight, position: 'relative'});
        
        // Wrap all .slides with #slideInner div
        slides
          .wrapAll('<div id="slidesInner"></div>')
          // Float left to display horizontally, readjust .slides width
          .css({
            float : 'left',
            width : slideWidth,
            position : 'relative',
            height : slideHeight,
          });
          
          
        // Set #slideInner width equal to total width of all slides
        $('#slidesInner', $this).css('width', (slideOuterWidth * numberOfSlides));

        // Create #slideContainer and Remove scrollbar in JS
        $("#slidesInner").wrap('<div id="slidesContainer"></div>');
        $("#slidesContainer").css({overflow:"hidden", display: "block"});

        // Insert controls in the DOM
        $this
          .prepend('<span class="control" id="leftControl">&lsaquo;</span>')
          .append('<span class="control"  id="rightControl">&rsaquo;</span>')
          .append('<span class="control"  id="restartControl">&crarr;</span>');

        // Place the controls.
        var controlHeight = $("#slidesContainer").height();
        $('.gonzoHero .control').css({ height : controlHeight, lineHeight : controlHeight + 'px', top: 0, position: 'absolute', cursor: 'pointer'})
        $('#rightControl, #restartControl').css({  right : this.options.controlOffset });
        $('#leftControl').css({   left  : this.options.controlOffset });

        // Slide counter list
        if ( numberOfSlides > 0 ){
          $this.append('<ul class="slideCounter"></ul>');
          for(i=1;i<=numberOfSlides;i++) {
            $(".slideCounter", $this).append('<li class="control"></li>');
          }
        }
	    
	    $("ul.slideCounter", $this).css({float: "left", position:"absolute", bottom: -45, left: "50%"});
        $("ul.slideCounter", $this).css({marginLeft: "-"+ ($("ul.slideCounter", $this).outerWidth(true))/2+"px"});
        $("ul.slideCounter li", $this).css({ cursor: "pointer"});
        
        // Hide left arrow control on first load
        manageControls(currentPosition);
        var autoSlide = 0;
        var displayedSlide = $('#slidesContainer .slide:first', $this);
        
        $this.hover(function(){clearInterval(autoSlide);}, function(){clearInterval(autoSlide); autoAnimate();});
        
        function autoAnimate () {
        	//starts automatically
        	if (animateSlides == true){
	        	autoSlide = setInterval(function() {
	        		displayedSlide = displayedSlide.next();
	        		
	        		if(currentPosition==numberOfSlides-1){ currentPosition = 0; displayedSlide = $('#slidesContainer .slide:first', $this);} else{ currentPosition = currentPosition+1 }
	        		
	        		changeBackground();
	        		
	        		// Hide & show controls
	        		manageControls(currentPosition);
	        		
	        		// Move slideInner using margin-left
	        		$('#slidesInner', $this).stop(true,true).animate({'marginLeft' : slideOuterWidth*(-currentPosition)});
	        	}, animateSpeed);
        	}
        }
        
        autoAnimate();
		
		// Create event listeners for .controls clicks
		$('.control', $this)
			.bind('click', function(){
			// Determine new position
			
				clearInterval(autoSlide);
				if ($(this).attr('id')=='rightControl') {
					 currentPosition = currentPosition+1; 
					 displayedSlide = displayedSlide.next();
				 } else if ($(this).attr('id')=='leftControl'){ 			 
					 currentPosition = currentPosition-1;
					 displayedSlide = displayedSlide.prev();
				 } else if($(this).attr('id')=='restartControl'){ 			 
					 currentPosition = 0;
					 displayedSlide = $('#slidesContainer .slide:first', $this);
				 } else if ($(this).parent('.slideCounter', $this)){
				 	currentPosition = $(this).index();
				 	displayedSlide = $("#slidesContainer .slide:nth-child("+($(this).index()+1)+")", $this);
				 } 
				 
				changeBackground();
				// Hide & show controls
					 manageControls(currentPosition);
				// Move slideInner using margin-left
				$('#slidesInner', $this).animate({
				  'marginLeft' : slideOuterWidth*(-currentPosition)
				});	
			});
        
    function changeBackground(){
      var bgColor = displayedSlide.children(".bgColor").css("background-color");
    	$this.stop().animate({backgroundColor:bgColor},500);	
    }
        
		// manageControls: Hides and Shows controls depending on currentPosition
		function manageControls(position){
			// Add "selected" class to slideCounter
			$(".slideCounter li:nth-child("+ (position+1) + ")", $this).addClass("selected");
			$(".slideCounter li:not(:nth-child("+ (position+1) + "))", $this).removeClass("selected"); 
			
			// Hide left arrow if position is first slide & remove "selected" class from last slideCounter
			if(position==0){ 
				$('#leftControl', $this).hide(); 
				$('#restartControl', $this).hide();
			} else { 
				$('#leftControl', $this).show();
			}
			// Hide right arrow if position is last slide
			if(position==numberOfSlides-1){ 
				$('#rightControl', $this).hide();
				$('#restartControl', $this).show();
			} else { 
				$('#rightControl', $this).show(); 
				$('#restartControl', $this).hide();
			}
			
		}	
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new gonzoHero( this, options ));
            }
        });
    };

}(jQuery, window));