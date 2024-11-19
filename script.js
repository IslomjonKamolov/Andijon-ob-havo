// API kalitini o'zingizning OpenWeatherMap hisobingizdan oling
const API_KEY = '9bea4ea204a141c99429234c27e122b3';
const searchInput = document.querySelector('.search-input');
const locationButton = document.querySelector('.location-button');
const noResults = document.querySelector('.no-results');
const weatherSection = document.querySelector('.weather-section');
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const weatherIcon = document.querySelector('.weather-icon');
const weatherList = document.querySelector('.weather-list');

// Loader elementi va tugmadagi matn elementlari
const buttonText = document.querySelector('.button-text');
const loader = document.querySelector('.loader');

// Shahar nomi bo'yicha ob-havo ma'lumotlarini olish funksiyasi
async function getWeatherByCity(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod === 200) {
            const { lat, lon } = data.coord;
            await getHourlyWeather(lat, lon);
            showWeatherData(data);
        } else {
            displayError();
        }
    } catch (error) {
        displayError();
    }
}

// 24 soatlik ob-havo ma'lumotlarini olish funksiyasi
async function getHourlyWeather(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        showHourlyWeather(data.list);
    } catch (error) {
        console.error('Failed to fetch hourly weather:', error);
    }
}

// Ob-havo ma'lumotlarini ekranga chiqarish funksiyasi
function showWeatherData(data) {
    const { main, weather } = data;
    const { temp } = main;
    const { description, icon } = weather[0];

    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}.png`;
    temperatureElement.innerHTML = `${Math.round(temp)}<span>°C</span>`;
    descriptionElement.textContent = description;
    noResults.style.display = 'none';
    weatherSection.style.display = 'block';
}

// 24 soatlik ob-havo ma'lumotlarini ekranga chiqarish funksiyasi
function showHourlyWeather(hourlyData) {
    weatherList.innerHTML = '';
    hourlyData.slice(0, 8).forEach((hourData) => {
        const { dt, main, weather } = hourData;
        const { temp } = main;
        const { icon } = weather[0];

        const listItem = document.createElement('li');
        listItem.classList.add('hour-item');
        const time = new Date(dt * 1000).getHours();
        listItem.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Icon">
            <span class="hour">${time}:00</span>
            <span class="temp">${Math.round(temp)}°C</span>
        `;
        weatherList.appendChild(listItem);
    });
}

// Foydalanuvchi joylashuvi asosida ob-havo ma'lumotlarini olish funksiyasi
locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        // Loader-ni ko'rsatish
        buttonText.style.display = 'none';
        loader.style.display = 'inline-block';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await getWeatherByLocation(latitude, longitude);

                // Loader-ni o'chirish
                buttonText.style.display = 'inline-block';
                loader.style.display = 'none';
            },
            () => {
                displayError();
                // Loader-ni o'chirish xato holatida
                buttonText.style.display = 'inline-block';
                loader.style.display = 'none';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Latitude va longitude asosida ob-havo ma'lumotlarini olish
async function getWeatherByLocation(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    await getHourlyWeather(lat, lon);
    showWeatherData(data);
}

// Xato ko'rsatish funksiyasi
function displayError() {
    noResults.style.display = 'block';
    weatherSection.style.display = 'none';
}

// Shahar nomi bo'yicha qidiruv
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim()) {
        getWeatherByCity(searchInput.value.trim());
    }
});
