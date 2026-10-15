
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const produtoRouter = require('./routes/produto');
const movimentacoesRouter = require('./routes/movimentacoes');

app.use('/produtos', produtoRouter);
app.use('/movimentacoes', movimentacoesRouter);

app.listen(3000, () => {
    console.log('API iniciada na porta 3000');
});
