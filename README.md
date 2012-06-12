# gonzohero.jquery.js

_Simple, elegant, mobile-friendly CSS3 jQuery slider solution that just works (and more)._

=====

[VIEW DEMO](http://jsfiddle.net/YagRL/21/)

gonzoHero is an extremely versatile, lightweight and easy to setup mobile/touch supported jQuery slider, turning your images, elements, and CTAs into an elegant slider.

## How to use

Simply create a series of DIVs with the class "slide" nested inside another DIV. 

      <div id="someHero">
         <div class="slide"></div>
         <div class="slide"></div>
         <div class="slide"></div>
      </div>

Then call the gonzoHero function on the wrapper DIV.

	$("#someHero").gonzoHero();


Alternatively, you can pass a hash of parameters. Below are the defaults.

### Parameters with their defaults:
            
            // Auto-animate the slider. (Auto-animation is paused when mouse is over slide)
            autoAnimate:                  true

            // Time between animations (only applicable for when autoAnimate is set to "true")
            speed:            5000

            // Determines the position of the slide controls
            controlOffset:             -60

            // Toggles mobile touch/drag controls
            enableDrag:             true

            // Toggle on/off side controls
            showSideControls:             true

            // Add a space-delimited set of events which you can programmatically trigger to cause gonzoHero to advance and go back.
            nextEvents:       "ghNext"
            previousEvents:   "ghPrev"

            // Slides revert to beginning after last slide
            allowLoopback:             true

            
Example:
            
      $(document).ready(function(){
            $("#eeSlideshow").gonzoHero({autoAnimate: false, speed: 6000, controlOffset: -100});
      }

###BONUS!!!

gonzoHero has a "bonus" feature that allows the background-color of your slideshow to smoothly transition between slides. HOW CAN I DO THIS?! THERE'S NO OPTION FOR IT!

Be calm. gonzoHero automatically prepends unobtrusive SPANs into each of your slides with the class "bgColor". 

All you must do is define the background-color for the "bgColor" SPAN and gonzoHero takes care of the slide color transitioning for you.

Example:

	#someHero .slide2 .bgColor { background-color: hotpink } // This will create a smooth background-color transition between ".slide1" and its adjacent slides

To see this color transitioning in action [view the demo](http://jsfiddle.net/YagRL/21/).

Happy hero-ing!

=====

##Features currently being developed:

- Default styles option
- Support for early IE browsers (ie. IE7)