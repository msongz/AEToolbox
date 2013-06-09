﻿// AnimToolbox 0.1 
// by Nick Fox-Gieg
//
// based on KinectToPin Motion Capture Tools panel
// by Victoria Nece and Nick Fox-Gieg
// www.kinecttopin.com
// 
// Thanks to Jeff Almasol, Dan Ebberts, Christopher Green, Peter Kahrel and Chris Wright
// 

{

// AnimToolbox Panel Setup

var jointNamesMaster = ["head", "neck", "torso", "l_shoulder", "l_elbow", "l_hand", "r_shoulder", "r_elbow", "r_hand", "l_hip", "l_knee", "l_foot", "r_hip", "r_knee", "r_foot"];

// File path to skeleton visualizer preset
var ffxpath =  new Folder((new File($.fileName)).path + "/Kinect Skeleton.ffx");

function buildUI(this_obj_) {
var win = (this_obj_ instanceof Panel)
? this_obj_
: new Window('palette', 'Script Window',[760,345,1120,597]);

	   	//Jeff Almasol's solution to fix text color
	var winGfx = win.graphics;
	var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0,0,0], 1);

//X start, Y start, X end, Y end ...Y increments of 30
win.basicGroup = win.add('panel', [4,4,165,153], 'Basic', {borderStyle: "etched"});
win.advGroup = win.add('panel', [174,4,335,123], 'Advanced', {borderStyle: "etched"});

win.but_01 = win.basicGroup.add('button', [8,15,152,43], 'Bake Keyframes');
win.but_03 = win.basicGroup.add('button', [8,45,152,73], 'Nulls for Pins');
win.but_05 = win.basicGroup.add('button', [8,75,152,103], 'Make Loop');
win.but_07 = win.basicGroup.add('button', [8,105,152,133], 'Onion Skin');
//--
win.but_02 = win.advGroup.add('button', [8,15,152,43], 'Lock Y Rotation');
win.but_04 = win.advGroup.add('button', [8,45,152,73], 'Parentable Mocap Null');
win.but_06 = win.advGroup.add('button', [8,75,152,103], 'Handheld Camera');


win.but_01.onClick = bakePinKeyframes;
win.but_03.onClick = nullsForPins;
win.but_05.onClick = makeLoop;
win.but_07.onClick = onionSkin;
//--
win.but_02.onClick = lockRotation;
win.but_04.onClick = parentableNull;
win.but_06.onClick = handheldCamera;

