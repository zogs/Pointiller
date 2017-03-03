/*!
 * Pointiller.js 1.0
 *
 * 1 - Add image to a hidden canvas 
 * 2 - Perform operations to convert the canvas pixels into points objects
 * 3 - Return array of points
 *
 * By Zogs
 * https://github.com/zogs
 * @license MIT licensed
 *
 * Copyright (C) 2016 zogs.org - A project by Simon Guichard
 */

function Pointiller(width,height) {
	
	this.canvas = document.createElement('canvas');
	this.canvas.width = width;
	this.canvas.height = height;
	this.canvas.style = 'border:1px solid #EEE';
	this.context = this.canvas.getContext('2d');
	this.pixels = [];
	this.colorTolerance = 1;

	/**
	 * Add image to be convert into points
	 * @param {Image} image  
	 * @param {int} width of the image
	 * @param {int} height of the image
	 */
	this.addImage = function(image,width,height) {

		this.context.drawImage(image,0,0,width,height)
		this.pixels = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
		return this;
	}

	/**
	 * Clear 
	 * @return {this} 
	 */
	this.clear = function() {

		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		return this;
	}

	/**
	 * Ajust boundaries before converts operations
	 * @param  {int} x      
	 * @param  {int} y      
	 * @param  {int} width  
	 * @param  {int} height 
	 * @return {this}
	 */
	this.bounds = function(x,y,width,height) {

		this.pixels = this.context.getImageData(x,y,width,height);
		return this;
	}

	/**
	 * Convert canvas pixels into fixed sized points
	 * @param  {Number} weight Size of the points
	 * @return {array} Array of points
	 */
    this.toPoints = function(weight = 1) {

        const points = [];
        const width = this.pixels.width;
        const height = this.pixels.height;
        let posx = 0;

        for(let i=0,len=this.pixels.data.length; i < len; i+=(4*weight)){
            posx+=weight;            
            if(posx >= width) {
                posx = 0;
                if(weight>1) i += (width*4)*(weight-1);                
                continue;
            }
            if(this.pixels.data[i+3] === 0) continue;
            let x = Math.floor((i / 4) % width);
            let y = Math.floor((i / 4) / width);
            let r = this.pixels.data[i+0]; // Red
            let g = this.pixels.data[i+1]; // Green
            let b = this.pixels.data[i+2]; // Blue
            let a = this.pixels.data[i+3];
            let point = {r:r,g:g,b:b,a:a,x:x,y:y,w:weight};
            points.push(point);

        }

        return points;
    }

    /**
     * Convert canvas pixels into adaptive sized points
     *
     * (try to fit big points first, then reduce the size to fit all the pixels )
     * 
     * @param  {int} minSize   minimum size of fittable points
     * @param  {int} maxSize   maximum size of fittable points
     * @param  {int} step      reducing step
     * @param  {int} tolerance color tolerance to ajust for better result
     * @return {points} array of points           
     */
    this.toAdaptivePoints = function(minSize,maxSize,step=1,tolerance=1) {

        let points = [];
        let size = maxSize;
        this.colorTolerance = tolerance;
        while(size >= minSize) {            
            points = points.concat(this.toSizablePoints(size,true));
            size -= step;
        }
        //points = points.concat(convertToPoints(1));

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(this.pixels,0,0);
  
        return points;
    }

    /**
     * Convert maximum canvas pixels into fixed sized points
     * @param  {int} size of the points
     * @param  {bool} if true, pixels will be set to transparent after conversion, to avoid re-convert it later
     * @return {points}      array of points
     */
     this.toSizablePoints = function(size = 1, extrude = false) {

        const points = [];
        const width = this.pixels.width;
        const height = this.pixels.height;
        let posx = 0;

        for(let i=0,len=this.pixels.data.length; i < len; i+=4) {

            if(this.pixels.data[i+3] === 0) continue;
            let x = Math.floor((i / 4) % width);
            let y = Math.floor((i / 4) / width);
            let r = this.pixels.data[i+0]; // Red
            let g = this.pixels.data[i+1]; // Green
            let b = this.pixels.data[i+2]; // Blue
            let a = this.pixels.data[i+3];
            let radius = size;
            if(true === this.samePixelsColorArroundRadius(x,y,radius)) {
                let point = {r:r,g:g,b:b,a:a,x:x,y:y,w:size*2};
                points.push(point);                
                if(extrude === true) this.makePixelsTransparentArroundRadius(x,y,radius);
            }
        }

        return points;
    }

    /**
     * Check if all pixels arround a center are all the same color
     * @param  {int} x0 
     * @param  {int} y0 
     * @param  {int} r  radius
     * @return {bool}    
     */
    this.samePixelsColorArroundRadius = function(x0,y0,r) {

        let x = r;
        let y = 0;
        let decisionOver2 = 1 - x;

        while (x >= y) {
            if(false === this.samePixelColor(x0,y0,x + x0, y + y0)) return false;
            if(false === this.samePixelColor(x0,y0,y + x0, x + y0)) return false;
            if(false === this.samePixelColor(x0,y0,-x + x0, y + y0)) return false;
            if(false === this.samePixelColor(x0,y0,-y + x0, x + y0)) return false;
            if(false === this.samePixelColor(x0,y0,-x + x0, -y + y0)) return false;
            if(false === this.samePixelColor(x0,y0,-y + x0, -x + y0)) return false;
            if(false === this.samePixelColor(x0,y0,x + x0, -y + y0)) return false;
            if(false === this.samePixelColor(x0,y0,y + x0, -x + y0)) return false;
            y++;
            if (decisionOver2 <= 0) {
                decisionOver2 += 2 * y + 1; // Change in decision criterion for y -> y+1
            } else {
                x--;
                decisionOver2 += 2 * (y - x) + 1; // Change for y -> y+1, x -> x-1
            } 
        }
        return true;  

    }

    /**
     * Check if two pixels are the same color
     * (ignore transparent pixels)
     * @param  {int} x0 
     * @param  {int} y0 
     * @param  {int} x1 
     * @param  {int} y1 
     * @return {bool}    
     */
    this.samePixelColor = function(x0,y0,x1,y1) {

        const idx0 = this.pixelIndexer(x0,y0);
        const idx1 = this.pixelIndexer(x1,y1);
        const c0 = [this.pixels.data[idx0],this.pixels.data[idx0+1],this.pixels.data[idx0+2]];
        const c1 = [this.pixels.data[idx1],this.pixels.data[idx1+1],this.pixels.data[idx1+2]];
        if(this.pixels.data[idx0+3] === 0 || this.pixels.data[idx1+3] === 0) return false;
        if(this.colorDifference(c0,c1) <= this.colorTolerance) return true; 
        return false;
    }

    /**
     * The name is self explanatory :)
     * @param  {int} x0 
     * @param  {int} y0 
     * @param  {int} r  radius
     */
	this.makePixelsTransparentArroundRadius = function(x0,y0,r) {

        let xmin = x0 - r;
        let xmax = x0 + r;
        let ymin = y0 - r;
        let ymax = y0 + r;
        let idxmin = this.pixelIndexer(xmin,ymin);
        let idxmax = this.pixelIndexer(xmax,ymax);
        const width = this.canvas.width;

        for(var i=idxmin; i <= idxmax; i+=4) {

            let x = Math.floor((i / 4) % width);
            let y = Math.floor((i / 4) / width);
            let dist = Math.sqrt(Math.pow(x-x0,2) + Math.pow(y-y0,2));
            if(dist > r) continue;
            this.makeTransparentPixel(x,y);
        }
    }

    /**
     * Exclude a color before points conversion
     * @param  {array} color     array of [r,g,b]
     * @param  {int} tolerance Tolerance number to ajust for better results
     */
    this.excludeColor = function(color,tolerance) {

        var count = 0;
        for(let i=0,len = this.pixels.data.length; i < len; i+=4) {
        	//discart transparent pixel
        	if(this.pixels.data[i+3] === 0) continue;
        	// calcul color difference
        	let diff = this.colorDifference(color,[this.pixels.data[i+0],this.pixels.data[i+1],this.pixels.data[i+2]]);
            if(diff <= tolerance) {                
                count++;
                this.pixels.data[i+3] = 0; // set alpha to zero
            }
                       
        }

        this.context.putImageData(this.pixels,0,0);
        return this.pixels;        
    }

    this.makeTransparentPixel = function(x,y,a=0) {

        const idx = this.pixelIndexer(x,y);
        this.pixels.data[idx+3] = a;
    }

    this.colorDifference = function(c1,c2) {
        return Math.sqrt(Math.pow(c1[0]-c2[0],2)+Math.pow(c1[1]-c2[1],2)+Math.pow(c1[2]-c2[2],2));
    }

    this.pixelIndexer = function(i,j) {
        return 4 * (j * this.canvas.width + i);        
    }

	this.getCanvas = function() {
		return this.canvas;
	}

	this.setCanvas = function(canvas) {
		this.canvas = canvas;
		return this;
	}
}