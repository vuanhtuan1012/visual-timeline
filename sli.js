"use strict"; // enforce stricter syntax rules in JS

var intVal; // interval value

// size of frame in navigation
var fWidth;
var fHeight;

var navCols; // # of cols in a page of navigation

var numFrames; // # of key frames

var video;
var nav;
var context;
var iter;
var constructing = 'key frames are constructing... ';
var ptitle;
var next;
var prev;
var container;

function initialize(){
    video = document.getElementById("video");
    nav = document.getElementById("nav");
    ptitle = document.getElementById("ptitle");
    context = nav.getContext("2d");
    intVal = 2000; // # of milliseconds between frame updates
    navCols = 4;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    next = document.getElementById("next");
    prev = document.getElementById("prev");

    fWidth = Math.floor(video.width/navCols);
    fHeight = Math.floor(video.height/navCols);
    numFrames = Math.floor(video.duration*1000/intVal);
    nav.width = (numFrames+1) * fWidth;
    nav.height = fHeight;

    container = document.getElementById("container");
    container.style.width = video.width + 'px';
    container.style.height = nav.height + 21 + 'px';

    next.style.top = container.offsetTop + Math.floor((container.offsetHeight - next.offsetHeight)/2) + 'px';
    next.style.left = container.offsetLeft + container.offsetWidth + 5 + 'px';
    prev.style.top = container.offsetTop + Math.floor((container.offsetHeight - prev.offsetHeight)/2) + 'px';
    prev.style.left = container.offsetLeft - prev.offsetWidth - 5 + 'px';

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
        container.scrollLeft = 0;
        ptitle.innerHTML = "Navigation Panel";

        // make the interactive buttons
        next.addEventListener("mousedown", function(event){
            if(event.button == 0) nextPage();
        }, false);
        prev.addEventListener("mousedown", function(event){
            if(event.button == 0) prevPage();
        }, false);

        return;
    };

    // show process of keyframes construction
    var state = Math.round((iter*100/numFrames)*100)/100;
    ptitle.innerHTML = constructing + state + '%';

    // capture frame to canvas
    var fX = iter * fWidth;
    var fY = 0;
    context.drawImage(video, 0, 0, video.width, video.height, fX, fY, fWidth, fHeight);

    // wait 10 milliseconds before seeking to next frame
    setTimeout(function(){
        iter++;
        video.currentTime = iter*intVal/1000;
    }, 10);
}

function handleClick(event){
    var col = Math.floor(event.layerX/fWidth);
    video.currentTime = col*intVal/1000;
}

function changeVideo(){
    var vfile = document.getElementById("vfile");
    video.src = vfile.value;
}

function nextPage(){
    if(container.scrollLeft < container.scrollLeftMax){
        container.scrollLeft += container.offsetWidth;
    }
}

function prevPage(){
    if(container.scrollLeft > 0){
        container.scrollLeft -= container.offsetWidth;
    }
}