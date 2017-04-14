var TwitterPackage = require('twitter');
var weather = require("openweather-apis")

weather.setAPPID('fa61b3ee655f05dad2b8fd10bdde1703');

var secret = {
  consumer_key: 'kIzx6PcIGNMRSRlyvc9l6bNq6',
  consumer_secret: 'iylQIWn72omZLIOeN0ReYgMXAVxdBSWWl7QzWIVBpVSIOEwN4s',
  access_token_key:'851536440341155840-uN3tn1jKTP8UtG8zG7rVuaCoF81qc17',
  access_token_secret: 'ljTPlLzRzi8CYWMa1lXHH4NP79gT6gkrzIjMVVm8GGbw8'
};
var Twitter = new TwitterPackage(secret);

// MAKE A TWEET
// TWEET AUTOMATICALLY IN THE MORNING FOR MY AREA
/*
Twitter.post('statuses/update', {status: 'HELLO I AM AN APP. IGNORE ME!'},  function(error, tweet, response){
  if(error){
    console.log(error);
  }
  console.log(tweet);  // Tweet body.
  console.log(response);  // Raw response object.
});
*/

// WHAT TO LISTEN FOR
// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', {track: '#weatherwear'}, function(stream) {

  // ... when we get tweet data...
  stream.on('data', function(tweet) {

    // print out the text of the tweet that came in
    console.log(tweet.text);

    //split up the tweet's text
    var tweetArr = tweet.text.split(" ");
    var place;

    // If the place name is longer than one word i.e. el paso, etc
    if(tweetArr.length > 2){
      place = tweetArr[0] + tweetArr[1];
    }else{
      place = tweetArr[0];
    }

    var currTemp = 0;
    weather.setCity(place);

    weather.getAllWeather(function(err, JSONObj){
       var temp = Math.floor(parseInt(tempCovertCtoF(JSONObj.main.temp)));
       var windSpeed = JSONObj.wind.speed;
       var windChill = Math.floor(parseInt(windChillCalc(temp, windSpeed)));

       console.log(typeof("Temp is a " + temp));

       // What to wear logic
       var reply = "Hi @" + tweet.user.screen_name + ", it is " + temp + ", but it feels like " + windChill + ". ";

       var min = JSONObj.main.temp_min;
       var max = JSONObj.main.temp_max;
       var rain = JSONObj.rain;

       if(temp > 90){
         reply += "Wear sunscreen! It's so hot."
       }
       else if(temp > 75){
         reply += "T-shirt weather!";
       }
       else if(temp > 60){
         reply += "Light jacket or long sleeves."
       }

       else if(temp > 41){
         reply += "Layer up or wear a hat."
       }
       else{
         reply += "Wow, it's freezing. You'd better wear a winter coat.";
       }

       // If It's raining in the next three hours
       if(rain > 0){
         reply += " -also, bring an umbrella.";
       }

       Twitter.post('statuses/update', {status: reply},  function(error, tweetReply, response){

         //if we get an error print it out
         if(error){
             console.log(error)
         }
         //print the text of the tweet we sent out
         console.log(tweetReply.text);
       });
     });
  });
  stream.on('error', function(error) {
    console.log(error);
  });
});

function tempCovertCtoF(temp){
  return temp * 9 / 5 + 32;
}

// Temp is Farenheit, Speed in miles per hour
function windChillCalc(temp, speed){
  return 35.74 + 0.6215 * temp - 35.75 * (Math.pow(speed, 0.16) + 0.4275 * Math.pow(speed, 0.16));
}
