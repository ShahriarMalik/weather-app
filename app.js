let long;
let lat;
let autoDetection = true;
const specificLocation = document.querySelector(".specific-location");
const city_Location = document.querySelector(".city-location");
const temperature = document.querySelector(".temperature-unit_value");
const temperatureCelcius = document.querySelector(".celcius");
const temperatureFarenheit = document.querySelector(".farenheit");
const icon = document.querySelector(".icon");
const mainWeather = document.querySelector(".weather-main");
const weatherDescription = document.querySelector(".description");
const temperatureMax = document.querySelector(".temperature_max");
const temperatureMin = document.querySelector(".temperature_min");
const temperatureUnit = document.getElementsByClassName("unit");
const timeZone = document.querySelector(".time-zone");
const timeDiv = document.querySelector(".time-div");

const tempFeelsLike = document.querySelector(".temp_feelsLike");
const wind = document.querySelector(".wind-speed");
const speedUnit = document.querySelector(".speed-unit");
const humidity = document.querySelector(".humidity");

// ********************  fetch data from Google Autocomplete api **************************
let autoComplete;
let latGoogle;
let longGoogle;

const searchBox = document.getElementById("autocomplete");
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(searchBox, {
    fields: ["geometry", "name", "address_components"],
  });

  autocomplete.addListener("place_changed", placeChanged);
}
function placeChanged() {
  var place = autocomplete.getPlace();
  let lat = place.geometry.location.lat();
  let long = place.geometry.location.lng();

  // let address = place.formatted_address.replace(/,/g, "").split(" ");
  let address = place.address_components;

  if (!place.geometry) {
    // user didnot select a prediction; reset the input filed
    document.getElementById("autocomplete").placeholder = "Eneter a place";
  } else {
    specificLocation.textContent = "";
    city_Location.textContent = "";
    temperatureCelcius.classList.add("active");
    temperatureFarenheit.classList.remove("active");
    icon.innerHTML = "";
    timeDiv.innerHTML = "";
    specificLocation.textContent = place.name;
    for (let i = 0; i < temperatureUnit.length; i++) {
      temperatureUnit[i].innerHTML = "°C";
    }
    speedUnit.textContent = "km";
    let city = document.createElement("span");
    city.innerHTML = address.slice(-2)[0].long_name + ", ";
    city_Location.appendChild(city);
    let country = document.createElement("span");
    country.innerHTML = address.slice(-2)[1].long_name;
    city_Location.appendChild(country);
    searchBox.value = "";
    autoDetection = false;
    fetchAPIdata(long, lat);
  }
}

// ******************** Get latitude and longitude geolocation api *****************************

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    // navigator.geolocation.getCurrentPosition(() => {
    let long = position.coords.longitude;
    let lat = position.coords.latitude;
    autoDetection = true;
    fetchAPIdata(long, lat);
  });
}
// ******************** change temperature from farenheit to Celcius by click  ***************************
// change temperature from farenheit to Celcius

temperatureCelcius.addEventListener("click", () => {
  temperatureFarenheit.classList.remove("active");
  temperatureCelcius.classList.add("active");
  temperature.textContent = mainCelciusValue;
  temperatureMax.textContent = maxCelciusValue;
  temperatureMin.textContent = minCelciusValue;
  tempFeelsLike.textContent = celciusValue;
  wind.textContent = kmPerHour;
  speedUnit.textContent = "km";
  for (let i = 0; i < temperatureUnit.length; i++) {
    temperatureUnit[i].innerHTML = "°C";
  }
});

// change temperature from Celcius to farenheit

temperatureFarenheit.addEventListener("click", () => {
  temperatureCelcius.classList.remove("active");
  temperatureFarenheit.classList.add("active");
  temperature.textContent = mainFarenheitValue;
  temperatureMax.textContent = maxFarenheitValue;
  temperatureMin.textContent = minFarenheitValue;
  tempFeelsLike.textContent = farenheitValue;
  wind.textContent = milePerHour;
  speedUnit.textContent = "m";

  for (let i = 0; i < temperatureUnit.length; i++) {
    temperatureUnit[i].innerHTML = "°F";
  }
});

