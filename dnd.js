"use strict"; // enforce stricter syntax rules in JS

var intVal; // interval value

// size of frame in navigation
var fWidth;
var fHeight;

// # of cols and rows in navigation
var navCols;
var navRows;

var video;
var nav;
var context;
var iter;
var constructing = 'key frames are constructing... ';
var ptitle;

var isPlaying;
var keyframes;

function initialize(){
    video = document.getElementById("video");
    nav = document.getElementById("nav");
    ptitle = document.getElementById("ptitle");
    context = nav.getContext("2d");
    intVal = 2000; // # of milliseconds between frame updates
    navCols = 4;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    navRows = 1;
    isPlaying = false;
    keyframes = new Array();

    fWidth = Math.floor(video.width/navCols);
    fHeight = Math.floor(video.height/navCols);
    nav.width = video.width;
    nav.height = navRows*fHeight;

    var container = document.getElementById("container");
    container.style.width = video.width + 20 + 'px';
    container.style.height = video.height + 'px';

    nav.addEventListener("mousedown", function(event){
        if(event.button == 0) handleClick(event);
    }, false);

    video.addEventListener("play", function(){
        isPlaying = true;
    }, false);
    video.addEventListener("pause", function(){
        isPlaying = false;
    }, false);
}

function captureFrame(evt){
    evt.preventDefault();
    var state = isPlaying;
    video.pause();
    video.controls = false; // disable control video
    video.removeAttribute("ondragstart"); // disable drag video
    var frame = {pos: keyframes.length, time: video.currentTime};
    keyframes.push(frame);

    var rows = Math.floor(keyframes.length/navCols) + 1;
    if((rows > navRows)&&(keyframes.length%navCols != 0)){ // change the number of rows
        navRows = rows;
        nav.height = navRows*fHeight;

        // repaint key frames
        video.addEventListener("seeked", repaint);
        iter = 0;
        video.currentTime = keyframes[iter].time;
    }else{
        iter = keyframes.length - 1;
        capture();
        video.controls = true; // enable control video
        video.setAttribute("ondragstart", "drag(event);"); // enable drag video
        ptitle.innerHTML = "Navigation Panel";
    }
    if(state){ video.play(); }
}

function repaint(){
    if(iter == keyframes.length){ // repaint complete
        video.removeEventListener("seeked", repaint);
        video.controls = true; // enable control video
        video.setAttribute("ondragstart", "drag(event);"); // enable drag video
        ptitle.innerHTML = "Navigation Panel";
        return;
    }

    // show process of repaint
    var progress = Math.round(((iter+1)*100/keyframes.length)*100)/100;
    ptitle.innerHTML = constructing + progress + '%';

    // capture frame to canvas
    capture();

    // wait 10 milliseconds before seeking to next frame
    setTimeout(function(){
        iter++;
        if(iter < keyframes.length){
            video.currentTime = keyframes[iter].time;
        } else{
            repaint();
        }
    }, 10);
}

function capture(){
    var fX = (iter % navCols) * fWidth;
    var fY = (Math.floor(iter/navCols)) * fHeight;
    context.drawImage(video, 0, 0, video.width, video.height, fX, fY, fWidth, fHeight);
}

function handleClick(event){
    if(!video.controls){ return; }
    var pos = new Array(event.layerX, event.layerY); // position of the mouse in the nav
    var row = Math.floor(pos[1]/fHeight);
    var col = Math.floor(pos[0]/fWidth);
    var fpos = row*navCols + col; // position of frame in the nav
    if(fpos >= keyframes.length){ return; }
    video.currentTime = keyframes[fpos].time;
}

function changeVideo(){
    var vfile = document.getElementById("vfile");
    video.src = vfile.value;
}

function allowDrop(evt) {
    evt.preventDefault();
}

function drag(evt) {
    evt.dataTransfer.setData("Text", evt.target.id);
}