// API key for OpenWeatherMap
var apiKey = '90cd0f7c8cafa3d1735247cccfc01c6d';

// Get references to HTML elements
var searchForm = document.getElementById('search-box');
var cityInput = document.getElementById('city-input');
var currentWeather = document.getElementById('current-weather');
var forecast = document.getElementById('forecast');
var searchHistory = document.getElementById('search-history');

// Array to store search history
let cities = [];

// Event listener for search
searchForm.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent default
  var cityName = cityInput.value.trim(); // Get city name from input
  if (cityName === '') return; // Return if city name is empty
  getCityWeather(cityName); // Fetch city's weather data
  cityInput.value = ''; // Clear input field
});

// Fetch city's weather data
function getCityWeather(cityName) {
  // Fetch city's geographic data
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.length === 0) return; // Return if data is empty
      var city = data[0]; // Extract city data
      var lat = city.lat; // Get latitude
      var lon = city.lon; // Get longitude
      // Fetch city's forecast data
      fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          // Display city's weather info
          displayWeather(city, data);
          // Update search history
          updateSearchHistory(city);
        });
    });
}

// Function to display weather info
function displayWeather(city, forecastData) {
  clearContent(currentWeather); // Clear current weather section
  clearContent(forecast); // Clear forecast section

  var currentWeatherData = forecastData.list[0]; // Get current weather data
  // Create & append current weather element
  var currentWeatherElement = createWeatherElement(city, currentWeatherData, true);
  currentWeather.appendChild(currentWeatherElement);

  var forecastList = forecastData.list.slice(1, 6); // Get 5-day forecast data
  // Create & append forecast elements
  for (let i = 0; i < forecastList.length; i++) {
    var forecastItem = forecastList[i];
    var forecastItemElement = createWeatherElement(city, forecastItem, true);
    forecast.appendChild(forecastItemElement);
  }
}

// Create weather element
function createWeatherElement(city, weatherData, useFahrenheit) {
  var weatherElement = document.createElement('div'); // Create a new div element
  weatherElement.classList.add('weather-item'); // Add CSS class to element

  var temp = useFahrenheit ? kelvinToFahrenheit(weatherData.main.temp) : weatherData.main.temp; // Convert temperature if needed
  var roundedTemp = Math.round(temp); // Round temperature to nearest whole number

  var date = new Date(weatherData.dt * 1000).toLocaleDateString(); // Convert timestamp to date

  // Create HTML content for weather element
  var content = `
    <p>City: ${city.name}</p>
    <p>Date: ${date}</p>
    <p>Temperature: ${roundedTemp} ${useFahrenheit ? '°F' : 'K'}</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Weather: ${weatherData.weather[0].description}</p>
    <img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="Weather Icon">
  `;
  weatherElement.innerHTML = content; // Set HTML content

  return weatherElement; // Return created element
}

// Convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
  return ((kelvin - 273.15) * 9/5) + 32;
}

// Clear content of an element
function clearContent(element) {
  element.innerHTML = ''; // Set inner HTML to an empty string
}

// Update search history
function updateSearchHistory(city) {
  cities.unshift(city); // Add city to beginning of array
  if (cities.length > 5) cities.pop(); // Keep only last 5 searched cities
  clearContent(searchHistory); // Clear search history section
  // Create & append history items
  for (let i = 0; i < cities.length; i++) {
    var historyItem = document.createElement('div'); // Create a new div element
    historyItem.classList.add('history-item'); // Add CSS class to element
    historyItem.textContent = cities[i].name; // Set text content
    historyItem.addEventListener('click', function() {
      getCityWeather(cities[i].name); // Fetch weather data when history item is clicked
    });
    searchHistory.appendChild(historyItem); // Append element to search history
  }
}
