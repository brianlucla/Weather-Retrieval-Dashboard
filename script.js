// api variables + local storage variable
var weatherArray = [];

var apiKey = "f83721195a357d2ac34b9c87e1e16d9e";
var baseApiURL = "https://api.openweathermap.org";

// DOM variables
var formEl = document.querySelector("#weather-search");
var buttonEl = document.querySelector("#button-element");
var listEl = document.getElementById('city-list');
var currCityEl = document.getElementById('curr-city');
var currTempEl = document.getElementById("curr-temp");
var currWindEl = document.getElementById("curr-wind");
var forecastEl = document.getElementById('forecast');
var currHumidityEl = document.getElementById('curr-humidity');
var radioEl1 = document.getElementById("inlineRadio1");
var radioEl2 = document.getElementById("inlineRadio2");
var forecastContEl =  document.getElementById("card-container");


//dayjs setup
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);


// fetch info from API and extract info to local storage --> temp wind and humidity
function getCityInfo(){
  var city = formEl.value;
  console.log(formEl.value);
  if(radioEl1.checked === true){
    var apiURLweather = `${baseApiURL}/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else{
    var apiURLweather = `${baseApiURL}/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  }

  if (radioEl1.checked === true) {
    var apiURLforecast = `${baseApiURL}/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  } else {
    var apiURLforecast = `${baseApiURL}/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
  }
  
  console.log(apiURLweather)
  fetch(apiURLweather)
    .then(function(response){
      return response.json();
    })
    .then(function(data){
      console.log(city);
      console.log(data);
      var cityObject={
        cityName: data.name,
        temp: data.main.temp,
        wind: data.wind.speed,
        humidity:data.main.humidity,
        longitude: data.coord.lon,
        latitude:data.coord.lat,
        icon:data.weather[0].icon
      }
      console.log(cityObject);
      saveWeatherLocalStorage(cityObject);
      weatherArray = getWeatherLocalStorage();
      console.log(weatherArray);
      setCurrent(cityObject);
    })
    .catch(function(error){
      console.log(error);
    })
  fetchForecast(apiURLforecast);
}

// return local storage arrays
function getWeatherLocalStorage(){
  var citiesWeather = JSON.parse(localStorage.getItem("cities") || "[]");
  return citiesWeather;
}

// save to local storage
function saveWeatherLocalStorage(object){
  var citiesArray = getWeatherLocalStorage();
  if (citiesArray.length!==0){
    for (let i = 0; i < citiesArray.length; i++){
      if(object.cityName === citiesArray[i].cityName){
        return;
      }
    }
  } 
  citiesArray.push(object);
  localStorage.setItem('cities', JSON.stringify(citiesArray));
  
}

// create the list of previously searched cities

function printPrevious(){
  var cityArray = getWeatherLocalStorage();
  for (let i = 0; i < cityArray.length; i++){
    var dummyEl = document.createElement("li");
    dummyEl.textContent = cityArray[i].cityName;
    listEl.appendChild(dummyEl);
  }
}

// create HTML elements for displaying current weather

function setCurrent(object){
  var date = dayjs().format('M/D/YYYY');
  currCityEl.textContent = object.cityName + " " + date;
  if(radioEl1.checked === true){
    currTempEl.innerHTML = object.temp + "°C";
  } else{
    currTempEl.innerHTML = object.temp + "°F";
  }
  if (radioEl1.checked === true) {
    currWindEl.textContent = object.wind + " m/s";
  } else {
    currWindEl.textContent = object.wind + " MPH";
  }
  currHumidityEl.textContent = object.humidity + "%";
  var iconUrl = `https://openweathermap.org/img/w/${object.icon}.png`;
  var iconEl = document.createElement("img");
  iconEl.setAttribute("src", iconUrl);
  currCityEl.append(iconEl);
}

//fetch forecast and put into array
function fetchForecast(urlForecast){
  var forecastArray = [];
  // fetch api
  fetch(urlForecast)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      for(let i = 2; i < data.list.length; i+=8){
        forecastArray.push(data.list[i]);
      }
      console.log(forecastArray);
      createFiveDay(forecastArray);
    })
    .catch(function (error) {
      console.log(error);
    });
}

// create HTML elements for displaying 5 day forecast

function createFiveDay(dummyForeArray){
  // create container
  console.log(dummyForeArray);
  var list_elements = forecastContEl.getElementsByTagName("card");
  for(let i = 0; i < dummyForeArray.length; i++){
    var title = document.createElement("h4");
    var tempInfo = document.createElement("p");
    var windInfo = document.createElement("p");
    var humidInfo = document.createElement("p");
    var iconImg = document.createElement("img");
    
    // set text
    var iconID = dummyForeArray[i].weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/w/${iconID}.png`;
    iconImg.setAttribute("src", iconUrl);
    if(radioEl1.checked === true){
      tempInfo.textContent = "Temp: " + dummyForeArray[i].main.temp + "°C";
    } else{
      tempInfo.textContent = "Temp: " + dummyForeArray[i].main.temp + "°F";
    }
    if (radioEl1.checked === true) {
      windInfo.textContent = "Temp: " + dummyForeArray[i].wind.speed + " m/s";
    } else {
      tempInfo.textContent = "Temp: " + dummyForeArray[i].wind.speed + " MPH";
    }
    humidInfo.textContent = "Humidity: " + dummyForeArray[i].main.humidity + "%";
    var titleFormatSplit = (dummyForeArray[i].dt_txt.split(" ")[0]).split("-");
    title.textContent = titleFormatSplit[1] + '-'+titleFormatSplit[2]+'-' + titleFormatSplit[0];
    list_elements[i].append(title);
    list_elements[i].append(tempInfo);
    list_elements[i].append(windInfo);
    list_elements[i].append(humidInfo);
    title.append(iconImg);
  }

  
}

printPrevious();

// event listener 
buttonEl.addEventListener("click", getCityInfo);
formEl.addEventListener("keypress", function(event){
  if(event.key === "Enter"){
    getCityInfo();
  }
})

