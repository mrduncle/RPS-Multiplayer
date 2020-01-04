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


$(document).on("click", "#button", function(event) {
    event.preventDefault();
    trainData.trainName = $("#train-input").val().trim();
    trainData.dest = $("#dest").val().trim();
    trainData.startTime = $("#start-time").val().trim();
    trainData.freq = $("#freq").val().trim();
    console.log(trainData);

    database.ref().set({
        trainname: trainData.trainName,
        destination: trainData.dest,
        starttime:trainData.startTime,
        frequency: trainData.freq
    })
})

database.ref().on("value", function(values) {
    console.log(values.val());
    console.log(values.val().trainname);
    console.log(values.val().destination);
    console.log(values.val().starttime);
    console.log(values.val().frequency)
})




/* <label for="train-input" class="headings">Train Name</label>
<input type="text" class="form-control" id="train-input" placeholder="Last Train to Nowhere">
<label for="dest" class="headings">Destination</label>
<input type="text" class="form-control" id="dest" placeholder="Nowhere">
<label for="start-time" class="headings">First Train Time (HH:mm - 24 hour time)</label>
<input type="text" class="form-control" id="start-time" placeholder="HH:mm">
<label for="freq" class="headings">Frequency (min)</label>
<input type="text" class="form-control" id="freq" placeholder="min"></input> */