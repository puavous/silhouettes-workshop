// Some main program remnants from my Pasilawoods,
// to be fully merged with lmad1 party coding library to provide a demo type
// "canvas 2d context demo". Will need a thought or two to be an easy
// selection between scenegraph type, shader-only type, and 2d context type.
//
// License: To be determined for the whole lmad1 library, soon, because I'm
// throwing it around to people and places at the moment, it seems.
//
// Author: qma (aka "The Old Dude", or paavo.j.nieminen@jyu.fi )

// Workshop participant should not look much further into this file - your
// fun and learnings are in the one file assigned to your group.

// Assume this much provided on surrounding HTML, as is by pnginator, or
// other carrier: '<html><body><canvas id="c" /><script>' in the html..
// Leaving these as notes for future.. I'm not using these constants anymore.
// Values for some fovY->PERSPECTIVE_F:
// 90deg->1.0 60deg->1.732 45deg->2.414 36deg->3.077 30deg->3.732 28.07deg->4.0 20deg->5.671

const AUDIO_BUFSIZE = 2048;
const SAMPLE_RATE = 44100;
var startTimeInMillis = null;

var dbg_ms_at_last_seek = null; //DEBUG
var dbg_ms_offset = 0;          //DEBUG
var dbg_paused = false;         //DEBUG


// Global time in seconds, matching audio exactly (updated in audio callback)
var audio_time = 0;
// Audio-system-related global vars; initialized upon user gesture.
var audioctx,sp;

// "Graphics assets"; initialized before each screen update
//var stuffpoints;


// ---------------------------
// Some debug code, pretty much copy-pasted from my recent-ish 4k stuff.
// These should get swallowed automatically from the tiny compo version.

var dbg_frames_drawn = 0;       //DEBUG
var dbg_ms_at_last_seek = 0;    //DEBUG
var dbg_t_at_seek = 0;          //DEBUG
var dbg_paused = false;         //DEBUG

/** Returns time in seconds when using the debug seek. */
var debug_upd_time = function(curTimeInMillis) {
    if (!dbg_ms_at_last_seek) dbg_ms_at_last_seek = startTimeInMillis;
    const ms_since_seek = dbg_paused ? 0:(curTimeInMillis - dbg_ms_at_last_seek);
    return dbg_t_at_seek + (ms_since_seek / 1000);
}

/** Click event handler that performs seek/pause of show in debug mode. */
var debug_seek = function(e) {
    // Handle seek and pausing in debug mode:
    const target_s = e.pageX / window.innerWidth * 1.1 * DURATION_SECONDS;
    dbg_paused = e.pageY < (c.height/2);
    dbg_ms_at_last_seek = performance.now();
    dbg_t_at_seek = target_s;
    // Back-track the global show start time according to the seek:
    startTimeInMillis = dbg_ms_at_last_seek - target_s * 1000;

    // If the show had already stopped, re-enter animation driver before time reset:
    if (audio_time >= DURATION_SECONDS)
	window.requestAnimationFrame(animation_driver);

    // Then, update global audio time
    audio_time = target_s;

    // reset FPS counter
    dbg_frames_drawn = 0;
}

/** Debug information per frame, drawn on 2d context ctx at time t. */
var debug_information = (ctx, t, w, h, msg = '') => {
    /* Omit info if the URL ends in '#'. Use for tidy screenshots...  */
    if (window.location.href.slice(-1) == '#') return;

    dbg_frames_drawn++;
    const since_seek = ( performance.now() - dbg_ms_at_last_seek ) / 1000;
    const infotext = 't = ' + (t|0)
   	+ 's FPS (avg): '+((dbg_frames_drawn / since_seek) | 0)
	+' ar: ' + w/h
        + msg;
    ctx.font = `${20}px Monospace`;
    ctx.clearRect(0, h-20, ctx.measureText(infotext).width, 21);
    ctx.fillStyle="#000";
    ctx.fillText(infotext, 0, h-1);
}

c.addEventListener("click", debug_seek); //DEBUG


