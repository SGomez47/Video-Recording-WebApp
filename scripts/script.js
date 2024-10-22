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

    //Function for starting the video stream when loading the page
    function startVideoStream(videoDeviceId, audioDeviceId) {
        const constraints = {
            video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
            audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true
        };
        // Get the video stream from the camera and microphone and display it in the video element
        navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
            stream = mediaStream;
            videoElement.srcObject = stream; 
            videoElement.muted = true;
            videoElement.play();
        }).catch(function(err) {
            // If the user denies access to the camera and microphone, log an error
            console.error("Error accessing media devices.", err);
        });
    }

    //Function for toggling the recording button
    function toggleRecording(){
        /*If the recording is already started, stop the recording, change the button text and color,
        and enable the download button for downloading the video*/
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
                downloadButton.disabled = false; 
            });
        /*If the recording is not started, start the recording, change the button text and color,
        and disable the download button*/
        } else {
            recordButton.innerHTML = "Stop Recording";
            recordButton.addEventListener('mousedown', function() {
                recordButton.style.background = '#007BFF';
            });
            recordButton.addEventListener('mouseup', function() {
                recordButton.style.background = 'linear-gradient(rgba(41,66,115,1) 5%, rgba(24,40,72,1) 100%)'; 
            });
            console.log("Recording started");
            // Use RecordRTC to record the video stream
            recorder = RecordRTC(stream, {
                type: 'video',
                mimeType: 'video/webm;codecs=vp8,opus',
                bitsPerSecond: 5000000 // Adjust bitrate if necessary
            });
            recorder.startRecording();
            downloadButton.disabled = true;
        }
        isRecording = !isRecording;
        
    }
    //Function for downloading the recorded video after the recording is stopped
    function downloadRecording() {
        if (recordedVideo) {
            // Create a URL for the recorded video and download it
            // The video will be downloaded as 'recording.webm'
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
    //Function for populating the dropdowns with the available camera and microphone devices
    function populateDropdown() {
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            //for each device, create an option element and add it to the dropdown
            devices.forEach(function(device) {
                let option = document.createElement('a');
                option.textContent = device.label || `${device.kind} ${dotDropdown.children.length + 1}`;
                option.dataset.deviceId = device.deviceId;
                option.onclick = function() {
                    //if the device is a video device, set the current video device id to the device id
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
            //catch errors if the devices cannot be enumerated
        }).catch(function(err) {
            console.error("Error enumerating devices.", err);
        });
    }
    //Function for starting and stopping the screenshare
    function startScreenshare(){
        if(isScreensharing){
            screenshareButton.innerHTML = "Start Screenshare";
            screenshareButton.style.backgroundColor = "#007BFF"; 
            console.log("Screenshare stopped");
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        //else start the screenshare and change the button text
        }else{
            screenshareButton.innerHTML = "Stop Screenshare";
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

    // Add event listeners to the buttons
    recordButton.addEventListener('click', toggleRecording);
    downloadButton.addEventListener('click', downloadRecording);
    screenshareButton.addEventListener('click', startScreenshare);
    // Start the video stream when the page loads
    startVideoStream(currentVideoDeviceId, currentAudioDeviceId);
    // Populate the dropdowns with the available camera and microphone devices
    populateDropdown();

    //Change the color of the record button when it is clicked
    recordButton.addEventListener('mousedown', function() {
        recordButton.style.background = 'linear-gradient(90deg, rgba(116,3,3,1) 0%, rgba(215,50,50,1) 69%)';
    });
    recordButton.addEventListener('mouseup', function() {
        recordButton.style.background = '#FF0000'; 
    });     

});