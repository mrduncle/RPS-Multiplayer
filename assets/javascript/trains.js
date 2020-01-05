//@ts-check
let trainData = {};

  // Your web app's Firebase configuration
let firebaseConfig = {
    apiKey: "AIzaSyBuYEqmmv30O-IIBEbaO3UTBRSoBAvn8ao",
    authDomain: "trainschedule-bd717.firebaseapp.com",
    databaseURL: "https://trainschedule-bd717.firebaseio.com",
    projectId: "trainschedule-bd717",
    storageBucket: "trainschedule-bd717.appspot.com",
    messagingSenderId: "21166858502",
    appId: "1:21166858502:web:b6183d5ac7bdfc8ab33e87"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let database = firebase.database();
// console.log("Hello, is anything working?")
console.log(database);

function checkFreq() {
    if(isNaN(trainData.freq)) {
        $("modal-validate").modal("show");
    }
}

function checkTime() {
    let regex = /(?:[01]\d|2[0123]):(?:[012345]\d)/;
    if (!trainData.startTime.match(regex)) {
        $("#modal-validate").modal("show");
    }
}

function loadFormData() {
    trainData.trainName = $("#train-input").val().trim();
    trainData.dest = $("#dest").val().trim();
    trainData.startTime = $("#start-time").val().trim();
    trainData.freq = $("#freq").val().trim();
    console.log(trainData);
    checkTime();
    database.ref().push({
        trainname: trainData.trainName,
        destination: trainData.dest,
        starttime: trainData.startTime,
        frequency: trainData.freq
    });
}

// $("#submit-button").click(function(event) {
$(document).on("click", "#submit-button, #resubmit-time", function(event) {
    console.log("Is it getting here?");
    event.preventDefault();
    if ($(this).attr("id") === "submit-button") {
        console.log("What about here?");
        loadFormData();
    }
    else if (($this).attr("id") === "resubmit-button") {
        trainData.startTime = $("#new-time").val().trim();
    }

//         // checkFreq();
//     }
//     else {
//         //pass
    
// }, function(errorObject) {
//     console.log("Errors: " + errorObject.code);
})



// database.ref().on("value", function(values) {
//     console.log(values.val());
//     console.log(values.val().trainname);
//     console.log(values.val().destination);
//     console.log(values.val().starttime);
//     console.log(values.val().frequency)
// })
