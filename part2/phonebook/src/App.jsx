import { useState, useEffect } from "react";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Message from "./components/Message";
import "./index.css";

import phonebookService from "./services/phonebook";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState(null);

  /**
   * message display
   */
  const showMessage = (message, type) => {
    setMessage({ message, type });
    setTimeout(() => {
      setMessage(null); // hide after 3s
    }, 3000);
  };

  /**
   * filter persons
   */
  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  /**
   * event handlers
   */
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  /**
   * add a new person to the phonebook
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    // update number if name already exists
    if (persons.some((person) => person.name === newName)) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const person = persons.find((p) => p.name === newName);
        const changedPerson = { ...person, number: newNumber };
        phonebookService
          .update(person.id, changedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((p) => (p.id !== person.id ? p : returnedPerson))
            );
            showMessage(`Updated ${returnedPerson.name}`, "success");
            setNewName("");
            setNewNumber("");
          });
      }
      return;
    }
    // create new person if name doesn't exist
    const newPerson = { name: newName, number: newNumber };
    phonebookService.create(newPerson).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      showMessage(`Added ${returnedPerson.name}`, "success");
      setNewName("");
      setNewNumber("");
    });
  };

  /**
   * delete a person from the phonebook
   */
  const handleDelete = (person) => {
    if (window.confirm(`Delete ${person.name}?`)) {
      phonebookService.deletePerson(person.id).then(() => {
        setPersons(persons.filter((p) => p.id !== person.id));
        showMessage(`Deleted ${person.name}`, "success");
      }).catch(() => {
        showMessage(
          `Information of ${person.name} has already been removed from server`,
          "error"
        );
        setPersons(persons.filter((p) => p.id !== person.id));
      });
    }
  };

  /**
   * initial load
   */
  useEffect(() => {
    phonebookService.getAll().then((response) => {
      setPersons(response);
    });
  }, []);

  return (
    <div>
      <Message message={message} />
      <h2>Phonebook</h2>
      <Filter query={filter} handler={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm
        handleSubmit={handleSubmit}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
