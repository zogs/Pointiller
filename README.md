# Pointiller
A javascript library that convert an image to pointillism with HTML5 Canvas


## How it works

It draws an image into a hidden canvas and perform an operation on the canvas pixels to return an arrays of points

## Demo

Look at demo.html to see it in action !

## How to use

```
// add the script
<script type="text/javascript" src="js/canvas.pointiller.js"></script>

// create a Pointiller instance 
var pointiller = new Pointiller(500,500); //width and height of the canvas

// add image (after being fully loaded)
pointiller.addImage(image,500,500); //width and height of the image

// get the points
var points = pointiller.toPoints(1); // size of the points

```

This library does not print the result. You have use the returned array of points to draw them as you want !


## Methods

`.toPoints(size);` : convert the image to points with fixed size

`.toAdaptivePoints(minSize,maxSize,step,tolerance);` : convert the image to points with adaptive size

`.excludeColor([r,g,b],tolerance);` : exclude a color from the conversion operation

`.getCanvas()` : get hidden canvas (for debug purpose)

## License

Use it as you want :)
