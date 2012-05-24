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
        $this.addClass('gonzoHero');
        
        var currentPosition   = 0;
        var slides            = $this.children(".slide");
        var slideWidth        = slides.width();
        var slideOuterWidth   = slides.outerWidth(true);
        var numberOfSlides    = slides.length;
        var slideHeight       = slides.height(true);
        var slideOuterHeight  = slides.outerHeight(true);
        var animateSlides     = this.options.autoAnimate;
        var animateSpeed      = this.options.speed;
        
        $this.css({ height: slideOuterHeight, width: slideOuterWidth, position: 'relative'});
        
        // Wrap all .slides with #slideInner div
        slides
          .wrapAll('<div id="slidesInner"></div>')
          // Float left to display horizontally, readjust .slides width
          .css({
            float : 'left',
            width : slideWidth,
            position : 'relative',
            height : slideHeight,
          })
          .prepend('<span class="bgColor"></span>');
          
                  
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
        $('#rightControl, #restartControl').css({  right : this.options.controlOffset, top : (slideHeight - controlHeight)/2 });
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
        
        $this.css({backgroundColor: displayedSlide.children(".bgColor").css("background-color")});
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
			
			// Hide left arrow if position is first slide 
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

// Animating backgroundColor
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);