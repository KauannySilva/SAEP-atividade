
const express = require('express');
const cors = require('cors');
const path = require('path');
const initDb = require('./initdb');


const app = express();
initDb();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const produtoRouter = require('./routes/produto');
const movimentacoesRouter = require('./routes/movimentacoes');

app.use('/produtos', produtoRouter);
app.use('/movimentacoes', movimentacoesRouter);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API iniciada na porta ${PORT}`);
});
