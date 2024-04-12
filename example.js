/**
 * Example of more than can be done in 2 hours..
 * (See pasilawoods for original..)
 * 
 */

var example_objects = (t, w, h, C) => {
        var stuffpoints = [];
        random_state = 8;
        for (var itree = 13; itree--;) {
                var inis = 25;
                example_twigs([25 * crnd(), 0, 25 * crnd()], [0, 4, 0, 0], inis, 30, stuffpoints);
        }
        return stuffpoints;
}

var example_camera = (t, w, h, C) => {
        // Viewpoints. Will be circulated one after the other:
        var vps = [
                [[0, 44, -40], 0, 1 - Math.sin(t / 20), 2], // slowly-to-and-from-view
                [[0, 110 - 2 * t, -110 + 2 * t], 0, t / 40 - 1, 2], // descend from the air
                [[(t - 46), 6, 2.5], t / 6, Math.PI / 2, 1], // look up, spinning, walk a bit
                [[0, 10 - (t - 60) / 2, -30 + (t - 60) * 6], -(t - 60) / 9, (t - 60) / 20, 2], // away-from-view
        ]
        return vps[t / 20 % 4 | 0];
}

function example_background (t,w,h,C) {
        // Just a "sky" that brightens with time
        var gradient = C.createLinearGradient(
            0,-h*t/DURATION_SECONDS,0,h+3*(1-t/DURATION_SECONDS)*h);
        gradient.addColorStop(0, "#115");
        gradient.addColorStop(.8, "#fde");
        gradient.addColorStop(.9, "#fef");
        gradient.addColorStop(1, "#fff");
        return gradient;
}

var example_foreground = (t, w, h, C) => {
        return "#000";
}
    



/**
 * A tree-like geometry builder from pasilawoods.
 * Consists of capsule-like objects that may have different sizes of ends.
 *
 * So far, the leanest format seems to be an array of [pos1, pos2, size1, size2]
 * This builds into "stuff" variable that needs to be set to [] before.
 * Uses crnd() for randoms, so set seed before calling.
 */
var example_twigs = (pos, dir, stepsleft, smax, stuff) => {
        if (stepsleft < 1) return;

        // Produce one capsule here, from position to end point.
        var endp = add3(dir, pos);
        stuff.push([pos, endp, stepsleft / smax / 2, (stepsleft - 1) / smax / 2]);

        var ll = Math.hypot(...dir);
        // Branch sometimes. 
        if (crnd() > .4) {
                example_twigs(endp,
                        add3(dir, randvec3(), 1 / 3, ll / 3),
                        stepsleft - 2, smax, stuff);
        }
        // Always grow a bit to almost same direction; feel some gravity downwards:
        var newd = add3(dir, randvec3(), 1, .2);
        newd[1] -= .1;  // Hmm.. should make these vary over time.. kool efekts

        example_twigs(endp, newd, stepsleft - 1, smax, stuff);
}
