import { useEffect, useState } from "react";
import weatherService from "../services/weather";
const Country = ({ country }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    weatherService.getWeather(country.capital).then((data) => {
      setWeather(data);
    });
  }, [country]);

  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>
        <p>Capital: {country.capital}</p>
        <p>Area: {country.area}</p>
      </div>
      <h2>Languages</h2>
      <ul>
        {Object.entries(country.languages).map(([code, name]) => (
          <li key={code}>{name}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={country.name.common} />
      <h2>Weather in {country.capital}</h2>
      {weather === null ? (
        <p>Loading weather...</p>
      ) : (
        <div>
          <p>Temperature: {weather.main.temp} °C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].main}
          />
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default Country;
