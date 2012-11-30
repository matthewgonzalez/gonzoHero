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
          enableDrag:       true,
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
    
    $this.addClass('gonzoHero'); // this needs to be set before the variables are defined
    
    var self                = this;
    this.currentPosition    = 0;
    this.slides             = $this.children(".slide");
    this.slideWidth         = $this.width();
    this.numberOfSlides     = this.slides.length;
    this.slideHeight        = this.slides.height();

    if ( this.isTouchDevice() && this.options.enableDrag )
          this.bindTouchEvents(); 
          
    // Custom next and previous events
    $this.bind( this.options.nextEvents, function(){ self.ghNext() });
    $this.bind( this.options.previousEvents, function(){ self.ghPrev() });


  $this.css({  position: 'relative' });
  
  
  
  
    // Wrap all .slides with .slideInner div
    this.slides.wrapAll('<div class="slidesInner"></div>').css({
      float : 'left',
      position : 'relative',
      width: this.slideWidth
    }).prepend('<span class="bgColor"></span>'); 
    
    
                
    // Set .slideInner width equal to total width of all slides
    $('.slidesInner', $this).css({width: ( this.slideWidth * this.numberOfSlides) });

    // Create .slideContainer and Remove scrollbar in JS
    $(".slidesInner", $this).wrap('<div class="slidesContainer"></div>');
    $(".slidesContainer", $this).css({overflow:"hidden", display: "block"});


    // Insert controls in the DOM
    if (this.options.showSideControls)
      this.makeControls();

    this.makeControlsNonSelectable();


    // Slide counter list    
    if ( this.numberOfSlides > 0 ){
      $this.append('<ul class="slideCounter"></ul>');
      for( i=1; i<= this.numberOfSlides; i++) {
        $(".slideCounter", $this).append('<li class="control"></li>');
      }
    }
    
    
   this.positionControls();
    
    
   $this.bind( "resize", function(e) {
      self.reposition();
    });
    
    // Hide left arrow control on first load
    this.manageControls(this.currentPosition);

    this.autoSlide = 0;
    this.bindHover();
    this.displayedSlide = $('.slidesContainer .slide:first', $this);
    
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
    if (bgColor == "rgba(0, 0, 0, 0)") return;
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
      $('.leftControl', $this).hide(); 
      $('.restartControl', $this).hide();
    } else { 
      $('.leftControl', $this).show();
    }

    // Hide right arrow if position is last slide
    if( position == this.numberOfSlides-1 ){ 
      $('.rightControl', $this).hide();
      if (this.options.allowLoopback) $('.restartControl', $this).show();
    } 
    else { 
      $('.rightControl', $this).show(); 
      if (this.options.allowLoopback)  $('.restartControl', $this).hide();
    }
  };

  gonzoHero.prototype.makeControls = function() {
    $(this.el).prepend('<span class="control leftControl">&lsaquo;</span>')
              .append('<span class="control rightControl">&rsaquo;</span>')
              .append('<span class="control restartControl">&crarr;</span>');
  };

  gonzoHero.prototype.makeControlsNonSelectable = function(first_argument) {
    $('.control', $(this.el)).css({
      "-webkit-touch-callout": "none",
      "-webkit-user-select":   "none",
      "-khtml-user-select":    "none",
      "-moz-user-select":      "none",
      "-ms-user-select":       "none",
      "user-select":           "none"
    });
  };

  gonzoHero.prototype.positionControls = function() {
    
      var self = this;
      var $this = $(this.el);
      // Place the controls.
      
      $('.leftControl, .rightControl, .restartControl', $this).css({ height : this.slides.height(), lineHeight : this.slides.height() + 'px', top: 0, position: 'absolute', cursor: 'pointer', zIndex: 333});
      $('.rightControl, .restartControl', $this).css({  right : this.options.controlOffset, top : 0 });
      $('.leftControl', $this).css({   left  : this.options.controlOffset });
      
      var controlWidth = 0;
      $("ul.slideCounter li", $this).each(function() {
            controlWidth = controlWidth + $(this).outerWidth(true);
      });
      
      $("ul.slideCounter", $this).css({ float: "left", position:"absolute", bottom: -45, left:  ($this.width())/2 });
      $("ul.slideCounter", $this).css({ marginLeft: "-"+ controlWidth/2+"px" });
      $("ul.slideCounter li", $this).css({ cursor: "pointer"});
  };
  
  gonzoHero.prototype.reposition = function() {
    var self = this;
    var $this = $(this.el);
    
    
        clearTimeout( self.autoSlide ); 
         
         $('.slidesInner', $this).css('width', ( $this.width() * self.numberOfSlides));
        
        var slideWidth = 0;
        var slideHeight = 0;
        $('.slide', $this).each(function(){
           $(this).css({
            float : 'left',
            width : $(this).closest(".gonzoHero").width(),
            position : 'relative'
          })
          slideWidth = $(this).closest(".gonzoHero").width();
        });
        
        
        
         self.slideWidth    = slideWidth;
         self.slideHeight   = slideHeight;
         
         
         
         self.positionControls();
           
         self.advance('goto', self.currentPosition);
    
        
        if ( this.options.autoAnimate ) this.autoAnimate();
     
 
  }
  
  // Create event listeners for .controls clicks
  gonzoHero.prototype.controlListener = function() {
    var self = this;
    var $this = $(this.el);

    // Create event listeners for .control's clicks
    $('.control', $this).bind('click', function(){
    
      // Determine new position
      clearTimeout( self.autoSlide );
      
      if ( $(this).hasClass('rightControl') ){
        self.advance('next');
      } 
      else if ( $(this).hasClass('leftControl') ){ 
        self.advance('prev');
      } 
      else if ( $(this).hasClass('restartControl') ) {
        self.advance('restart');
      } 
      else{
        // a click on the 'dot' indicators
        self.advance('goto', $(this).index());
      }
      
      
      if ( self.options.autoAnimate ) self.autoAnimate();
    });
  };

  gonzoHero.prototype.advance = function(direction, which) {
    var self = this;
    var $this = $(this.el);
        
            
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
      this.displayedSlide   = $('.slidesContainer .slide:first', $this);
    } 
    else if ( direction == 'goto'){
      this.currentPosition  = which;
      this.displayedSlide   = $(".slidesContainer .slide:nth-child(" + ( which + 1 ) + ")", $this);
    } 

    this.changeBackground();
    this.manageControls( this.currentPosition );
    
    // Move slideInner using margin-left
    
      $('.slidesInner', $this).stop(true,true)
                              .animate({'marginLeft' : this.slideWidth*( -this.currentPosition )
      });
      
  };

  gonzoHero.prototype.autoAnimate = function() {
          
    var self  = this;
    var $this = $(this.el);
    
    function progressSlides() {
        self.advance('next');
        self.autoSlide = setTimeout( progressSlides , self.options.speed );
    }
      
    self.autoSlide = setTimeout( progressSlides , self.options.speed ); 
  
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
      clearTimeout( self.autoSlide );
    });
  };

  gonzoHero.prototype.bindTouchend = function() {
    var self = this;
    var $this = $(this.el);

    $('.slide', this.el).bind('touchend', function(event){
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
      
      
      if ( self.options.autoAnimate ) self.autoAnimate();

    });
  };

  gonzoHero.prototype.bindTouchmove = function() {
    var self = this;
    var $this = $(this.el);

    $(document).bind('touchmove', function(event){
      if ( !self.isValidTouch(event) || !self.active  ) return;
      event.preventDefault();

      if (this.autoAnimate) 
        clearTimeout( this.autoAnimate );

      // x-point from start
      var x = (event.originalEvent.touches[0].pageX - self.startX);
      var dx = (x - self.lastSeenX);
      self.lastSeenX = x;

      var moveString = null;
      var moveString = dx < 0 ? "-=" + Math.abs(dx) : "+=" + dx;

      var $slidesInner = $('.slidesInner', $this);
      var ml = parseInt($slidesInner.css('margin-left'));
      var w  = $slidesInner.outerWidth() - $(".slidesContainer").outerWidth();

      if ( (ml <= 0 && dx > 0) || (ml > -w && dx < 0 ) )
        $('.slidesInner', $this).css({ marginLeft: moveString });

    });
  };

  gonzoHero.prototype.bindHover = function() {
    var self = this;
    var $this = $(this.el);
    
    $this.hover(  function(){ 
                    clearTimeout( self.autoSlide );
                  }, 
                  function(){
                    clearTimeout( self.autoSlide );
                    if ( self.options.autoAnimate ) self.autoAnimate();
                  }
              );
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
(function(o,d){var k="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",h=/^([\-+])=\s*(\d+\.?\d*)/,g=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(p){return[p[1],p[2],p[3],p[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(p){return[p[1]*2.55,p[2]*2.55,p[3]*2.55,p[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(p){return[parseInt(p[1],16),parseInt(p[2],16),parseInt(p[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(p){return[parseInt(p[1]+p[1],16),parseInt(p[2]+p[2],16),parseInt(p[3]+p[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(p){return[p[1],p[2]/100,p[3]/100,p[4]]}}],e=o.Color=function(q,r,p,s){return new o.Color.fn.parse(q,r,p,s)},j={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},n={"byte":{floor:true,max:255},percent:{max:1},degrees:{mod:360,floor:true}},m=e.support={},b=o("<p>")[0],a,l=o.each;b.style.cssText="background-color:rgba(1,1,1,.5)";m.rgba=b.style.backgroundColor.indexOf("rgba")>-1;l(j,function(p,q){q.cache="_"+p;q.props.alpha={idx:3,type:"percent",def:1}});function i(q,s,r){var p=n[s.type]||{};if(q==null){return(r||!s.def)?null:s.def}q=p.floor?~~q:parseFloat(q);if(isNaN(q)){return s.def}if(p.mod){return(q+p.mod)%p.mod}return 0>q?0:p.max<q?p.max:q}function f(p){var r=e(),q=r._rgba=[];p=p.toLowerCase();l(g,function(w,x){var u,v=x.re.exec(p),t=v&&x.parse(v),s=x.space||"rgba";if(t){u=r[s](t);r[j[s].cache]=u[j[s].cache];q=r._rgba=u._rgba;return false}});if(q.length){if(q.join()==="0,0,0,0"){o.extend(q,a.transparent)}return r}return a[p]}e.fn=o.extend(e.prototype,{parse:function(v,t,p,u){if(v===d){this._rgba=[null,null,null,null];return this}if(v.jquery||v.nodeType){v=o(v).css(t);t=d}var s=this,r=o.type(v),q=this._rgba=[];if(t!==d){v=[v,t,p,u];r="array"}if(r==="string"){return this.parse(f(v)||a._default)}if(r==="array"){l(j.rgba.props,function(w,x){q[x.idx]=i(v[x.idx],x)});return this}if(r==="object"){if(v instanceof e){l(j,function(w,x){if(v[x.cache]){s[x.cache]=v[x.cache].slice()}})}else{l(j,function(x,y){var w=y.cache;l(y.props,function(z,A){if(!s[w]&&y.to){if(z==="alpha"||v[z]==null){return}s[w]=y.to(s._rgba)}s[w][A.idx]=i(v[z],A,true)});if(s[w]&&o.inArray(null,s[w].slice(0,3))<0){s[w][3]=1;if(y.from){s._rgba=y.from(s[w])}}})}return this}},is:function(r){var p=e(r),s=true,q=this;l(j,function(t,v){var w,u=p[v.cache];if(u){w=q[v.cache]||v.to&&v.to(q._rgba)||[];l(v.props,function(x,y){if(u[y.idx]!=null){s=(u[y.idx]===w[y.idx]);return s}})}return s});return s},_space:function(){var p=[],q=this;l(j,function(r,s){if(q[s.cache]){p.push(r)}});return p.pop()},transition:function(q,w){var r=e(q),s=r._space(),t=j[s],u=this.alpha()===0?e("transparent"):this,v=u[t.cache]||t.to(u._rgba),p=v.slice();r=r[t.cache];l(t.props,function(A,C){var z=C.idx,y=v[z],x=r[z],B=n[C.type]||{};if(x===null){return}if(y===null){p[z]=x}else{if(B.mod){if(x-y>B.mod/2){y+=B.mod}else{if(y-x>B.mod/2){y-=B.mod}}}p[z]=i((x-y)*w+y,C)}});return this[s](p)},blend:function(s){if(this._rgba[3]===1){return this}var r=this._rgba.slice(),q=r.pop(),p=e(s)._rgba;return e(o.map(r,function(t,u){return(1-q)*p[u]+q*t}))},toRgbaString:function(){var q="rgba(",p=o.map(this._rgba,function(r,s){return r==null?(s>2?1:0):r});if(p[3]===1){p.pop();q="rgb("}return q+p.join()+")"},toHslaString:function(){var q="hsla(",p=o.map(this.hsla(),function(r,s){if(r==null){r=s>2?1:0}if(s&&s<3){r=Math.round(r*100)+"%"}return r});if(p[3]===1){p.pop();q="hsl("}return q+p.join()+")"},toHexString:function(p){var q=this._rgba.slice(),r=q.pop();if(p){q.push(~~(r*255))}return"#"+o.map(q,function(s){s=(s||0).toString(16);return s.length===1?"0"+s:s}).join("")},toString:function(){return this._rgba[3]===0?"transparent":this.toRgbaString()}});e.fn.parse.prototype=e.fn;function c(t,s,r){r=(r+1)%1;if(r*6<1){return t+(s-t)*r*6}if(r*2<1){return s}if(r*3<2){return t+(s-t)*((2/3)-r)*6}return t}j.hsla.to=function(t){if(t[0]==null||t[1]==null||t[2]==null){return[null,null,null,t[3]]}var p=t[0]/255,w=t[1]/255,x=t[2]/255,z=t[3],y=Math.max(p,w,x),u=Math.min(p,w,x),A=y-u,B=y+u,q=B*0.5,v,C;if(u===y){v=0}else{if(p===y){v=(60*(w-x)/A)+360}else{if(w===y){v=(60*(x-p)/A)+120}else{v=(60*(p-w)/A)+240}}}if(A===0){C=0}else{if(q<=0.5){C=A/B}else{C=A/(2-B)}}return[Math.round(v)%360,C,q,z==null?1:z]};j.hsla.from=function(w){if(w[0]==null||w[1]==null||w[2]==null){return[null,null,null,w[3]]}var v=w[0]/360,u=w[1],t=w[2],r=w[3],x=t<=0.5?t*(1+u):t+u-t*u,y=2*t-x;return[Math.round(c(y,x,v+(1/3))*255),Math.round(c(y,x,v)*255),Math.round(c(y,x,v-(1/3))*255),r]};l(j,function(q,s){var r=s.props,p=s.cache,u=s.to,t=s.from;e.fn[q]=function(z){if(u&&!this[p]){this[p]=u(this._rgba)}if(z===d){return this[p].slice()}var w,y=o.type(z),v=(y==="array"||y==="object")?z:arguments,x=this[p].slice();l(r,function(A,C){var B=v[y==="object"?A:C.idx];if(B==null){B=x[C.idx]}x[C.idx]=i(B,C)});if(t){w=e(t(x));w[p]=x;return w}else{return e(x)}};l(r,function(v,w){if(e.fn[v]){return}e.fn[v]=function(A){var C=o.type(A),z=(v==="alpha"?(this._hsla?"hsla":"rgba"):q),y=this[z](),B=y[w.idx],x;if(C==="undefined"){return B}if(C==="function"){A=A.call(this,B);C=o.type(A)}if(A==null&&w.empty){return this}if(C==="string"){x=h.exec(A);if(x){A=B+parseFloat(x[2])*(x[1]==="+"?1:-1)}}y[w.idx]=A;return this[z](y)}})});e.hook=function(q){var p=q.split(" ");l(p,function(r,s){o.cssHooks[s]={set:function(w,x){var u,v,t="";if(o.type(x)!=="string"||(u=f(x))){x=e(u||x);if(!m.rgba&&x._rgba[3]!==1){v=s==="backgroundColor"?w.parentNode:w;while((t===""||t==="transparent")&&v&&v.style){try{t=o.css(v,"backgroundColor");v=v.parentNode}catch(y){}}x=x.blend(t&&t!=="transparent"?t:"_default")}x=x.toRgbaString()}try{w.style[s]=x}catch(y){}}};o.fx.step[s]=function(t){if(!t.colorInit){t.start=e(t.elem,s);t.end=e(t.end);t.colorInit=true}o.cssHooks[s].set(t.elem,t.start.transition(t.end,t.pos))}})};e.hook(k);o.cssHooks.borderColor={expand:function(q){var p={};l(["Top","Right","Bottom","Left"],function(s,r){p["border"+r+"Color"]=q});return p}};a=o.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}})(jQuery);

/*
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,h,c){var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=250;e[f]=true;$.event.special[j]={setup:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.add(l);$.data(this,d,{w:l.width(),h:l.height()});if(a.length===1){g()}},teardown:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.not(l);l.removeData(d);if(!a.length){clearTimeout(i)}},add:function(l){if(!e[f]&&this[k]){return false}var n;function m(s,o,p){var q=$(this),r=$.data(this,d);r.w=o!==c?o:q.width();r.h=p!==c?p:q.height();n.apply(this,arguments)}if($.isFunction(l)){n=l;return m}else{n=l.handler;l.handler=m}}};function g(){i=h[k](function(){a.each(function(){var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}});g()},e[b])}})(jQuery,this);