// Notes: apply process to two layers
function freeformRig() {
    app.beginUndoGroup("Create Freeform Pro rig");

    var theComp = app.project.activeItem;

    if (theComp == null || !(theComp instanceof CompItem)) {  
        alert(errorNoCompSelected);  
    } else { 
        var theLayers = theComp.selectedLayers;

        if (theLayers.length != 2) {
            alert("Select exactly two layers (depth first).");
        } else { 
            var depthComp = theLayers[0];
            var rgbComp = theLayers[1];
            var depthCompSource = getLayerSource(depthComp);

            depthComp.audioEnabled = false;
            depthComp.enabled = false;
            rgbComp.audioEnabled = true;
            rgbComp.enabled = true;

            var freeform = rgbComp.property("Effects").addProperty("Mettle FreeForm Pro");
            freeform.property("Displacement Layer").setValue(depthComp.index);
            freeform.property("Displacement Height").setValue(560);
            freeform.property("Pre-blur Layer").setValue(2); // depth only

            rgbComp.layers.add(depthComp);
        }
    }

    app.endUndoGroup();   
}

///////////////////////////////////////////////////////////////////////////////////////////

// Notes: One-shot--create a complex bunch of objects and scripts.
function charParticle() {  
    app.beginUndoGroup("Create a Particle Rig");

    var theComp = app.project.activeItem; 

    if (theComp == null || !(theComp instanceof CompItem)) {
        alert(errorNoCompSelected);
    } else {
        var solid = theComp.layers.addSolid([0, 1.0, 1.0], "Particle Solid", theComp.width, theComp.height, 1);
        solid.locked = true;

        var particle_ctl = theComp.layers.addNull();
        particle_ctl.name = "particle_ctl";
        particle_ctl.threeDLayer = true;

        try {
            var particle = solid.property("Effects").addProperty("Particular");

            var expr1 = "L = thisComp.layer(\"" + particle_ctl.name + "\");" + "\r" + 
                        "L.toWorld(L.anchorPoint);"

            particle.property("Position XY").expression = expr1;

            var expr2 = "L = thisComp.layer(\"" + particle_ctl.name + "\");" + "\r" + 
                        "L.toWorld(L.anchorPoint)[2];"

            particle.property("Position Z").expression = expr2;
        } catch(err) {
            alert("Requires Trapcode Particular.");           
        }
    }
 
    app.endUndoGroup();
}  

///////////////////////////////////////////////////////////////////////////////////////////

// Notes: apply process to any number of layers
function rsmbTwos() {
    app.beginUndoGroup("Reelsmart Motion Blur on Twos");

    var theComp = app.project.activeItem;

    if (theComp == null || !(theComp instanceof CompItem)) {
        alert(errorNoCompSelected);
    } else { 
        var theLayers = theComp.selectedLayers;

        if (theLayers.length==0) {
            alert(errorNoLayerSelected);
        } else {
            //var baseOnFps = confirm("Base on comp frame rate?");

            for (var i = 0; i < theLayers.length; i++) {
                var effects = theLayers[i].property("Effects");

                var blur = effects.addProperty("RSMB");
                blur.property("Blur Amount").setValue(0.25);
                blur.property("Use GPU").setValue(2);

                var posterize = effects.addProperty("Posterize Time");
                //if (baseOnFps) {
                posterize.property("Frame Rate").setValue(theComp.frameRate/2);
                //} else {
                    //posterize.property("Frame Rate").setValue(12);
                //}
            }
        }
    }

    app.endUndoGroup();
}

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