// *************************** functions *********************************

// convert temperature from kelvin to celcius and farenheit

function convertKelvin(value) {
  celcius = Math.floor(value - 273.15);
  farenheit = Math.floor((Math.floor(value - 273.15) * 9) / 5 + 32);
}
// set local time
function setLocalTime(time) {
  date = new Date();
  localTime = date.getTime();
  localOffset = date.getTimezoneOffset() * 60000;
  utc = localTime + localOffset;
  let location = utc + 1000 * time;
  localTime = new Date(location).toLocaleTimeString();
}
// set temperature value in DOM

function setMainTemp(value) {
  convertKelvin(value);
  mainCelciusValue = celcius;
  mainFarenheitValue = farenheit;
}
function setMaxTemp(value) {
  convertKelvin(value);
  maxCelciusValue = celcius;
  maxFarenheitValue = farenheit;
}
function setMinTemp(value) {
  convertKelvin(value);
  minCelciusValue = celcius;
  minFarenheitValue = farenheit;
}
function setFeelsLikeTemp(value) {
  convertKelvin(value);
  celciusValue = celcius;
  farenheitValue = farenheit;
}

function windSpeed(value) {
  kmPerHour = Math.floor(value * 3.6);
  milePerHour = Math.floor(value * 2.237);
}

// ************ fetch openweathermap API data and set values in the dom ****************
function fetchAPIdata(long, lat) {
  const weatherApi =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    lat +
    "&lon=" +
    long +
    "&appid=819e08a40500be1cd4d3885a893e0c58";
  // const weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${api_key}`;
  fetch(weatherApi)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const time = data.timezone;
      setLocalTime(time);
      const mainData = data.main;
      // *********** Set DOM elements from the api ******************
      setMainTemp(mainData.temp);
      setMaxTemp(mainData.temp_max);
      setMinTemp(mainData.temp_min);
      setFeelsLikeTemp(mainData.feels_like);
      windSpeed(data.wind.speed);
      // dynamically write specific location  and country if nothing is selected from searchbox
      if (autoDetection === true) {
        specificLocation.textContent = data.name;
        // fetch city and country name from mapquest api using latitude and longitude
        const locationFetchAPI =
          "https://www.mapquestapi.com/geocoding/v1/reverse?key=5P3cEyRiLM7BN3eR0sqMBRmunGx1jDYQ&location=" +
          lat +
          "%2C" +
          long +
          "&outFormat=json&thumbMaps=false";
        fetch(locationFetchAPI)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            let cityName = data.results[0].locations[0].adminArea3;
            let city = document.createElement("span");
            city.innerHTML = cityName + ", ";
            city_Location.appendChild(city);
            let country = document.createElement("span");
            let regionNames = new Intl.DisplayNames(["en"], { type: "region" });
            const countryShortName = data.results[0].locations[0].adminArea1;
            const countryFullName = regionNames.of(countryShortName); // "Germany"
            country.innerHTML = countryFullName;
            city_Location.appendChild(country);
          });
      }

      timeDiv.innerHTML = `<h3>${localTime}</h3>`;
      temperature.textContent = mainCelciusValue;
      temperatureMax.textContent = maxCelciusValue;
      temperatureMin.textContent = minCelciusValue;
      tempFeelsLike.textContent = celciusValue;
      humidity.textContent = mainData.humidity;
      wind.textContent = kmPerHour;
      mainWeather.textContent = data.weather[0].main;
      weatherDescription.textContent = data.weather[0].description;
      const iconID = data.weather[0].icon;
      let img = document.createElement("img");
      img.src = `http://openweathermap.org/img/wn/${iconID}@2x.png`;
      icon.appendChild(img);
    });
}