return win
}
var w = buildUI(this);
if (w.toString() == "[object Panel]") {
w;
} else {
w.show();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// create an adjustment layer with controllable onion skinning
function handheldCamera(){  //start script
    app.beginUndoGroup("Make a \"Handheld\" Camera");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else {
        var sW = theComp.width/2;
        var sH = theComp.height/2; 

        var compcam = theComp.layers.addCamera("Handheld Camera", [sW,sH]);
        compcam.property("position").setValue([sW,sH,-1866.6667]);        

        var ctlPos = theComp.layers.addNull();
        var ctlPoi = theComp.layers.addNull();
        ctlPos.name = "cam_pos";
        ctlPoi.name = "cam_poi";
        ctlPos.threeDLayer = true;

        compcam.parent = ctlPos;
        
        var expr = "var x = thisComp.layer(\"cam_poi\").transform.position[0] - (thisComp.width/2);" + "\r" +
                   "var y = thisComp.layer(\"cam_poi\").transform.position[1] - (thisComp.height/2);" + "\r" +
                   "var z = 0;" + "\r" +
                   "[x,y,z];";
        compcam.property("Point of Interest").expression = expr;
        
        /*
        var solid = theComp.layers.addSolid([0, 1.0, 1.0], "Onion Skinning", theComp.width, theComp.height, 1);
        solid.adjustmentLayer = true;
        solid.locked = true;
        var echo = solid.property("Effects").addProperty("Echo");
        var slider = solid.property("Effects").addProperty("Slider Control");
        slider.name = "Number of Frames";
        slider.property("Slider").setValue(1);
        
        var prop1 = solid.effect("Echo")("Echo Time (seconds)");
        var prop2 = solid.effect("Echo")("Number Of Echoes");
        var prop3 = solid.effect("Echo")("Starting Intensity");
        var prop4 = solid.effect("Echo")("Decay");
        var prop5 = solid.effect("Echo")("Echo Operator");

        prop1.expression = "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" + 
                           "var d = thisComp.frameDuration;" + "\r" + 
                           "var rd;" + "\r" + 
                           "if(s>=0){" + "\r" + 
                           "rd = -d;" + "\r" + 
                           "}else if (s<0){" + "\r" + 
                           "rd = d;" + "\r" + 
                           "}";

        prop2.expression = "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" +
                           "var rs;" + "\r" +
                           "if (s>0){" + "\r" +
                           "rs = s;" + "\r" +
                           "}else if (s==0){" + "\r" +
                           "rs = 0;" + "\r" +
                           "}else if (s<0){" + "\r" +
                           "rs = -s;" + "\r" +
                           "}" + "\r" +
                           "rs;"
        prop3.expression = "var val = 0.5;" + "\r" +
                           "var offset = 0.175;" + "\r" +
                           "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" +
                           "var rtn;" + "\r" +
                           "if(s<0) s = -s;" + "\r" +
                           "if(s!=0){" + "\r" +
                           "rtn = val + (offset/s);" + "\r" +
                           "}else{" + "\r" +
                           "rtn=1;" + "\r" +
                           "}" + "\r" +
                           "rtn;"
        prop4.setValue(0.5);
        prop5.setValue(7);
        */
    }
 
    app.endUndoGroup();
}  //end script

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// create an adjustment layer with controllable onion skinning
function onionSkin(){  //start script
    app.beginUndoGroup("Make Onion Skin Layer");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else { 
        var solid = theComp.layers.addSolid([0, 1.0, 1.0], "Onion Skinning", theComp.width, theComp.height, 1);
        solid.adjustmentLayer = true;
        var echo = solid.property("Effects").addProperty("Echo");
        var slider = solid.property("Effects").addProperty("Slider Control");
        slider.name = "Number of Frames";
        slider.property("Slider").setValue(1);
        
        var prop1 = solid.effect("Echo")("Echo Time (seconds)");
        var prop2 = solid.effect("Echo")("Number Of Echoes");
        var prop3 = solid.effect("Echo")("Starting Intensity");
        var prop4 = solid.effect("Echo")("Decay");
        var prop5 = solid.effect("Echo")("Echo Operator");

        prop1.expression = "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" + 
                           "var d = thisComp.frameDuration;" + "\r" + 
                           "var rd;" + "\r" + 
                           "if(s>=0){" + "\r" + 
                           "rd = -d;" + "\r" + 
                           "}else if (s<0){" + "\r" + 
                           "rd = d;" + "\r" + 
                           "}";

        prop2.expression = "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" +
                           "var rs;" + "\r" +
                           "if (s>0){" + "\r" +
                           "rs = s;" + "\r" +
                           "}else if (s==0){" + "\r" +
                           "rs = 0;" + "\r" +
                           "}else if (s<0){" + "\r" +
                           "rs = -s;" + "\r" +
                           "}" + "\r" +
                           "rs;";
        prop3.expression = "var val = 0.5;" + "\r" +
                           "var offset = 0.175;" + "\r" +
                           "var s = effect(\"Number of Frames\")(\"Slider\");" + "\r" +
                           "var rtn;" + "\r" +
                           "if(s<0) s = -s;" + "\r" +
                           "if(s!=0){" + "\r" +
                           "rtn = val + (offset/s);" + "\r" +
                           "}else{" + "\r" +
                           "rtn=1;" + "\r" +
                           "}" + "\r" +
                           "rtn;";
        prop4.setValue(0.5);
        prop5.setValue(7);

        solid.locked = true;
    }
 
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// enable Time Remap and apply a loop script
function makeLoop(){  //start script
    app.beginUndoGroup("Make Time Remap Loop");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else { 
        var theLayers = theComp.selectedLayers;
        if(theLayers.length==0){
            alert("Please select some layers and run the script again.");
        }else{
        // otherwise, loop through each selected layer in the selected comp
        for (var i = 0; i < theLayers.length; i++){
            // define the layer in the loop we're currently looking at
            var curLayer = theLayers[i];
            // Select layer to add expression to
            if (curLayer.matchName == "ADBE AV Layer"){
                curLayer.timeRemapEnabled = true;

                var expr = "loop_out(\"cycle\");";
                curLayer.timeRemap.expression = expr;

            }else{
                alert("This only works on footage layers.");
            }
            }
        }
    }
 
    app.endUndoGroup();
}  //end script



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// generate nulls for pins
function nullsForPins(){  //start script
    app.beginUndoGroup("Generate Nulls for Pins");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else { 
        var theLayers = theComp.selectedLayers;
        if(theLayers.length==0){
            alert("Please select some layers and run the script again.");
        }else{
        // otherwise, loop through each selected layer in the selected comp
        for (var i = 0; i < theLayers.length; i++){
            // define the layer in the loop we're currently looking at
            var curLayer = theLayers[i];
            // Select layer to add expression to
            if (curLayer.matchName == "ADBE AV Layer"){
                if(curLayer.effect.puppet != null){
                    var wherePins = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform");
                    var pinCount = wherePins.numProperties;
                    for (var n = 1; n <= pinCount; n++){
                        // Get position of puppet pin
                        try{ 
                        var pin = curLayer.effect("Puppet").arap.mesh("Mesh 1").deform(n);
                        var nullName = pin.name + "_ctl";
                        //var solid = theComp.layers.addSolid([1.0, 1.0, 0], nullName, 50, 50, 1);
                        var solid = theComp.layers.addNull();
                        solid.name = nullName;
                        //solid.guideLayer = true;
                        //solid.property("opacity").setValue(0);
                        //alert(pin.position);
                        //solid.property("position").setValue([100,100]);
                        var pinExpr = "fromComp(thisComp.layer(\""+nullName+"\").toComp(thisComp.layer(\""+nullName+"\").anchorPoint));";
                        pin.position.expression = pinExpr;
                        }catch(e){}
                    }  
                }else{
                    alert("This only works on layers with puppet pins.");
                }
            }else{
                alert("This only works on footage layers.");
            }
            }
        }
    }
 
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// generate parentable null for things with weird coordinate spaces
function parentableNull(){  //start script
    app.beginUndoGroup("Generate Parentable Null");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else { 
        var theLayers = theComp.selectedLayers;
        if(theLayers.length==0){
            alert("Please select some layers and run the script again.");
        }else{
        // otherwise, loop through each selected layer in the selected comp
        for (var i = 0; i < theLayers.length; i++){
            // define the layer in the loop we're currently looking at
            var curLayer = theLayers[i];
            // Select layer to add expression to
            if (curLayer.matchName == "ADBE AV Layer"){
                var solid = theComp.layers.addNull();
                solid.name = curLayer.name + "_ctl";
                var expr = "var L = thisComp.layer(\"" + curLayer.name + "\");" + "\r" +
                           "L.toComp(L.transform.anchorPoint);";
                solid.property("position").expression = expr;
            }else{
                alert("This only works on footage layers.");
            }
            }
        }
    }

    app.endUndoGroup();
}  //end script

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Build the rig template with placeholder source pins and 2D control nulls

function create2DTemplate() { // KinectToPin Template Setup for UI Panels

 //start script
	app.beginUndoGroup("Create 2D Template");

	// create project if necessary
	var proj = app.project;
	if(!proj) proj = app.newProject();

	// create new comp named 'my comp'
	var compW = 1920; // comp width
	var compH = 1080; // comp height
	var compL = 15;  // comp length (seconds)
	var compRate = 24; // comp frame rate
	var compBG = [0/255,0/255,0/255]; // comp background color
	var myItemCollection = app.project.items;
	var myComp = myItemCollection.addComp('KinectToPin 2D Template',compW,compH,1,compL,compRate);
	myComp.bgColor = compBG;
	
	// add mocap source layer
	var mocap = myComp.layers.addSolid([0, 0, 0], "mocap", 640, 480, 1);
	mocap.guideLayer = true;
    mocap.threeDLayer = true;
	//mocap.locked = true;
	mocap.property("position").setValue([960,sH]);
    mocap.property("anchorPoint").setValue([0,0]);
	mocap.property("opacity").setValue(0);
	
	// array of all points KinectToPin tracks
	var trackpoint = jointNamesMaster;
	
	
			// create source point control and control null for each
			for (var i = 0; i <= 14; i++){        

				// add source point
				var pointname = trackpoint[i];
				var myEffect = mocap.property("Effects").addProperty("Point Control");
				myEffect.name = pointname;
				var p = mocap.property("Effects")(pointname)("Point");
				p.expression = 
                "pin = smooth(.2,5); \r" +
                "sW = thisLayer.width; \r" +
                "dW = thisComp.width; \r" +
                "sH = thisLayer.height; \r" +
                "dH = thisComp.height; \r" +
                "[pin[0]*(dW/sW)-(.5*dW), pin[1]*(dH/sH)-(.5*dH)];";

			}

			for (var j = 14; j >= 0; j--){ 
				// add control null
				var pointname = trackpoint[j];
				var solid = myComp.layers.addSolid([1.0, 0, 0], pointname, 50, 50, 1);
				solid.guideLayer = true;
				solid.property("opacity").setValue(33);
                  solid.property("position").setValue([0,0]);
                  solid.property("anchorPoint").setValue([0,0]);
				var p = solid.property("position");
				var expression = 
	//~~~~~~~~~~~~~expression here~~~~~~~~~~~~~~~
        "pin = thisLayer.name;\r" +
        "master_source = thisComp.layer(\"mocap\");\r" +
        "source_point = master_source.effect(pin)(\"Point\");\r" +
        "point = master_source.toComp(source_point);\r" +
        "point + value\r"; 
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				p.expression = expression;
	
			}
	
	
    //add skeleton visualizer
    var skeleviz = myComp.layers.addSolid([0, 0, 0], "Skeleton Visualizer", 1920, 1080, 1);
    skeleviz.guideLayer = true;
    skeleviz.locked = true;
    skeleviz.property("opacity").setValue(50);
    var myPreset = File(ffxpath);
    skeleviz.applyPreset(myPreset);    
    
    app.endUndoGroup();
    }  //end script



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Build the 3D rig template with placeholder source pins, virtual camera and control nulls

function create3DTemplate() { // KinectToPin Template Setup for UI Panels

 //start script
	app.beginUndoGroup("Create 3D Template");

    if(parseFloat(app.version) >= 10.5){

	// create project if necessary
	var proj = app.project;
	if(!proj) proj = app.newProject();
    
	// create new comp named 'my comp'
	var compW = 1920; // comp width
	var compH = 1080; // comp height
	var compL = 15;  // comp length (seconds)
	var compRate = 24; // comp frame rate
	var compBG = [0/255,0/255,0/255]; // comp background color
	var myItemCollection = app.project.items;
	var myComp = myItemCollection.addComp('KinectToPin 3D Template',compW,compH,1,compL,compRate);
	myComp.bgColor = compBG;
	
  
	// add mocap source layer
	var mocap = myComp.layers.addSolid([0, 0, 0], "mocap", 640, 480, 1);
	mocap.guideLayer = true;
    mocap.threeDLayer = true;
	mocap.property("position").setValue([960,sH]);  
	mocap.property("opacity").setValue(0);
    mocap.property("anchorPoint").setValue([0,0]);
    mocap.label = 6;
	
	// array of all points KinectToPin tracks
	var trackpoint = jointNamesMaster;
	
	
			// create source point control and control null for each
			for (var i = 0; i <= 14; ++i){        

				// add source point
				var pointname = trackpoint[i];
				var myEffect = mocap.property("Effects").addProperty("3D Point Control");
				myEffect.name = pointname;
				var p = mocap.property("Effects")(pointname)("3D Point");
				p.expression = "pin = smooth(.2,5); \r" + 
                        "sW = thisLayer.width;  \r" + 
                        "dW = thisComp.width;  \r" + 
                        "sH = thisLayer.height;  \r" + 
                        "dH = thisComp.height;  \r" + 
                        "[pin[0]*(dW/sW)-(.5*dW), pin[1]*(dH/sH)-(.5*dH),linear(pin[2],0,200,0,2000)-1500];";
			}

			for (var j=14; j >= 0; j--){
				// add control null
				var pointname = trackpoint[j];
				var solid = myComp.layers.addSolid([1.0, 0, 0], pointname, 50, 50, 1);
				solid.guideLayer = true;
                 solid.threeDLayer = true;
				solid.property("opacity").setValue(33);
                 solid.property("anchorPoint").setValue([0,0]);
				var p = solid.property("position");
				var expression = 
	//~~~~~~~~~~~~~expression here~~~~~~~~~~~~~~~
                    "pin = thisLayer.name;  \r" + 
                    "master_source = thisComp.layer(\"mocap\");  \r" + 
                    "source_point = master_source.effect(pin)(\"3D Point\");  \r" + 
                    "point = master_source.toComp(source_point);  \r" + 
                    "point + value";
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				p.expression = expression;
                  p.setValue([0,0,0]);
	
	}
	

    
    /*
    //add control camera -- moved to own function
    var compcam = myComp.layers.addCamera("KinectToPin Camera", [960,sH]);    
    compcam.property("position").setValue([960,sH,-1500]);
    */
    
    // Auto-scale Z on mocap layer
    var autoZ = mocap.property("position");
    autoZ.expression = 
        "mocap = thisLayer; \r" +
        "try{cam = thisComp.activeCamera;}catch(err){ cam = mocap }; \r" +
        "torso = mocap.effect(\"torso\")(\"3D Point\"); \r" +
        "tW = mocap.toWorld(torso); \r" +
        "fW = cam.fromWorld(tW); \r" +
        "[value[0],value[1],value[2]+(1500-fW[2])*2]"; 

    //add skeleton visualizer
    var skeleviz = myComp.layers.addSolid([0, 0, 0], "Skeleton Visualizer", 1920, 1080, 1);
    skeleviz.guideLayer = true;
    skeleviz.locked = true;
    skeleviz.property("opacity").setValue(50);
    var myPreset = File(ffxpath);
    skeleviz.applyPreset(myPreset);
    
    
    } else {
     // Alert users of incompatibility with older versions of AE
     alert("Sorry, this feature only works with CS5.5 and higher.");
     }
    
	app.endUndoGroup();
    }  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Connect puppet layers to control nulls and add scaling algorithm

function rigPuppet(){ //start script
    app.beginUndoGroup("Rig Puppet Layers");
    
 var theComp = app.project.activeItem;
 

// check if comp is selected
if (theComp == null || !(theComp instanceof CompItem)){

// if no comp selected, display an alert
alert("Please establish a comp as the active item and run the script again");

} else { 
    
// otherwise, loop through each layer in the selected comp
for (var i = 1; i <= theComp.numLayers; ++i){

        // define the layer in the loop we're currently looking at
        var curLayer = theComp.layer(i);
        
   
// Select layer to add expression to
if (curLayer.matchName == "ADBE AV Layer" && curLayer.effect.puppet != null){
    
        //moved to own function
        /*
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        */
        
		// How many pins?
		wherePins = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform");
         var pinCount = wherePins.numProperties;
         
    for (var n = 1; n <= pinCount; n++)
				{
				
                // Get name of puppet pin and insert in expression string
                var pin = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform").property(n).name;
                var pinexpression = "fromComp(thisComp.layer(\"" + pin + "\").toComp(thisComp.layer(\"" + pin + "\").anchorPoint));"
              

                // Connect to control null
                curLayer.effect("Puppet").arap.mesh("Mesh 1").deform(n).position.expression = pinexpression;

				}   
    
 } 

// Warning for shape layers!
if (curLayer instanceof ShapeLayer && curLayer.effect.puppet != null){
        
        alert("Precompose shape layers before adding Puppet pins.");
 
    }
// End warning



}

}
    
    
    
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Connect non-puppet layers to control nulls
function rigExtremities(){ //start script
    app.beginUndoGroup("Rig Extremities");
    
 var theComp = app.project.activeItem;
 

// check if comp is selected
if (theComp == null || !(theComp instanceof CompItem)){

// if no comp selected, display an alert
alert("Please establish a comp as the active item and run the script again");

} else { 
    
// otherwise, loop through each layer in the selected comp
for (var i = 1; i <= theComp.numLayers; ++i){

        // define the layer in the loop we're currently looking at
        var curLayer = theComp.layer(i);
        
   
// Add expressions for left hand
if (curLayer.name == "l_hand_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
 
        curLayer.property("Transform").property("Position").setValue([0,0]);
        var posexpression =         "master_source = thisComp.layer(\"l_hand\"); \r" +
        "source_point = master_source.transform.anchorPoint; \r" +
        "point = master_source.toComp(source_point); \r" +
        "point + value";
         curLayer.property("Transform").property("Position").expression = posexpression;

         
         var rotexpression = "this_src = thisComp.layer(\"l_hand\"); \r" +
            "that_src = thisComp.layer(\"l_elbow\"); \r" +
            "this_point = this_src.toComp(this_src.transform.anchorPoint); \r" +
            "that_point = that_src.toComp(that_src.transform.anchorPoint); \r" +
            "delta=sub(this_point, that_point); \r" +
            "angle=Math.atan2(delta[1], delta[0]); \r" +
            "ang = radians_to_degrees(angle); \r" +
            "(ang+270)%360+value;";
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for left foot
if (curLayer.name == "l_foot_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
  
          curLayer.property("Transform").property("Position").setValue([0,0]);
        var posexpression =         "master_source = thisComp.layer(\"l_foot\"); \r" +
        "source_point = master_source.transform.anchorPoint; \r" +
        "point = master_source.toComp(source_point); \r" +
        "point + value";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_src = thisComp.layer(\"l_foot\"); \r" +
            "that_src = thisComp.layer(\"l_knee\"); \r" +
            "this_point = this_src.toComp(this_src.transform.anchorPoint); \r" +
            "that_point = that_src.toComp(that_src.transform.anchorPoint); \r" +
            "delta=sub(this_point, that_point); \r" +
            "angle=Math.atan2(delta[1], delta[0]); \r" +
            "ang = radians_to_degrees(angle); \r" +
            "(ang+270)%360+value;";
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for right hand
if (curLayer.name == "r_hand_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        curLayer.property("Transform").property("Position").setValue([0,0]);
        var posexpression =         "master_source = thisComp.layer(\"r_hand\"); \r" +
        "source_point = master_source.transform.anchorPoint; \r" +
        "point = master_source.toComp(source_point); \r" +
        "point + value";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_src = thisComp.layer(\"r_hand\"); \r" +
            "that_src = thisComp.layer(\"r_elbow\"); \r" +
            "this_point = this_src.toComp(this_src.transform.anchorPoint); \r" +
            "that_point = that_src.toComp(that_src.transform.anchorPoint); \r" +
            "delta=sub(this_point, that_point); \r" +
            "angle=Math.atan2(delta[1], delta[0]); \r" +
            "ang = radians_to_degrees(angle); \r" +
            "(ang+270)%360+value;";
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for right foot
if (curLayer.name == "r_foot_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        curLayer.property("Transform").property("Position").setValue([0,0]);
        var posexpression =         "master_source = thisComp.layer(\"r_foot\"); \r" +
        "source_point = master_source.transform.anchorPoint; \r" +
        "point = master_source.toComp(source_point); \r" +
        "point + value";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_src = thisComp.layer(\"r_foot\"); \r" +
            "that_src = thisComp.layer(\"r_knee\"); \r" +
            "this_point = this_src.toComp(this_src.transform.anchorPoint); \r" +
            "that_point = that_src.toComp(that_src.transform.anchorPoint); \r" +
            "delta=sub(this_point, that_point); \r" +
            "angle=Math.atan2(delta[1], delta[0]); \r" +
            "ang = radians_to_degrees(angle); \r" +
            "(ang+270)%360+value;";
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

// Add expressions for head
if (curLayer.name == "head_layer"){
    
        var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
        "find = dot(g1,g2);\r" + 
        "value/(find/2000);\r" +
        "}catch(err){ value }";
        curLayer.property("Transform").property("Scale").expression = scaleexpression;
        
        curLayer.property("Transform").property("Position").setValue([0,0]);
        var posexpression = "master_source = thisComp.layer(\"head\"); \r" +
        "source_point = master_source.transform.anchorPoint; \r" +
        "point = master_source.toComp(source_point); \r" +
        "point + value";
         curLayer.property("Transform").property("Position").expression = posexpression;
         
         var rotexpression = "this_src = thisComp.layer(\"neck\"); \r" +
            "that_src = thisComp.layer(\"head\"); \r" +
            "this_point = this_src.toComp(this_src.transform.anchorPoint); \r" +
            "that_point = that_src.toComp(that_src.transform.anchorPoint); \r" +
            "delta=sub(this_point, that_point); \r" +
            "angle=Math.atan2(delta[1], delta[0]); \r" +
            "ang = radians_to_degrees(angle); \r" +
            "(ang+270)%360+value;";
         curLayer.property("Transform").property("Rotation").expression = rotexpression;


}else{}

}

}
    
    
    
    app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Import XML file of tracking data for 2D characters
function importMocap2D(){  //start script
	app.beginUndoGroup("Import Pins From XML");

    var myComp = app.project.activeItem;

    
	//load xml file
	var myXmlFile = File.openDialog();
	var fileOK = myXmlFile.open("r");
	if (fileOK){
  		var myXmlString = myXmlFile.read();
  		var myRoot = new XML(myXmlString);
  		myXmlFile.close();
	}

	var compRate = parseFloat(myRoot.@fps); // comp frame rate

	var sW = parseFloat(myRoot.@width);
	var sH = parseFloat(myRoot.@height);

	var mocap = myComp.layer("mocap");

	var trackPoint = jointNamesMaster;

	// add joint information
	for(var j=0;j<trackPoint.length;j++){
		var myEffect = mocap.property("Effects").property(trackPoint[j]);
		myEffect.name = trackPoint[j];
		var p = mocap.property("Effects")(trackPoint[j])("Point");

		for(var i=0;i<myRoot.MocapFrame.length();i++){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			//keyframes go here
			//var pTfps = myRoot.@fps;
			var pT = i/compRate;
			var pXs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@x;
			var pYs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@y;

			if(pXs != "NaN" && pYs != "NaN"){
				var pX = parseFloat(pXs);
				var pY = parseFloat(pYs);
				p.setValueAtTime(pT, [pX * sW, pY * sH]);
			}
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		}


	}

	app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Import XML file of tracking data for 3D characters
function importMocap3D(){  //start script
	app.beginUndoGroup("Import Pins From XML");

    if(parseFloat(app.version) >= 10.5){


    var myComp = app.project.activeItem;

    
	//load xml file
	var myXmlFile = File.openDialog();
	var fileOK = myXmlFile.open("r");
	if (fileOK){
  		var myXmlString = myXmlFile.read();
  		var myRoot = new XML(myXmlString);
  		myXmlFile.close();
	}

	var compRate = parseFloat(myRoot.@fps); // comp frame rate

	var sW = parseFloat(myRoot.@width);
	var sH = parseFloat(myRoot.@height);
	var sD = parseFloat(myRoot.@depth);

	var mocap = myComp.layer("mocap");

	var trackPoint = jointNamesMaster;

	// add joint information
	for(var j=0;j<trackPoint.length;j++){
		var myEffect = mocap.property("Effects").property(trackPoint[j]);
		myEffect.name = trackPoint[j];
		var p = mocap.property("Effects")(trackPoint[j])("3D Point");

		for(var i=0;i<myRoot.MocapFrame.length();i++){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			//keyframes go here
			//var pTfps = myRoot.@fps;
			var pT = i/compRate;
			var pXs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@x;
			var pYs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@y;
			var pZs = myRoot.MocapFrame[i].Skeleton.Joints.descendants(trackPoint[j]).@z;

			if(pXs != "NaN" && pYs != "NaN" && pZs != "NaN"){
				var pX = parseFloat(pXs);
				var pY = parseFloat(pYs);
				var pZ = parseFloat(pZs);
				p.setValueAtTime(pT, [pX * sW, pY * sH, pZ * sD/2]);
			}
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		}


	} 
    
    } else {
             alert("Sorry, this feature only works with CS5.5 and higher.");
     }
 
	app.endUndoGroup();
}  //end script


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function lockRotation(){
    app.beginUndoGroup("Lock Rotation");

    var theComp = app.project.activeItem;

    if (theComp == null || !(theComp instanceof CompItem)){  // check if comp is selected
        alert("Please establish a comp as the active item and run the script again");  // if no comp selected, display an alert
    } else { 
        var theLayers = theComp.selectedLayers;

        if(theLayers.length==0){
            alert("Please select some layers and run the script again.");
        }else{
            for (var i = 0; i < theLayers.length; i++){  // otherwise, loop through each selected layer in the selected comp
                var curLayer = theLayers[i];  // define the layer in the loop we're currently looking at

                curLayer.threeDLayer = true;
                
                //if (curLayer.matchName == "ADBE AV Layer"){
                    var expr = "delta = toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]);" + "\r" + 
                    "radiansToDegrees(Math.atan2(delta[0],delta[2]));"

                    curLayer.transform.yRotation.expression = expr;
                //}
            }
        }
    }	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function precompControls(){  //start script
    app.beginUndoGroup("Add Puppet Precomp Controls");

    //get current comp
     var theComp = app.project.activeItem;
     
    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){

    // if no comp selected, display an alert
    alert("Please choose a comp, select your character precomps and run the script again");

        } else { 
         
         var selectedLayers = theComp.selectedLayers;
         
                    // Make sure there is a layer selected
                    if (selectedLayers.length == 0) {
                        alert("Please select a character precomp.");
                        } else { 

                            // loop through each selected layer in the selected comp
                            for (var i = 0; i < selectedLayers.length; i++){
                    
                                    // define the layer in the loop we're currently looking at
                                    var curLayer = selectedLayers[i];
                                   

                                    curLayer.threeDLayer = true;        
                                       
                                    // Select layer to add expression to
                                    if (curLayer.matchName == "ADBE AV Layer"){

                                           //for each selected layer, add checkbox effects
                                           var xBox = curLayer.property("Effects").addProperty("Checkbox Control");
                                           xBox.name = "Lock X Axis";
                                           
                                           var yBox = curLayer.property("Effects").addProperty("Checkbox Control");
                                           yBox.name = "Lock Y Axis";
                                           
                                           var zBox = curLayer.property("Effects").addProperty("Checkbox Control");
                                           zBox.name = "Lock Z Axis";
                                           
                                           // Add lock-in-place expression
                                           var posexpression = 
                                                        "mocap = thisLayer.source.layer(\"mocap\"); \r" +
                                                        "try{cam = thisLayer.source.activeCamera;}catch(err){ cam = mocap}; \r" +
                                                        "try {torso = mocap.effect(\"torso\")(\"3D Point\");}catch(err){torso = mocap.effect(\"torso\")(\"Point\");};  \r" +
                                                        "tW = mocap.toWorld(torso);  \r" +
                                                        "fW = cam.fromWorld(tW);  \r" +
                                                         "                                        \r" +
                                                        "pinX = effect(\"Lock X Axis\")(\"Checkbox\"); \r" +
                                                        "pinY = effect(\"Lock Y Axis\")(\"Checkbox\"); \r" +
                                                        "pinZ = effect(\"Lock Z Axis\")(\"Checkbox\"); \r" +
                                                         "                                        \r" +
                                                        "if (pinX == true){ \r" +
                                                        "xOut = value[0]-fW[0]; \r" +
                                                        "}else{ \r" +
                                                        "xOut = value[0]; \r" +
                                                        "} \r" +
                                                         "                                        \r" +
                                                        "if (pinY == true){ \r" +
                                                        "yOut = value[1]-fW[1]-150; \r" +
                                                        "}else{ \r" +
                                                        "yOut = value[1]; \r" +
                                                        "} \r" +
                                                         "                                        \r" +
                                                        "if (pinZ == true){ \r" +
                                                        "zOut = value[2]-1000; \r" +
                                                        "}else{ \r" +
                                                        "zOut = value[2]+1000-(fW[2]); \r" +
                                                        "} \r" +
                                                         "                                        \r" +
                                                        "[xOut,yOut,zOut]";
                                                
                                                curLayer.property("Transform").property("Position").expression = posexpression;

                                        }


                                    }
                            }
                    }
    app.endUndoGroup();
}  //end script

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Bake pin keyframes
function bakePinKeyframes(){  //start script
    app.beginUndoGroup("Bake Pin Keyframes");

    //if(parseFloat(app.version) >= 10.5){
    var theComp = app.project.activeItem; //only selected

    // check if comp is selected
    if (theComp == null || !(theComp instanceof CompItem)){
        // if no comp selected, display an alert
        alert("Please establish a comp as the active item and run the script again.");
    } else { 
        var theLayers = theComp.selectedLayers;
        if(theLayers.length==0){
            alert("Please select some layers and run the script again.");
        }else{
        // otherwise, loop through each selected layer in the selected comp
        for (var i = 0; i < theLayers.length; i++){
            // define the layer in the loop we're currently looking at
            var curLayer = theLayers[i];
            // Select layer to add expression to
            if (curLayer.matchName == "ADBE AV Layer"){
                if(curLayer.effect.puppet != null){
                    var wherePins = curLayer.property("Effects").property("Puppet").property("arap").property("Mesh").property("Mesh 1").property("Deform");
                    var pinCount = wherePins.numProperties;
                    for (var n = 1; n <= pinCount; n++){
                        // Get position of puppet pin
                        var pin = curLayer.effect("Puppet").arap.mesh("Mesh 1").deform(n).position;
                        try{
                            convertToKeyframes(pin);
                        }catch(e){}
                    }  
                }
                //else{
                    var curProperty;
                    try{
                        curProperty = curLayer.property("position");
                        convertToKeyframes(curProperty);
                    }catch(e){}
                    try{
                        curProperty = curLayer.property("anchorPoint");
                        convertToKeyframes(curProperty);
                    }catch(e){}
                    try{
                        curProperty = curLayer.property("rotation");
                        convertToKeyframes(curProperty);
                    }catch(e){}
                    try{
                        curProperty = curLayer.property("scale");
                        convertToKeyframes(curProperty);
                    }catch(e){}
                    try{
                        curProperty = curLayer.property("opacity");
                        convertToKeyframes(curProperty);
                    }catch(e){}
                //}
            }else{
                alert("This currently only works on footage layers.")
            }
            }
        }
    }

    /*
    } else {
             alert("Sorry, this feature only works with CS5.5 and higher.");
     }
     */
 
    app.endUndoGroup();
}  //end script

    function convertToKeyframes(theProperty){
        if (theProperty.canSetExpression && theProperty.expressionEnabled){
            theProperty.selected = true;
            app.executeCommand(app.findMenuCommandId("Convert Expression to Keyframes")); 
            theProperty.selected = false;
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function customCamera() { //start script
    app.beginUndoGroup("Create Custom Camera");
    if(parseFloat(app.version) >= 10.5){

        var theComp = app.project.activeItem;
        if (theComp == null || !(theComp instanceof CompItem)){
            // if no comp selected, display an alert
            alert("Please establish a comp as the active item and run the script again");
        } else { 
            // otherwise, add control camera
            var compcam = theComp.layers.addCamera("KinectToPin Camera", [960,sH]);    
            compcam.property("position").setValue([960,sH,-1500]);
            // ...then loop through each layer in the selected comp
            for (var i = 1; i <= theComp.numLayers; ++i){
                // define the layer in the loop we're currently looking at
                var curLayer = theComp.layer(i);

                // Select layer to add expression to
                if (curLayer.matchName == "ADBE AV Layer" && curLayer.effect.puppet != null){
                    var scaleexpression = "try{g1 = (toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]));\r" +
                        "g2 = thisComp.activeCamera.toWorldVec([0,0,1]);\r" +
                        "find = dot(g1,g2);\r" + 
                        "value/(find/2000);\r" +
                        "}catch(err){ value }";
                    curLayer.property("Transform").property("Scale").expression = scaleexpression;
                }
            }
        }
    } else {
        // Alert users of incompatibility with older versions of AE
        alert("Sorry, this feature only works with CS5.5 and higher.");
    }

app.endUndoGroup();
}  //end script

}

