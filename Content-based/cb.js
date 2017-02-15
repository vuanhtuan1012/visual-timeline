"use strict"; // enforce stricter syntax rules in JS

var intVal; // interval value

// size of frame in navigation
var fWidth;
var fHeight;

// # of cols and rows in navigation
var navCols;
var navRows;

var numFrames; // # of key frames

var video;
var nav;
var context;
var iter;
var constructing = 'keyframes are constructing... ';
var computing = 'keyframes are computing... ';
var ptitle;
var frameRate;
var prevFrame;
var keyframes;
var threshold;
var accumDiff;

function initialize(){
    video = document.getElementById("video");
    nav = document.getElementById("nav");
    ptitle = document.getElementById("ptitle");
    context = nav.getContext("2d");
    frameRate = 2; // set frameRate = 25fps, threshold = 20 - 412 keyfreames of 5916 frames
    intVal = Math.floor(1000/frameRate); // # of milliseconds between frame updates
    navCols = 4;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    keyframes = new Array();
    threshold = 20;

    fWidth = Math.floor(video.width/navCols);
    fHeight = Math.floor(video.height/navCols);
    numFrames = Math.floor(video.duration*1000/intVal);
    nav.width = video.width;
    nav.height = video.height;

    var container = document.getElementById("container");
    container.style.width = video.width + 20 + 'px';
    container.style.height = video.height + 'px';

    construction();
}

function construction(){
    video.addEventListener("seeked", computeFrame);
    video.controls = false; // disable control video
    iter = 0;
    video.currentTime = 0;
}

function computeFrame(){
    var frame;
    var currFrame;
    var hiddenCanvas;
    var hiddenCtx;

    if (iter > numFrames){ // keyframe construction completed
        video.removeEventListener("seeked", computeFrame);

        navRows = Math.ceil(keyframes.length/navCols);
        nav.width = video.width;
        nav.height = navRows*fHeight;

        video.addEventListener("seeked", buildFrame);
        iter = 0;
        ptitle.innerHTML = "Computation complete!";
        video.currentTime = 0;

        return;
    };

    // show process of compute keyframes
    var state = Math.round((iter*100/numFrames)*100)/100;
    ptitle.innerHTML = computing + state + '%';

    // capture frame to canvas
    hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = video.width;
    hiddenCanvas.height = video.height;
    hiddenCtx = hiddenCanvas.getContext("2d");
    hiddenCtx.drawImage(video, 0, 0);
    setTimeout(function(){
        iter++;

        if(video.currentTime == 0){
            prevFrame = hiddenCtx.getImageData(0, 0, video.width, video.height);
            accumDiff = 0;
            frame = {pos: 0, time: 0, accumDiff: 0, diff: 0};
            keyframes.push(frame);
        } else{
            currFrame = hiddenCtx.getImageData(0, 0, video.width, video.height);
            var diff = compareFrames(prevFrame, currFrame);
            accumDiff += diff;
            if(accumDiff >= threshold){
                frame = {pos: keyframes.length, time: video.currentTime, accumDiff: accumDiff, diff: diff};
                keyframes.push(frame);
                accumDiff = 0;
            }
            prevFrame = currFrame;
        }

        video.currentTime = iter*intVal/1000;
    }, 10);
}

function handleClick(event){
    var pos = new Array(event.layerX, event.layerY); // position of the mouse in the nav
    var row = Math.floor(pos[1]/fHeight);
    var col = Math.floor(pos[0]/fWidth);
    var fpos = row*navCols + col; // position of frame in the nav
    video.currentTime = keyframes[fpos].time;
    console.log(keyframes[fpos]);
}

function compareFrames(frm1, frm2){
    var len = frm1.data.length;
    var r, g, b;
    var mean = 0;
    for(var i=0; i<len-4; i+=4){
        r = Math.pow(frm1.data[i] - frm2.data[i], 2);
        g = Math.pow(frm1.data[i+1] - frm2.data[i+1], 2);
        b = Math.pow(frm1.data[i+2] - frm2.data[i+2], 2);
        mean += Math.sqrt(r + g + b);
    }
    mean = mean/(frm1.width * frm1.height);
    return Math.round(mean*100)/100;
}

function buildFrame(){
    if(iter == keyframes.length){ // build complete
        video.removeEventListener("seeked", buildFrame);

        video.controls = true; // enable control video
        // make the interactive panel
        nav.addEventListener("mousedown", function(event){
            if(event.button == 0) handleClick(event);
        }, false);

        video.currentTime = 0;
        ptitle.innerHTML = "Navigation Panel";

        return;
    }

    // show process of compute keyframes
    var state = Math.round((iter*100/keyframes.length)*100)/100;
    ptitle.innerHTML = constructing + state + '%';

    var fX = (iter % navCols) * fWidth;
    var fY = (Math.floor(iter/navCols)) * fHeight;
    context.drawImage(video, 0, 0, video.width, video.height, fX, fY, fWidth, fHeight);

    // wait 10 milliseconds before seeking to next frame
    setTimeout(function(){
        iter++;
        if(iter < keyframes.length){
            video.currentTime = keyframes[iter].time;
        } else{
            buildFrame();
        }
    }, 10);
}

function changeVideo(){
    var vfile = document.getElementById("vfile");
    context.clearRect(0, 0, nav.width, nav.height);
    video.src = vfile.value;
}