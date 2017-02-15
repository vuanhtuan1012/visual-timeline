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
var constructing = 'key frames are constructing... ';
var ptitle;

function initialize(){
    video = document.getElementById("video");
    nav = document.getElementById("nav");
    ptitle = document.getElementById("ptitle");
    context = nav.getContext("2d");
    intVal = 2000; // # of milliseconds between frame updates
    navCols = 4;
    video.width = video.videoWidth;
    video.height = video.videoHeight;

    fWidth = Math.floor(video.width/navCols);
    fHeight = Math.floor(video.height/navCols);
    numFrames = Math.floor(video.duration*1000/intVal);
    navRows = Math.ceil(numFrames/navCols);
    nav.width = video.width;
    nav.height = navRows*fHeight;

    var container = document.getElementById("container");
    container.style.width = video.width + 20 + 'px';
    container.style.height = video.height + 'px';

    construction();
}

function construction(){
    video.addEventListener("seeked", captureFrame);
    video.controls = false; // disable control video
    iter = 0;
    video.currentTime = 0;
}

function captureFrame(){
    if (iter > numFrames){ // keyframe construction completed
        video.removeEventListener("seeked", captureFrame);
        video.controls = true; // enable control video
        // make the interactive panel
        nav.addEventListener("mousedown", function(event){
            if(event.button == 0) handleClick(event);
        }, false);

        video.currentTime = 0;
        ptitle.innerHTML = "Navigation Panel";

        return;
    };

    // show process of keyframes construction
    var state = Math.round((iter*100/numFrames)*100)/100;
    ptitle.innerHTML = constructing + state + '%';

    // capture frame to canvas
    var fX = (iter % navCols) * fWidth;
    var fY = (Math.floor(iter/navCols)) * fHeight;
    context.drawImage(video, 0, 0, video.width, video.height, fX, fY, fWidth, fHeight);

    // wait 10 milliseconds before seeking to next frame
    setTimeout(function(){
        iter++;
        video.currentTime = iter*intVal/1000;
    }, 10);
}

function handleClick(event){
    var pos = new Array(event.layerX, event.layerY); // position of the mouse in the nav
    var row = Math.floor(pos[1]/fHeight);
    var col = Math.floor(pos[0]/fWidth);
    var fpos = row*navCols + col; // position of frame in the nav
    video.currentTime = fpos*intVal/1000;
}

function changeVideo(){
    var vfile = document.getElementById("vfile");
    video.src = vfile.value;
}
