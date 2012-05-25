# gonzohero.jquery.js

_Simple, elegant CSS3 jQuery slider solution that just works (and more)._

=====

[DEMO](http://jsfiddle.net/YagRL/18/)

gonzoHero is a lightweight and easy to setup jQuery slider, turning your images, elements, and CTAs into an elegant slider.

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

            
Example:
            
      $(document).ready(function(){
            $("#eeSlideshow").gonzoHero({autoAnimate: false, speed: 6000, controlOffset: -100});
      }

=====

##Features currently being developed:

- Kinetic touch/drag controls
- Default styles option
- Support for early IE browsers (ie. IE7)