
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando!');
});

app.get('/produtos', (req, res) => {
    res.send('Rota de produtos funcionando!');
});

app.listen(3000, () => {
    console.log('Servidor funcionando na porta 3000');
});
