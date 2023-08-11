var apiKey = '90cd0f7c8cafa3d1735247cccfc01c6d';
var searchForm = document.getElementById('search-form');
var cityInput = document.getElementById('city-input');
var currentWeather = document.getElementById('current-weather');
var forecast = document.getElementById('forecast');
var searchHistory = document.getElementById('search-history');
let cities = [];

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  var cityName = cityInput.value.trim();
  if (cityName === '') return;
  getCityWeather(cityName);
  cityInput.value = '';
});

function getCityWeather(cityName) {
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.length === 0) return;
      var city = data[0];
      var lat = city.lat;
      var lon = city.lon;
      fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          displayWeather(city, data);
          updateSearchHistory(city);
        });
    });
}

function displayWeather(city, forecastData) {
  currentWeather.innerHTML = '';
  forecast.innerHTML = '';

  var currentWeatherData = forecastData.list[0];
  var currentWeatherElement = createWeatherElement(city, currentWeatherData, true);
  currentWeather.appendChild(currentWeatherElement);

  var forecastList = forecastData.list.slice(1, 6);
  for (let i = 0; i < forecastList.length; i++) {
    var forecastItem = forecastList[i];
    var forecastItemElement = createWeatherElement(city, forecastItem, true);
    forecast.appendChild(forecastItemElement);
  }
}

function createWeatherElement(city, weatherData, useFahrenheit) {
  var weatherElement = document.createElement('div');
  weatherElement.classList.add('weather-item');

  var temp = useFahrenheit ? kelvinToFahrenheit(weatherData.main.temp) : weatherData.main.temp;
  var roundedTemp = Math.round(temp);

  var date = new Date(weatherData.dt * 1000).toLocaleDateString();

  var content = `
    <p>City: ${city.name}</p>
    <p>Date: ${date}</p>
    <p>Temperature: ${roundedTemp} ${useFahrenheit ? '°F' : 'K'}</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Weather: ${weatherData.weather[0].description}</p>
    <img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="Weather Icon">
  `;
  weatherElement.innerHTML = content;

  return weatherElement;
}

function kelvinToFahrenheit(kelvin) {
  return ((kelvin - 273.15) * 9/5) + 32;
}

function clearContent(element) {
  element.innerHTML = '';
}

function updateSearchHistory(city) {
  cities.unshift(city);
  if (cities.length > 5) cities.pop();
  searchHistory.innerHTML = '';
  for (let i = 0; i < cities.length; i++) {
    var historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.textContent = cities[i].name;
    historyItem.addEventListener('click', function() {
      getCityWeather(cities[i].name);
    });
    searchHistory.appendChild(historyItem);
  }
}
