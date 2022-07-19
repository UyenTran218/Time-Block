/*************************************************************************
 *  MediaPlayer.js
 *  
 *  Ashley Henson
 *  110116789
 *  Henar004
 * 
 *  This class provides functionality to the MedaPlayer partial view,
 *  including updating the MediaPlayer's GUI.  
 * 
 *************************************************************************/

//Convert an integer into a readable number.
Number.prototype.toReadableTime = function () {
    if (isNaN(this)) {
        return '0:00';
    }
    var date = new Date(this.valueOf() * 1000);
    var hh = date.getUTCHours();
    var mm = date.getUTCMinutes();
    var ss = date.getSeconds();
    if (hh < 10) { hh = '0' + hh; }
    if (mm < 10 && hh > 0) { mm = '0' + mm; }
    if (ss < 10) { ss = '0' + ss; }

    return (hh > 0 ? hh + ':' : '') + (mm > 0 ? mm : '0') + ':' + ss;
}





const audioSet = new Set(['mid', 'midi', 'rm', 'ram', 'wma', 'aac', 'wav', 'ogg', 'mp3']);

const mediaPlayer = $('#media-player-video')[0];

const durationTimerOutput = $('#mediaDurationTimer');
const mediaFileName = $('#mediaFileName');

const playButtonDiv = $('#media-player-play-button-div');
const pauseButtonDiv = $('#media-player-pause-button-div');
const mainMediaDiv = $('#media-player-main-div');
const noMediaDiv = $('#noMediaDiv');
const mediaPlayerVideoDiv = $('#media-player-video-div');
const fileTypeSelection = $('.file-type-selection');

const volumeSlider = $('#volume-slider');
const durationSlider = $('#duration-slider');


let mediaDuration = 0;
let updateUITimer = null;

let slideFade = 500;

let mediaEnded = false;



$('document').ready(function () {

    //Prepare the GUI once the media files meta data has loaded.
    mediaPlayer.onloadedmetadata = function () {
        this.currentTime = CurrentTimeBlock['MediaFileElapsedTime'];
        mediaDuration = mediaPlayer.duration.toReadableTime();
        durationSlider.prop('max', mediaPlayer.duration);
        updateUI();
    };

    //Update the GUI when ever new data is loaded.
    mediaPlayer.onloadeddata = function () {
        updateUI(); 
    };

    //Once the media file has stopped playing.
    mediaPlayer.onended = function () {
        mediaEnded = true;
        if (CurrentTimeBlock['PlayBefore']) {
            _startTimer();
        }
        toggleMediaPlayerSlide();
    };

    //When someone abruptly changes the media file ie. changing TimeBlocks.
    mediaPlayer.onabort = function () {
        if (pauseButtonDiv.is(':visible')) {
            togglePlayPauseFade();
        }
        if (fileTypeSelection.is(':visible')) {
            toggleMediaPlayerSlide();
        }
    }

    //When play is called
    mediaPlayer.onplay = function () {
        setupUITimer();
        //fileTypeSelection determines whether the file is audio or video.
        if (!fileTypeSelection.is(':visible')) { 
            toggleMediaPlayerSlide();
        }
        togglePlayPauseFade();
        if (CurrentTimeBlock['PauseTimer']) {
            _PauseTimer();
        }
    };

    //When pause is called.
    mediaPlayer.onpause = function () {
        clearUITimer();
        togglePlayPauseFade();
        if (CurrentTimeBlock['PauseTimer']) {
            _startTimer();
        }
    };

    //Volume Adjustment
    volumeSlider.on('input', function () {
        mediaPlayer.volume = parseFloat(volumeSlider[0].value);
    });

    $('#media-player-play-button').click(function () {
        mediaPlayerPlayPause(true);
    });

    $('#media-player-pause-button').click(function () {
        mediaPlayerPlayPause(false);
    });

    $('#media-player-button-minimise').click(function () {
        toggleMediaPlayerSlide();
        mediaPlayerPlayPause(false);
    });

    //Fade in and out video minimiser
    fileTypeSelection.on('mouseenter', function () {
        $('#media-player-button-minimise').fadeIn()
    });
    $('.video-container').on('mouseleave', function () {
        $('#media-player-button-minimise').fadeOut({ duration: slideFade, queue: false });
    });

});




//Toggle the play pause button animation.
function togglePlayPauseFade() {
    playButtonDiv.fadeToggle(500);
    pauseButtonDiv.fadeToggle(500);
}





//Fancy animation to slide and fade at the same time.
function toggleMediaPlayerSlide() {
    let extension = CurrentTimeBlock['MediaFileName'].split('.');
    if (!audioSet.has(extension[extension.length - 1])) {
        if (fileTypeSelection.is(':visible')) {
            fileTypeSelection.stop(true, false).fadeOut({ duration: slideFade, queue: false }).slideUp(slideFade);
        } else {
            fileTypeSelection.stop(true, true).fadeIn({ duration: slideFade, queue: false }).css('display', 'none').slideDown(slideFade);      
        }
        $(".list-control-buttons-div").toggleClass('disabled enabled');
        $("#timeBlockControls").toggleClass('disabled enabled');

    }
}




//Update the media players interface and CurrentTimeBlock information.
function updateMediaPlayer() {
    mediaEnded = false;
    mediaPlayer.pause();

    if (CurrentTimeBlock['MediaFile'] == '' &&
        mediaPlayerVideoDiv.is(':visible')) {
        mediaPlayerVideoDiv.slideUp();
        $('#media-player-video').attr('src', "");
        noMediaDiv.show('slow');

    } else if (CurrentTimeBlock['MediaFile'] != '') {
        if (noMediaDiv.is(':visible')) {
            mediaPlayerVideoDiv.slideDown();
            noMediaDiv.hide('slow');
        }
        
        clearUITimer();
        var filePath = CurrentTimeBlock['MediaFile'];

        $('#media-player-video').attr('src', CurrentTimeBlock['MediaFile']);
        CurrentTimeBlock['MediaFileName'] = generateFileName(mediaPlayer.src);

        fileTypeSelection.fadeOut('slow');
        updateUI();
    }
}




//Playing and pausing function.
function mediaPlayerPlayPause(play) {
    if (mediaEnded) {
        return;
    }
    if (CurrentTimeBlock['MediaFileName'] == null || CurrentTimeBlock['MediaFileName'] == "") {
        return;
    }
    if (play) {
        if (CurrentTimeBlock["PlayBefore"]) {
            _pauseTimer();
        }
        var promise = mediaPlayer.play();

    } else {
        mediaPlayer.pause();
    }

}




function mediaPlayerGetCurrentTime() {
    return mediaPlayer.currentTime;
}





function clearUITimer() {
    clearInterval(updateUITimer);
    updateUITimer = null;
}





function setupUITimer() {
    updateUITimer = setInterval(updateUI, 250);
}





function updateUI() {
    mediaFileName.html('<h4>' + CurrentTimeBlock['MediaFileName'] + '</h4>');
    durationTimerOutput.html('<h4> Duration: ' + mediaPlayer.currentTime.toReadableTime() + '/' + mediaDuration + '</h4>');
    durationSlider.val(mediaPlayer.currentTime);
}




function generateFileName(filePath) {
    let data = filePath.split('/');
    return data[data.length - 1];
}



function _startTimer() {
    paused = false;
}

function _stopTimer() {
    stopped = true;
}

function _pauseTimer() {
    paused = true;
}