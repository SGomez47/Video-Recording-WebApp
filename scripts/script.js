document.addEventListener('DOMContentLoaded', function() {
    const videoElement = document.getElementById('video');
    const recordButton = document.getElementById('start');
    const downloadButton = document.getElementById('download');
    const cameraOptions = document.getElementById('cameraList');
    const audioOptions = document.getElementById('micList');
    const screenshareButton = document.getElementById('screenshare');
    let isRecording = false;
    let isScreensharing = false;
    let recorder;
    let stream;
    let recordedVideo;
    let currentVideoDeviceId = null;
    let currentAudioDeviceId = null;

    function startVideoStream(videoDeviceId, audioDeviceId) {
        const constraints = {
            video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
            audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
        };
        navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
            stream = mediaStream;
            videoElement.srcObject = stream; // Show the video stream in the video element
            videoElement.play();
        }).catch(function(err) {
            console.error("Error accessing media devices.", err);
        });
    }

    function toggleRecording(){
        if (isRecording) {
            recordButton.innerHTML = "Start Recording";
            recordButton.addEventListener('mousedown', function() {
                recordButton.style.background = 'linear-gradient(90deg, rgba(116,3,3,1) 0%, rgba(215,50,50,1) 69%)';
            });
            recordButton.addEventListener('mouseup', function() {
                recordButton.style.background = '#FF0000'; 
            });            
            console.log("Recording stopped");
            
            recorder.stopRecording(function() {
                recordedVideo = recorder.blob;
                console.log("Video Recorded");
            });
            
        } else {
            recordButton.innerHTML = "Stop Recording";
            recordButton.addEventListener('mousedown', function() {
                recordButton.style.background = '#007BFF';
            });
            recordButton.addEventListener('mouseup', function() {
                recordButton.style.background = 'linear-gradient(rgba(41,66,115,1) 5%, rgba(24,40,72,1) 100%)'; 
            });
            console.log("Recording started");

            recorder = RecordRTC(stream, {
                type: 'video'
            });
            recorder.startRecording();
        }
        isRecording = !isRecording;
        
    }

    function downloadRecording() {
        if (recordedVideo) {
            let url = URL.createObjectURL(recordedVideo);
            let a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recording.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            console.log("No recording available to download");
        }    
    }

    function populateDropdown() {
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            devices.forEach(function(device) {
                let option = document.createElement('a');
                option.textContent = device.label || `${device.kind} ${dotDropdown.children.length + 1}`;
                option.dataset.deviceId = device.deviceId;
                option.onclick = function() {
                    if (device.kind === 'videoinput') {
                        currentVideoDeviceId = device.deviceId;
                    } else if (device.kind === 'audioinput') {
                        currentAudioDeviceId = device.deviceId;
                    }
                    startVideoStream(device.deviceId);
                };
                if (device.kind === 'videoinput') {
                    cameraOptions.appendChild(option);
                } else if (device.kind === 'audioinput') {
                    audioOptions.appendChild(option);
                }                
            });
        }).catch(function(err) {
            console.error("Error enumerating devices.", err);
        });
    }

    function startScreenshare(){
        if(isScreensharing){
            screenshareButton.innerHTML = "Start Screenshare";
            screenshareButton.style.backgroundColor = "#007BFF"; 
            console.log("Screenshare stopped");
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }else{
            navigator.mediaDevices.getDisplayMedia({
                video: true
            }).then(function(mediaStream) {
                stream = mediaStream;
                videoElement.srcObject = stream; // Show the video stream in the video element
                videoElement.play();
            }).catch(function(err) {
                console.error("Error accessing media devices.", err);
            });
        }
    }

    recordButton.addEventListener('click', toggleRecording);
    downloadButton.addEventListener('click', downloadRecording);
    screenshareButton.addEventListener('click', startScreenshare);
    startVideoStream();
    populateDropdown();

    recordButton.addEventListener('mousedown', function() {
        recordButton.style.background = 'linear-gradient(90deg, rgba(116,3,3,1) 0%, rgba(215,50,50,1) 69%)';
    });
    recordButton.addEventListener('mouseup', function() {
        recordButton.style.background = '#FF0000'; // Red background
    });     

});