// Could be almost the same as already in lmad1?
var loopfunc = function(curTimeInMillis)
{
    try                                                          //DEBUG
    {                                                            //DEBUG
        // Time of this frame; fix beginning upon first entry.
 	    if (!startTimeInMillis) startTimeInMillis = curTimeInMillis;
        // In compo mode, compute t as the music beat since start of show:
        var t = (curTimeInMillis - startTimeInMillis) * songBeatsPerMinute / 60000;

        // In debug mode, time is a bit more elaborate, because we want to
        // be able to seek back and forth.
        if (!dbg_ms_at_last_seek) dbg_ms_at_last_seek = startTimeInMillis; //DEBUG
        var dbg_ms_since_last_seek = curTimeInMillis - dbg_ms_at_last_seek; //DEBUG
        if (dbg_paused) dbg_ms_since_last_seek = 0; //DEBUG
        t = (dbg_ms_offset + dbg_ms_since_last_seek) * songBeatsPerMinute / 60000; //DEBUG

        // Update canvas size (window object is implicit; need no "window.X")
        var w = innerWidth, h = innerHeight;
        c.width=w; c.height=h;
        //if (w != Cw || h != Ch) {
        //    gl.viewport(0, 0, Cw=C.width=w, Ch=C.height=h);
        //}

        /* In debug mode, show window size, aspect ratio, and time.       */
        /* Omit info if the URL ends in '#'. Use for tidy screenshots...  */
        dbg_url=window.location.href;                                //DEBUG
        if (dbg_url.substring(dbg_url.length -1)!='#'){              //DEBUG
            dbg_show_aspect.nodeValue="Size: "+w+"x"+h+" "+w/h;      //DEBUG
            dbg_show_time.nodeValue=" time=" + Math.floor(audio_time / SAMPLE_RATE) +"s" /*(audio.currentTime|0)*/ //DEBUG
                                         + "(beat " +(t|0)+ ")";     //DEBUG
        }                                                            //DEBUG

        frameProducerFunction(t, w, h);

	    requestAnimationFrame(loopfunc);

    }                                                    //DEBUG
    catch (err)                                          //DEBUG
    {                                                    //DEBUG
        alert("Error: " + err.message);                  //DEBUG
    }                                                    //DEBUG
};



/**
 * The onaudioprocess handler that gets called for audio output. 
 * This will add to audio_time which is much coarser than animation frame
 * rate.
 * 
 * Debug mode enables seeking and pausing with clicks by means of updating
 * audio_time and aligning actual animation time to it.
 * Debug mode outputs silence here when paused.
 */
function audioHandler(event) {
    if (dbg_paused) event.outputBuffer.getChannelData(0).fill(0); else { //DEBUG
        player.cpy(audio_time, 4096, event.outputBuffer.getChannelData(0));
        audio_time += 4096;
    } //DEBUG
};


    // FIXME: These into a revised, nicer, common-to-all debug object..
    // FIXME: Also, see if the mechanism in pasilawoods was actually better.
    // Debug print of location and aspect            //DEBUG
    var dbg_show_aspect=document.createTextNode(""); //DEBUG
    var dbgInfoDiv=document.createElement("div");    //DEBUG
    document.body.appendChild(dbgInfoDiv);           //DEBUG
    dbgInfoDiv.style.position = "fixed";             //DEBUG
    dbgInfoDiv.style.right = 10;                     //DEBUG
    dbgInfoDiv.style.bottom = 10;                    //DEBUG
    dbgInfoDiv.style.color = "#cde";                 //DEBUG
    dbgInfoDiv.appendChild(dbg_show_aspect);         //DEBUG
    var dbg_show_time=document.createTextNode("");   //DEBUG
    dbgInfoDiv.appendChild(dbg_show_time);           //DEBUG




/* Initialize song. */
var player = new CPlayer();
player.init(song);
while (player.generate() < 1){};

var audio_time = 0;


// Assume we execute this from the PNG unpack trick,
// so we can replace garbled content with a nicer prompt to user:
document.body.firstChild.data = "click";


// Use window click handler..
onclick = () =>
    {
    // Accidental double clicks make it a mess; prevent that:
    onclick = null; //DEBUG
    /* In debug mode I want to control the fullscreen myself, so iffalse..*/
    if (false)                                     //DEBUG
        c.style.cursor='none';
    if (false)                                     //DEBUG
        c.requestFullscreen();

    var audioctx = new AudioContext({sampleRate:SAMPLE_RATE});
    var sp = audioctx.createScriptProcessor(4096, 0, 1);
    sp.connect(audioctx.destination);
    sp.onaudioprocess = audioHandler;
    requestAnimationFrame(loopfunc);
    
    // FIXME: I want a nicer debug mode in lmad1 - make this #1 feature priority
    /* In debug mode I want to be able to seek, so wire a callback : */
    c.addEventListener("click", function(e){             //DEBUG
        // Audio seek by just setting sample index:      //DEBUG
        audio_time =                                     //DEBUG
            e.pageX/c.width*player.ns() | 0;             //DEBUG
        // Handle seek and pausing in debug mode:        //DEBUG
        dbg_ms_offset = audio_time / SAMPLE_RATE * 1000; //DEBUG
        dbg_ms_at_last_seek = performance.now();         //DEBUG
        if (e.pageY<(c.height/2)) dbg_paused = true;     //DEBUG
        else dbg_paused = false;                         //DEBUG
    });                                                  //DEBUG

    c.style.position = "fixed"; c.style.left = c.style.top = 0;
}
