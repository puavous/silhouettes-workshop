/**
 * Make changes to only your own file. Prefix new functions with 
 * your numbered group name to avoid name clashes.
 * 
 * Observe that time is beats counted from start of the show, so
 * you get the time into your group's own part by subtracting 
 * your starting beat from the parameter t.
 * 
 * The example code uses other parameters (width, height, context object) 
 * to get a gradient, but consider that "level 2" - you can get creative 
 * already with solid color.
 * 
 * Design and tinker together, appreciating each other's artistic input
 * and algorithmic ideas!
 */

const GROUP2_STARTBEAT = 32;  // Check the correct time slot assigned to you

/**
 * The objects whose silhuettes we see.
 * Return a list of such elements:
 * 
 * [ [x1, y1, z1], [x2, y2, z2], r1, r2 ]
 * 
 * Each describes a solid beam that completely connects two 
 * ball-shaped ends with radii r1 and r2 residing at the given spatial
 * locations.
 * 
 */
var group2_objects = (t) => {
        var stuffpoints = [];
        stuffpoints.push( [ [-2,0,0], [-2,10,0], 1, 1] );
        stuffpoints.push( [ [2,0,0], [2,10,0], 1, 1] );

        return stuffpoints;
}

/**
 * Camera can be transported, panned, tilted, and zoomed.
 * You must return a tuple:
 * 
 * [ [x, y, z], pan, tilt, zoom ]
 * 
 * where [x, y, z] are location of camera,
 * pan is left-to-right in radians,
 * tilt is up-to-down in radians,
 * zoom represents field-of-view.
 * 
 * Some values for zoom: 90deg->1.0; 60deg->1.732; 
 * 45deg->2.414; 36deg->3.077 30deg->3.732 28.07deg->4.0 20deg->5.671
 */
function group2_camera (t) {
        t -= GROUP2_STARTBEAT;
        var position = [0, 5*Math.sin(t/3), -100];
        return [position, 0, 0, 3];
}

/** Background color as an HTML fill style. */
function group2_background (t) {
        return ["#00f","#f00"][(t/2|0)%2];
}

/** Color of the silhouettes as an HTML fill style. */
function group2_foreground (t) {
        return "#0f0";
}
