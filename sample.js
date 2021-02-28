var ringObj;

window.addEventListener("load",initRings);


function initRings()
{
//Method 1
//Creates a static ring with 75% progress, a light green meter, among other settings
//------------------------------------------------------------------------------------------------------------------
	let ringArgs1 =
	{
		target: "progress-ring1",
		radius: 200,
		progressPercent: 0.75,
		progressWidth: 15,
		progressBorderWidth: 1,
		setParentWidth: true,
		

		progressBGcolor: "DimGray",
		progressColor: "SkyBlue",
		progressBorderColor: "Black",
		centerColor: "none",
		
	};
	createProgressRing(ringArgs1);

//Method 2
//Creates a  ring with 35% progress, a light green meter, among other settings
//------------------------------------------------------------------------------------------------------------------
	let ringArgs2 =
	{
		target: "progress-ring2",
		radius: 300,
		progressPercent: 0.35,
		progressWidth: 75,
		progressBorderWidth: 5,
		setParentWidth: true,

		progressBGcolor: "#103",
		progressColor: "LightGreen",
		progressBorderColor: "#777",
		centerColor: "rgba(0,0,128,0.35)",
		thresholds: [
			{level: 0.6667, color: "Yellow"},
			{level: 0.3333, color: "Red"},
		]
	};
	ringObj = new progressRing(ringArgs2);
	return;
}