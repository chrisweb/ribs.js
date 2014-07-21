ribs.js
===========

This project is not ready for use in production. It's still under heavy development. I wrote this for another project I work on right now, but its still far from being stable. Testing are fixes and comments are welcome.

main goal(s):
* extend backbone view to automate some tasks
* a must have is that views code should not contain any html markup, every bit of html should be in the template so that designers only have to touch that file
* new collection view to build lists and when destroyed auto close children
* new controller
* views loader based on requirejs
* collections batch save for all models at once

sub goal(s):
* utilites library with console log wrapper that allows colored messages (for browser / nodejs)
* jquery ui responsive dialog

future:
* use promises
https://github.com/jakearchibald/es6-promise
* use shadow dom for views (polymer shadow dom polyfill)
https://github.com/polymer/ShadowDOM
