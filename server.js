const express = require('express');
const app = express();

app.use(express.json());

const produtoRouter = require('./routes/produtoRoutes');
const movimentacoesRouter = require('./routes/movimentacoesRoutes');

app.use('/produtos', produtoRouter);
app.use('/movimentacoes', movimentacoesRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});