/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil; -*- */

/**
 * @fileOverview This file "prod.js" is our "story board"
 *
 * Before starting, the workshop teacher / assistant should
 * determine a the number of groups, based on the total number
 * of participants. Then the teacher should fork as many productions
 * as needed and prepare the contents of this file.
 * 
 * Students should touch only the file that belongs to their own group.
 * That way we won't get any merge conflicts when combining the parts.
 * 
 * My guess is that 4 groups of 3 persons for one fork could be 
 * a good maximum. 3 persons in 4 groups means 12 people max for 
 * one prod. I suggest one person does programming while the other
 * two help the programmer and all three take part in designing.
 * 
 * Could have also (3 + 3 + 3) + (3 + 3 + 2) etc., I think this
 * could be scaled to practically any number of participants.
 **/

// ----------------------------------------------------------------------------
// Global variables that you MUST define - they are used by the library code:

// Sync with your song.

/** Song tempo; the library computes time in beats for easy sync. */
var songBeatsPerMinute = 116;
/** 
 * Duration of whole show. Suggest little over 60 seconds for
 * four groups making a 15 second part each.
 * 
 * FIXME: This should be beats, too..?
 */
const DURATION_SECONDS = 69;

// Match this to number of groups before groups fetch code
var frameProducerCanvasShadowShow = (t, w, h) =>
{
	var C = c.getContext('2d');

    var bgstyle, beams, fillstyle, pos, pan, tilt, persp;

    /* The example can be toggled here with true/false */
    if (false) {
        bgstyle = example_background(t,w,h,C);
        fgstyle = example_foreground(t,w,h,C);
        shapes  = example_objects(t,w,h,C);
        [pos,pan,tilt,persp] = example_camera(t,w,h,C);
    } else if (t<32) {
        // group 1:
        bgstyle = group1_background(t,w,h,C);
        fgstyle = group1_foreground(t,w,h,C);
        shapes  = group1_objects(t,w,h,C);
        [pos,pan,tilt,persp] = group1_camera(t,w,h,C);
    } else if (t<64) {
        // group 2:
        bgstyle = group2_background(t,w,h,C);
        fgstyle = group2_foreground(t,w,h,C);
        shapes  = group2_objects(t,w,h,C);
        [pos,pan,tilt,persp] = group2_camera(t,w,h,C);
    } else if (t<96) {
        // group 3:
        bgstyle = group3_background(t,w,h,C);
        fgstyle = group3_foreground(t,w,h,C);
        shapes  = group3_objects(t,w,h,C);
        [pos,pan,tilt,persp] = group3_camera(t,w,h,C);
    } else if (t<128) {
        // group 4:
        bgstyle = group4_background(t,w,h,C);
        fgstyle = group4_foreground(t,w,h,C);
        shapes  = group4_objects(t,w,h,C);
        [pos,pan,tilt,persp] = group4_camera(t,w,h,C);
    } else {
        bgstyle = "#888";
        fgstyle = "#fff";
        shapes = [];
        [pos,pan,tilt,persp] = [[0,0,0],0,0];
    }

    C.fillStyle = bgstyle;
    C.fillRect(0,0,w,h);

    C.fillStyle = fgstyle;
    for (var [p1,p2,s1,s2] of shapes) {
        
        // Model a camera taken into a position in the scene, panned and tilted.
    	// Positive pan to right, positive tilt up; given in radians.
	    p1 = rot3YthenX(pan, tilt, add3(pos,p1,-1));
	    p2 = rot3YthenX(pan, tilt, add3(pos,p2,-1));
	    if ((p1[2] < 1) || (p2[2] < 1)) continue;

	    fillCapsuleSilhouette2b(C,
			      w/2 + persp * h / p1[2] * p1[0] ,
			      h/2 - persp * h / p1[2] * p1[1] ,
			      persp *h / p1[2] * s1 ,
			      w/2 + persp * h / p2[2] * p2[0] ,
			      h/2 - persp * h / p2[2] * p2[1] ,
			      persp * h / p2[2] * s2);
    }
}



/** 
 * Frame producer function is selected, symmetrically with other
 * "demo types" in the lmad1 party coding library, but this is a bit
 * tentative. It works for today's 2-hour workshop...
 * I'll have to think about this before the next Instanssi workshop
 * where I'd like to have 3 symmetrical demo types available, one of
 * which is canvas 2d context.
 */
var frameProducerFunction = frameProducerCanvasShadowShow;
