// GFX and other helper functions
// (most recently from Pasilawoods - possibly on their way to be merged with lmad1 library)
// ---------------------------------------------------------------------------
// Obviously a construction site at the moment: Things gone around from
// production to production, year to year. To be sorted out gradually.

// ---------------------- 
// Utility functions.. unused ones automatically discarded from compo version.

/** Random generator to get deterministic rands.. seems to cost about 20-30 bytes,
but is a must for repeatable stochastic things. When "just noise" is not enough..

This version is skewed, ranges to almost 1.0 but not quite.. 0x400000 == 4194304.
0x3fffff/4200000 == 0.9986435714285714
*/
var random_state = 0; // Moved up, closer to other zero-initialized vars.

// Version that doesn't go inline everywhere:
var rnd = () => {
    random_state = (16807 * random_state + 1) & 0x3fffff; return random_state / 4200000;
}

// Version that gives zero-centered values in so-so-approximate range [-1,1]
var crnd = () => {
    random_state = (16807 * random_state + 1) & 0x3fffff; return random_state / 2100000 - 1;
}


/**
 * Perspective effect without aspect ratio.
 *
 * In: p==[x,y,z,w], f==1/Math.tan(fovY/2).
 *
 * Out: [f*x/z, f*y/z, z, w].
 *
 * Doesn't handle aspect ratio nor clipping planes.
 *
 */
var doPerspectiveFhc = ([x,y,z,w], f) => {
        return [
            f*x/z,
            f*y/z,
            z,
            w
        ];
};
    
/** Compare the z coordinate of two points */
var zsort = (a, b) => {
    return b[2]-a[2];
}
    
    
/*
* Assume a scene is built into an array of objects. Plan would be to modify
 * coordinates in-place to get camera at (x,y,z) with rotations a and b for
* "pan" and "tilt".
*/
// Coordinate transforms and other computations for 3-vectors. Rotation
// directions are custom so that camera pan and tilt make most sense to me..
// may or may not be usual counterclockwise ones..
var rot3Y = (theta, p) => [Math.cos(theta)*p[0] - Math.sin(theta)*p[2],
                           p[1],
                           Math.sin(theta)*p[0] + Math.cos(theta)*p[2]];
var rot3X = (theta, p) => [p[0],
                           Math.cos(theta)*p[1] - Math.sin(theta)*p[2],
                           Math.sin(theta)*p[1] + Math.cos(theta)*p[2]];
var add3  = (x,y,a=1,b=1) => [a*x[0]+b*y[0], a*x[1]+b*y[1], a*x[2]+b*y[2]];
  
var scale3 = (p,q) => [p[0]*q[0], p[1]*q[1], p[2]*q[2]];

/** Cross product when a and b are array representations of 3-vectors*/
var cross3 = (a,b) => {
    return [ a[1]*b[2] - a[2]*b[1],
             a[2]*b[0] - a[0]*b[2],
             a[0]*b[1] - a[1]*b[0] ]
}
    
/** Return a new vector with uniform randoms from [-.5,.5] */
var randvec3alt = () => [crnd()/2, crnd()/2, crnd()/2];
    
/** Return a new vector with uniform randoms from [-1,1] */
var randvec3 = () => [crnd(), crnd(), crnd()];
   
/** Combine pan and tilt (tiltable cam on rotating stand..) */
var rot3YthenX = (pan, tilt, p) => [
        Math.cos(pan)*p[0] - Math.sin(pan)*p[2],
        Math.cos(tilt)*p[1] - Math.sin(tilt)*(Math.sin(pan)*p[0] + Math.cos(pan)*p[2]),
        Math.sin(tilt)*p[1] + Math.cos(tilt)*(Math.sin(pan)*p[0] + Math.cos(pan)*p[2])];
    
    /**
     * Model a camera taken into a position in the scene, panned and tilted.
     * Positive pan to right, positive tilt up; given in radians.
     * (Such a short function - manually inlined; not calling this in drawing code..)
     */
    var camAt = (pts, pos, pan, tilt) => {
        for(var p of pts){
            p[0] = rot3X(tilt, rot3Y(pan, add3(pos,p[0],-1)));
            p[1] = rot3X(tilt, rot3Y(pan, add3(pos,p[1],-1)));
        }
    }
    
    /** Return a grayscale color of intensity and alpha as CSS color string.*/
    var toRGB = (intensity, alpha) => {
        intensity = intensity*255|0;
        return `rgb(${intensity},${intensity},${intensity},${alpha})`;
    }
    
    /** Return a CSS color string from a mix of two rgbs in range 0-1. No alpha.*/
    var toRGBmix = (rgb1, rgb2, mixv) => {
        var c = add3(rgb1,rgb2,255*mixv|0, 255-255*mixv|0);
        return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
    

/**
* A silhouette drawing version that was created after the Assembly 
* Summer 2023 event and compo. See alternative_versions.js in the 
* pasilawoods source code for notes about this.
*
*/
var fillCapsuleSilhouette2b = (C, cx1, cy1, r1, cx2, cy2, r2,
        // Computations that give either usable alpha&beta or NaN if circle encloses another
                                   alpha = Math.acos((r1-r2)/Math.hypot(cx2-cx1,cy2-cy1)),
                                   beta = Math.atan((cy2-cy1)/(cx2-cx1))
    ) => {
        if (cx2 < cx1) alpha += Math.PI;
    
        // If overlap, make the smaller circle NaN-sized. By spec, it won't affect the path.
        if (alpha !== alpha){
            alpha = beta = 0;
            if (r1 > r2) r2 = NaN; else r1 = NaN;
        }
    
        C.beginPath();
        C.arc(cx1, cy1, r1, alpha + beta,               2*Math.PI - alpha + beta);
        C.arc(cx2, cy2, r2, 2*Math.PI - alpha + beta,   alpha + beta);
        C.fill();
    }
    
    /** 
     * Fill a polygon with varying width. Using this for sharper turns is
     * suboptimal; you can see the stiches, so to speak.. But for smaller curves
     * the artefacts are very small and maybe could go mostly unnoticed?.
     *
     * And, for the Pasila Woods entry of Assembly Summer 2023, let's paint one
     * arc at the 2nd end. That will fill all gaps in the tree geometries. No problem.
     */
    var fillBetween = (C, cx1, cy1, r1, cx2, cy2, r2,
        // Actual Distance between circles in screen coordinates.
                       d = Math.hypot(cx2 - cx1, cy2 - cy1),
        // Unit vector orthogonal to direction from circle 1 towards circle 2.
                       nx = (cy2-cy1)/d,
                       ny = -(cx2-cx1)/d ) => {
    
        C.beginPath();
        // Paint the arc at the ending point of the twig section:
        C.arc(cx2, cy2, r2, 0, 7);
        C.moveTo( cx1 + r1 * nx, cy1 + r1 * ny );
        C.lineTo( cx2 + r2 * nx, cy2 + r2 * ny );
        C.lineTo( cx2 - r2 * nx, cy2 - r2 * ny );
        C.lineTo( cx1 - r1 * nx, cy1 - r1 * ny);
        C.fill();
    
    }
    
    /** Stroke from (cx1,cy1) to (cx2,cy2) with thickness (r1+r2)/2. This
     * looks surprisingly good at least when there's movement and a lot of
     * stuff. Also good for framerate.. Maybe an approximation to consider.
     */
    var strokeBetween = (C, cx1, cy1, r1, cx2, cy2, r2) => {
        C.lineWidth = (r1+r2)/2;
        C.beginPath();
        C.moveTo( cx1, cy1 );
        C.lineTo( cx2, cy2 );
        C.stroke();
    }
    
