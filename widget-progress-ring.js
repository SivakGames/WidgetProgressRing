/*
============================================
PROGRESS RING WIDGET
By: Sivak Games

Version 1.0

Updated: Feb. 28, 2021
============================================


Required Arguments
=======================================
    target (string): The ID of the tag you want to put a ring inside of
    progressPercent (float): What percent to show? (needs to be represented as a number from 0 to 1)

Optional Arguments
=======================================
    radius (float): Size of the radius (defaults to 100)
	setParentWidth (bool): If set to true, will set the width of the containing tag to that of the radius. If false, the SVG will take up the entire width. (defaults to true)
    progressWidth (float): Width of the progress bar (defaults to 25)
    progressBorderWidth (float): Border width of the progress bar (set to 0 for none; defaults to 1)
    	※progressWidth and progressBorderWidth cannot be combined to a total greater or equal to the radius!

    progressBGcolor (string): Color of the area behind the progress bar
    progressColor (string): Color of the progress bar
    progressBorderColor (string): Color of the border of the progress bar (set to "none" for none)
    centerColor (string): Color of the center (set to "none" for none)

	thresholds (array of objects): Optionally have the progress color change upon dropping below certain levels. Keys are:
		level (float): The percent level to check.
		color (string): What color to change to upon dropping below this level
*/

class progressRing
{
	constructor(args)
	{	

//Default attributes
		const DEFAULT_RADIUS = 100;
		const DEFAULT_WIDTH = 25;
		const DEFAULT_BORDER_WIDTH  = 1;
		const DEFAULT_BORDER_COLOR  = "Black";
		const DEFAULT_BG_COLOR  = "Gray";
		const DEFAULT_COLOR = "SpringGreen";
		const DEFAULT_CENTER_COLOR  = "none";

		this.progressDashArrayMax = null;

		if(typeof(args) !== "object")
		{	
			args = args || {};
		}

		if(typeof(args.target !== "undefined") && document.getElementById(args.target) !== null)
		{
			//ID where this will be placed
			this.targetID = document.getElementById(args.target);

			//Remove any nodes
			while(this.targetID.hasChildNodes())
			{	this.targetID.removeChild(this.targetID.firstChild);
			}

			//Set sizes
			this.radius = (typeof(args.radius) !== "undefined") ? parseFloat(args.radius) : DEFAULT_RADIUS;
			this.progressWidth = (typeof(args.progressWidth) !== "undefined") ? parseFloat(args.progressWidth) : DEFAULT_WIDTH;
			this.progressBorderWidth = (typeof(args.progressBorderWidth) !== "undefined") ? parseFloat(args.progressBorderWidth) : DEFAULT_BORDER_WIDTH;

			this.setParentWidth = (typeof(args.setParentWidth) !== "undefined") ? Boolean(args.setParentWidth) : true;

			if(this.setParentWidth)
			{	this.targetID.style.width = this.radius + "px";
			}
			this.targetID.style.maxWidth = "100%";


			//If progress's width and border width are greater or equal to the radius, a bad image will be drawn
			//This will decrease to just fit the progress width and flag a warning
			if (this.progressWidth + this.progressBorderWidth >= this.radius)
			{	this.progressBorderWidth = 0;
				this.progressWidth = this.radius - 1;
				console.warn("Progress width and border width combined are larger than the radius!");
			}

			//Colors
			this.progressBGcolor = (typeof(args.progressBGcolor) !== "undefined") ? String(args.progressBGcolor) : DEFAULT_BG_COLOR;
			this.progressColor = (typeof(args.progressColor) !== "undefined") ? String(args.progressColor) : DEFAULT_COLOR;
			this.progressBorderColor = (typeof(args.progressBorderColor) !== "undefined") ? String(args.progressBorderColor) : DEFAULT_BORDER_COLOR;
			this.centerColor = (typeof(args.centerColor) !== "undefined") ? String(args.centerColor) : DEFAULT_CENTER_COLOR;
			
			//Color thresholds - If progress is below a certain point, the color shown will change.
			this.thresholds = [];
			if(typeof(args.thresholds === "object") || typeof(args.thresholds === "array"))
			{	
				for(let k in args.thresholds)
				{	let v = args.thresholds[k];
					
					if(typeof(v.level) === "number" && typeof(v.color) === "string")
					{	this.thresholds.push(v);
					}
					else
					{	console.warn("Missing appropriate threshold keys");

					}
				}
				this.thresholds.sort((a,b) => (a.level < b.level ? 1 : -1));
			}
			
			

			//The initial percent of progress
			this.initProgressPercent = (typeof(args.progressPercent) !== "undefined") ? parseFloat(args.progressPercent) : 0;
					
			this.createRings();
			this.writeInitProgress();
			this.setProgress(this.initProgressPercent);
		}
		else
		{
			console.error("Missing necessary arguments for progress ring constructor!");
		}

		return;
	}

