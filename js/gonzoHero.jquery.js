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
          controlOffset:    -60,    // position of controls relative to edge of carousel
          enableDrag:       false,
          showSideControls: true,
          nextEvents:       "ghNext",
          previousEvents:   "ghPrev",
          allowLoopback:    true       
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
    var $this               = $(this.el);
    var self                = this;
    this.currentPosition    = 0;
    this.slides             = $this.children(".slide");
    this.slideWidth         = this.slides.width();
    this.slideOuterWidth    = this.slides.outerWidth(true);
    this.numberOfSlides     = this.slides.length;
    this.slideHeight        = this.slides.height(true);
    this.slideOuterHeight   = this.slides.outerHeight(true);

    if ( this.isTouchDevice() && this.options.enableDrag )
          this.bindTouchEvents(); 

    // Custom next and previous events
    $this.bind( this.options.nextEvents, function(){ self.ghNext() });
    $this.bind( this.options.previousEvents, function(){ self.ghPrev() });

    $this.addClass('gonzoHero');

    $this.css({ height: this.slideOuterHeight, width: this.slideOuterWidth, position: 'relative'});
      
    // Wrap all .slides with #slideInner div
    this.slides.wrapAll('<div id="slidesInner"></div>').css({
      float : 'left',
      width : this.slideWidth,
      position : 'relative',
      height : this.slideHeight,
    }).prepend('<span class="bgColor"></span>');
        
                
    // Set #slideInner width equal to total width of all slides
    $('#slidesInner', $this).css('width', ( this.slideOuterWidth * this.numberOfSlides));

    // Create #slideContainer and Remove scrollbar in JS
    $("#slidesInner").wrap('<div id="slidesContainer"></div>');
    $("#slidesContainer").css({overflow:"hidden", display: "block"});

    // Insert controls in the DOM
    if (this.options.showSideControls)
      $this.prepend('<span class="control" id="leftControl">&lsaquo;</span>')
           .append('<span class="control"  id="rightControl">&rsaquo;</span>')
           .append('<span class="control"  id="restartControl">&crarr;</span>');

    // Place the controls.
    var controlHeight = $("#slidesContainer").height();
    $('.gonzoHero .control').css({ height : controlHeight, lineHeight : controlHeight + 'px', top: 0, position: 'absolute', cursor: 'pointer'})
    $('#rightControl, #restartControl').css({  right : this.options.controlOffset, top : ( this.slideHeight - controlHeight)/2 });
    $('#leftControl').css({   left  : this.options.controlOffset });

    // Slide counter list    
    if ( this.numberOfSlides > 0 ){
      $this.append('<ul class="slideCounter"></ul>');
      for( i=1; i<= this.numberOfSlides; i++) {
        $(".slideCounter", $this).append('<li class="control"></li>');
      }
    }

    $("ul.slideCounter", $this).css({ float: "left", position:"absolute", bottom: -45, left: "50%" });
    $("ul.slideCounter", $this).css({ marginLeft: "-"+ ($("ul.slideCounter", $this).outerWidth(true))/2+"px" });
    $("ul.slideCounter li", $this).css({ cursor: "pointer"});
    
    // Hide left arrow control on first load
    this.manageControls(this.currentPosition);

    this.autoSlide = 0;
    this.displayedSlide = $('#slidesContainer .slide:first', $this);
      
    $this.hover(  function(){ clearInterval( self.autoSlide ) }, 
                  function(){
                    clearInterval( self.autoSlide ); 
                    self.autoAnimate();
                  } );
    
    $this.css( {backgroundColor: this.displayedSlide.children(".bgColor").css("background-color")} );

    // Starts automatically?
    if ( this.options.autoAnimate ) this.autoAnimate();

    // Create event listeners for .controls clicks
    this.controlListener();
    
    // Animate bg Color
    this.changeBackground();

  };


  // Animates the background color 
  // during transition. 
  gonzoHero.prototype.changeBackground = function() {
    var bgColor = this.displayedSlide.children(".bgColor").css("background-color");
    $(this.el).stop().animate({backgroundColor:bgColor},500);
  };

  // manageControls: Hides and Shows controls depending on this.currentPosition
  gonzoHero.prototype.manageControls = function(position) {
    var $this = $(this.el);

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
    if( position == this.numberOfSlides-1 ){ 
      $('#rightControl', $this).hide();
      if (this.options.allowLoopback) $('#restartControl', $this).show();
    } 
    else { 
      $('#rightControl', $this).show(); 
      if (this.options.allowLoopback)  $('#restartControl', $this).hide();
    }
  };

  // Create event listeners for .controls clicks
  gonzoHero.prototype.controlListener = function() {
    var self = this;
    var $this = $(this.el);

    // Create event listeners for .control's clicks
    $('.control', $this).bind('click', function(){
    
      // Determine new position
      clearInterval( self.autoSlide );
      
      if ( $(this).attr('id')       == 'rightControl') {
        self.advance('next');
      } 
      else if ( $(this).attr('id')  == 'leftControl' ){ 
        self.advance('prev');
      } 
      else if ( $(this).attr('id')  == 'restartControl' ) {
        self.advance('restart');
      } 
      else{
        // a click on the 'dot' indicators
        self.advance('goto', $(this).index());
      }
    });
  };

  gonzoHero.prototype.advance = function(direction, which) {
    var $this = $(this.el);
    clearInterval( this.autoSlide );

    
    if ( direction == 'next' && (this.currentPosition != this.numberOfSlides-1) ) {
      this.currentPosition  = this.currentPosition + 1; 
      this.displayedSlide   = this.displayedSlide.next();      
    } 
    else if ( direction == 'prev' && (this.currentPosition != 0) ){ 
      this.currentPosition  = this.currentPosition - 1;
      this.displayedSlide   = this.displayedSlide.prev();
    } 
    else if ( direction == 'restart' || (this.currentPosition == this.numberOfSlides-1) && isNaN(which) ){
      if (!this.options.allowLoopback) return;
      this.currentPosition  = 0;
      this.displayedSlide   = $('#slidesContainer .slide:first', $this);
    } 
    else if ( direction == 'goto'){
      this.currentPosition  = which;
      this.displayedSlide   = $("#slidesContainer .slide:nth-child(" + ( which + 1 ) + ")", $this);
    } 

    this.changeBackground();
    this.manageControls( this.currentPosition );
    
    // Move slideInner using margin-left
    $('#slidesInner', $this).animate({
      'marginLeft' : this.slideOuterWidth*( -this.currentPosition )
    });
  };

  gonzoHero.prototype.autoAnimate = function() {
    var self  = this;
    var $this = $(this.el);

    this.autoSlide = setInterval(function() {

      if( self.currentPosition == self.numberOfSlides-1 ){
        if (!self.options.allowLoopback) return;
        self.currentPosition = 0; 
        self.displayedSlide = $('#slidesContainer .slide:first', $this);
      } 
      else{ 
        self.displayedSlide = self.displayedSlide.next();
        self.currentPosition = self.currentPosition + 1 
      }

      self.changeBackground();

      // Hide & show controls
      self.manageControls(self.currentPosition);

      // Move slideInner using margin-left
      $('#slidesInner', $this).stop(true,true)
                              .animate( {'marginLeft' : self.slideOuterWidth*(-self.currentPosition)} );
    }, this.options.speed );
  };

  gonzoHero.prototype.bindTouchEvents = function() {
    this.bindTouchstart();
    this.bindTouchend();
    this.bindTouchmove();
  };

  gonzoHero.prototype.bindTouchstart = function() {
    var self = this;

    $('.slide', this.el).bind('touchstart', function(event){
      if ( !self.isValidTouch(event) ) return;
      event.preventDefault();
      self.startX = event.originalEvent.touches[0].pageX;
      self.speedHelper = { startT: new Date().getTime(), startX: self.startX };
      self.lastSeenX = 0;
      self.active = true;
    });
  };

  gonzoHero.prototype.bindTouchend = function() {
    var self = this;
    var $this = $(this.el);

    $(document).bind('touchend', function(event){
      var closestSlide = { index: null, distance: null };

      $.each(self.slides, function(k,v){
        var distance = Math.abs( $(v).position().left - $this.position().left );
        if ( closestSlide.index === null || distance < closestSlide.distance ){
          closestSlide.index = k;
          closestSlide.distance = distance;
        }
      });

      var s = self.getSwipe(event.originalEvent.changedTouches[0].pageX);

      if ( s ){
        self.advance(s)
      }
      else{
        self.advance('goto', closestSlide.index);
      }

      self.active = false;

    });
  };

  gonzoHero.prototype.bindTouchmove = function() {
    var self = this;
    var $this = $(this.el);

    $(document).bind('touchmove', function(event){

      if ( !self.isValidTouch(event) || !self.active  ) return;

      event.preventDefault();
      clearInterval( self.autoSlide );

      // x-point from start
      var x = (event.originalEvent.touches[0].pageX - self.startX);
      var dx = (x - self.lastSeenX);
      self.lastSeenX = x;

      var moveString = null;
      var moveString = dx < 0 ? "-=" + Math.abs(dx) : "+=" + dx;

      var $slidesInner = $('#slidesInner', $this);
      var ml = parseInt($slidesInner.css('margin-left'));
      var w  = $slidesInner.outerWidth() - $("#slidesContainer").outerWidth();

      if ( (ml <= 0 && dx > 0) || (ml > -w && dx < 0 ) )
        $('#slidesInner', $this).css({ marginLeft: moveString });

    });
  };

  gonzoHero.prototype.ghNext = function(){
    this.advance('next');
  };

  gonzoHero.prototype.ghPrev = function() {
    this.advance('prev');
  };

  gonzoHero.prototype.isTouchDevice = function() {
    return  ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
  };

  gonzoHero.prototype.isValidTouch = function(event) {
    // That just sounds wrong.
    return event.originalEvent.hasOwnProperty('touches') && event.originalEvent.touches.length == 1;
  };

  gonzoHero.prototype.getSwipe = function(endX) {
    var v = (this.speedHelper.startX - endX) / (new Date().getTime() - this.speedHelper.startT);
   
    if (Math.abs(v) > 1.2){
      return v > 0 ? 'next' : 'prev';
    }    
    else{
      return null;
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


//    Quick & Dirty way
//    of allowing one to 
//    animate background 
//    colors if users don't
//    have jQuery UI on the 
//    page. 
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);