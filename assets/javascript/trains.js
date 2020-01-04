//@ts-check
let trainData = {};

$(document).on("click", "#button", function(event) {
    event.preventDefault();
    trainData.trainName = $("#train-input").val().trim();
    trainData.dest = $("#dest").val().trim();
    trainData.startTime = $("#start-time").val().trim();
    trainData.freq = $("#freq").val().trim();
    console.log(trainData);
})


/* <label for="train-input" class="headings">Train Name</label>
<input type="text" class="form-control" id="train-input" placeholder="Last Train to Nowhere">
<label for="dest" class="headings">Destination</label>
<input type="text" class="form-control" id="dest" placeholder="Nowhere">
<label for="start-time" class="headings">First Train Time (HH:mm - 24 hour time)</label>
<input type="text" class="form-control" id="start-time" placeholder="HH:mm">
<label for="freq" class="headings">Frequency (min)</label>
<input type="text" class="form-control" id="freq" placeholder="min"></input> */