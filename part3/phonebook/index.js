const express = require("express");
var morgan = require('morgan')
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json());
app.use(express.static('dist'))

morgan.token('postData', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));

let data = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get('/api/persons', (request, responsse) => {
    responsse.json(data)
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${data.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = data.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = data.find(person => person.id === id)
    if (person) {
        data = data.filter(person => person.id !== id)
        response.status(204).end()
    } else {
        response.status(404).end()
    }
});

app.post('/api/persons', (request, response) => {
    const body = request.body
   if (!body.name) {
        return response.status(400).json({
            error: "name is missing"
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    const isNameExists = data.find(person => person.name === body.name)
    if (isNameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const id = (Math.random() * 100000).toFixed(0).toString();
    const newPerson = {
        id: id,
        name: body.name,
        number: body.number,
    }
    data = data.concat(newPerson)
    response.json(newPerson)

});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});