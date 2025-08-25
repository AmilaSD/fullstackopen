import axios from "axios";
const baseUrl = "https://api.openweathermap.org/data/2.5/weather"
const apiKey = import.meta.env.VITE_API_KEY;

const getWeather = (capital) => {
  const request = axios.get(`${baseUrl}?q=${capital}&appid=${apiKey}&units=metric`);
  return request.then((response) => response.data);
}

export default { getWeather };