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

var mulIntVal;
var multires;
var mtitle;
var ftime;
var mulCols;
var fWidthMul;
var fHeightMul;
var isPlaying;
var vstate;
var ctime;

function initialize(){
    video = document.getElementById("video");
    nav = document.getElementById("nav");
    ptitle = document.getElementById("ptitle");
    context = nav.getContext("2d");
    intVal = 2000; // # of milliseconds between frame updates
    navCols = 4;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    multires = document.getElementById("multires");
    mtitle = document.getElementById("mtitle");
    mulIntVal = 125;
    mulCols = 3;
    isPlaying = false;

    fWidth = Math.floor(video.width/navCols);
    fHeight = Math.floor(video.height/navCols);
    numFrames = Math.floor(video.duration*1000/intVal);
    navRows = Math.ceil(numFrames/navCols);
    nav.width = video.width;
    nav.height = navRows*fHeight;
    fWidthMul = Math.floor(video.width/mulCols);
    fHeightMul = Math.floor(video.height/mulCols);

    var container = document.getElementById("container");
    container.style.width = video.width + 20 + 'px';
    container.style.height = video.height + 'px';

    multires.width = video.width;
    multires.height = video.height;
    multires.getContext("2d").clearRect(0, 0, video.width, video.height);
    mtitle.hidden = true;

    video.addEventListener("play", function(){
        isPlaying = true;
    }, false);
    video.addEventListener("pause", function(){
        isPlaying = false;
    }, false);

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
            if(event.button == 0) handleNavClick(event);
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

function handleNavClick(event){
    var pos = new Array(event.layerX, event.layerY); // position of the mouse in the nav
    var row = Math.floor((pos[1])/fHeight);
    var col = Math.floor((pos[0])/fWidth);
    ftime = (row*navCols + col)*intVal/1000; // time of frame in the nav

    // build multiresolution panel
    vstate = isPlaying;
    ctime = video.currentTime;
    video.pause();
    video.addEventListener("seeked", captureFrameMulRes);
    video.controls = false; // disable control video
    iter = -4;
    numFrames = 4;
    context = multires.getContext("2d");
    context.clearRect(0, 0, video.width, video.height);
    var seekTo = ftime + iter*mulIntVal/1000;
    seekTo = (seekTo < 0) ? 0 : (seekTo > video.duration) ? video.duration : seekTo;
    video.currentTime = seekTo;
}

function captureFrameMulRes(){
    if (iter > numFrames){ // keyframe construction completed
        video.removeEventListener("seeked", captureFrameMulRes);
        video.controls = true; // enable control video
        // make the interactive multiresolution panel
        multires.addEventListener("mousedown", function(event){
            if(event.button == 0) handleClick(event);
        }, false);

        video.currentTime = ctime;
        mtitle.innerHTML = "Multiresolution Panel";
        if(vstate) video.play();
        return;
    };

    // show process of keyframes construction
    var state = Math.round(((iter+4)*100/(numFrames+4))*100)/100;
    mtitle.hidden = false;
    mtitle.innerHTML = constructing + state + '%';

    // capture frame to canvas
    var fX = ((iter+4) % mulCols) * fWidthMul;
    var fY = (Math.floor((iter+4)/mulCols)) * fHeightMul;
    context.drawImage(video, 0, 0, video.width, video.height, fX, fY, fWidthMul, fHeightMul);

    // wait 10 milliseconds before seeking to next frame
    setTimeout(function(){
        iter++;
        var seekTo = ftime + iter*mulIntVal/1000;
        seekTo = (seekTo < 0) ? 0 : (seekTo > video.duration) ? video.duration : seekTo;
        video.currentTime = seekTo;
    }, 10);
}

function handleClick(event){
    var pos = new Array(event.layerX, event.layerY); // position of the mouse in the nav
    var row = Math.floor((pos[1] - multires.offsetTop)/fHeightMul);
    var col = Math.floor((pos[0] - multires.offsetLeft)/fWidthMul);
    var fpos = row*mulCols + col; // position of frame in multiresolution panel
    video.currentTime = ftime + (fpos - 4)*mulIntVal/1000;
}

function changeVideo(){
    var vfile = document.getElementById("vfile");
    video.src = vfile.value;
}