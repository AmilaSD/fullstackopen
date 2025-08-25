import { useEffect, useState } from "react";
import Country from "./Country";

const Countries = ({ countries, filter }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const showCountry = (country) => {
    setSelectedCountry(country);
  };
  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  );
  useEffect(() => {
    setSelectedCountry(null);
  }, [filter]);

  if (selectedCountry) {
    return <Country country={selectedCountry} />;
  }

  if (filteredCountries.length > 10) {
    return <p>Too many matches, specify another filter</p>;
  } else if (filteredCountries.length === 1) {
    return <Country country={filteredCountries[0]} />;
  } else if (filteredCountries.length === 0) {
    return <p>No countries found</p>;
  } else {
    return (
      <div>
        {filteredCountries.map((country, index) => (
          <div key={index}>
            {country.name.common} <button onClick={() => showCountry(country)}>Show</button>
          </div>
        ))}
      </div>
    );
  }
};
export default Countries;