	//Create the SVG with rings inside
	//====================================================================================
	createRings()
	{	
		const svgns = "http://www.w3.org/2000/svg";
		const centerPoint = this.radius + this.progressBorderWidth;
		const viewBoxEnd = centerPoint * 2;

		let outerRadius = this.radius - this.progressBorderWidth;
		let innerRadius = this.radius - this.progressBorderWidth - this.progressWidth;
		let progressRadius = this.radius - this.progressBorderWidth - (this.progressWidth / 2);

		//The 4 rings and their attributes
		let rings = 
		{	
			progressBG: {c:"progressBG", r:progressRadius, fill: "none", stroke: this.progressBGcolor, strokeW: this.progressWidth},
			progress:	{c:"progress", r:progressRadius, fill: "none", stroke: this.progressColor, strokeW: this.progressWidth},
			outer:		{c:"outer",	r:outerRadius, fill: "none", stroke: this.progressBorderColor, strokeW: this.progressBorderWidth},
			inner:		{c:"inner",	r:innerRadius, fill: this.centerColor, stroke: this.progressBorderColor, strokeW: this.progressBorderWidth},
		};

		let svgNode = document.createElementNS(svgns, "svg");
		this.domID = this.targetID.id + "-progressRing";

		svgNode.setAttribute("viewBox",`0 0 ${viewBoxEnd} ${viewBoxEnd}`);
		svgNode.style.transform = "rotate(270deg)";
		svgNode.style.display = "block";
		svgNode.id = this.domID;

		

		this.targetID.appendChild(svgNode);

		let parentCircleNode = document.getElementById(svgNode.id);
		for(let k in rings)
		{	
			let v = rings[k];
			let circle = document.createElementNS(svgns, 'circle');
			circle.setAttribute('r', v.r);
			circle.setAttribute('cx', centerPoint);
			circle.setAttribute('cy', centerPoint);
			circle.setAttribute('fill', v.fill);
			circle.setAttribute('stroke-width', v.strokeW);
			circle.setAttribute('stroke', v.stroke);
			circle.setAttribute('class', v.c);
			parentCircleNode.appendChild(circle);
		}
		return;
	}

	//Create a dash array to represent progress.
	//This is equal to the radius of the bar doubled times PI (i.e. the circumference).
	//====================================================================================
	writeInitProgress()
	{	
		let target = document.getElementById(this.domID).querySelector(".progress");
		let progressRadius = target.getAttribute("r");
		this.progressDashArrayMax = progressRadius * 2 *  Math.PI;
		target.style.strokeDasharray = this.progressDashArrayMax;
		return;
	}

	//Set the progress and update the visual.
	//This can be called after constructing with a new percent to change the progress.
	//====================================================================================
	setProgress(p)
	{	
		if(typeof(p) === "undefined")
		{	
			console.warn("Bad value was passed for progress. Defaulting to 0.");
			p = 0;
		}
		let percent = parseFloat(p);
		let dashOffset = this.progressDashArrayMax - (this.progressDashArrayMax * percent);
		
		let target = document.getElementById(this.domID).querySelector(".progress");
		target.style.strokeDashoffset = dashOffset;

		let useColor = this.progressColor;

		if(typeof(this.thresholds) !== "undefined" && this.thresholds.length > 0)
		{	for(let k in this.thresholds)
			{	
				let v = this.thresholds[k];
				if(percent <= v.level)
				{	useColor = v.color;
				}
			}
		}
		target.setAttribute("stroke",useColor);
		return;
	}
}

//Create a ring without storing the class in a variable.
function createProgressRing(args)
{	let ring = new progressRing(args);
	return;
}
