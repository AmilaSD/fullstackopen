import { useEffect, useState } from "react";
import countryService from "./services/country";
import Countries from "./components/Countries";

const App = () => {
  const [filter, setFilter] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    countryService.getAll().then((allCountries) => {
      setCountries(allCountries);
    });
  }, []);

  const onFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div>
      <div>
        find countries <input type="text" value={filter} onChange={onFilterChange} />
      </div>
      <div>
        <Countries countries={countries} filter={filter} />
      </div>
    </div>
  );
};

export default App;
