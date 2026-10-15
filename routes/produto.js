const express = require('express');
const produtoRouter = express.Router();
const db = require('../mysql');

produtoRouter.get('/teste', (req, res) => {
    res.send('Rota de produtos funcionando!');
}); 

produtoRouter.get('/', (req, res) => {
    db.query('SELECT *FROM produtos', (err, results) => {
        if (err) {
            res.status(500).json({
                erro: "erro ao bsucar produto"})
 } else {
                res.status(200).json(results);
            }
 })
})
produtoRouter.get('/vw_estoque', (req, res) => {
    db.query('SELECT * FROM vw_estoque', (err, results) => {

        if (err) {
            res.status(500).json({
                error: "erro ao bsucar view"})
 } else {
                res.status(200).json(results);
            }
 })
})
produtoRouter.post('/', (req, res) => {
    const { nome, quantidade, valor, categoria, unidade_medida } = req.body;
    if (valor <= 0) {
        return res.status(400).json({
            erro: "O valor deve ser maior que zero"
        });
    }
    if (quantidade < 0) {
        return res.status(400).json({
            erro: "A quantidade não pode ser negativa"
        });
    }
    if (!categoria || categoria.trim() === '') {
        return res.status(400).json({
            erro: "A categoria é obrigatória"
        });
    }
    db.query(
        'INSERT INTO produtos (nome, quantidade, valor, categoria, unidade_medida) VALUES(?, ?, ?, ?, ?)',
    [nome, quantidade, valor, categoria, unidade_medida],
    (err, results) => {
        if (err) {
            res.status(500).json({
                erro: "Erro ao inserir produtos", detalhes: err });
 } else {
                res.status(201).json({
                    message: "produto inserido com sucesso", id: results.insertId });
 }
 }
            );
        });
produtoRouter.get('/total-categoria', (req, res) => {
    const querySQL = `
 SELECT categoria, 
 SUM(quantidade * valor) AS valor_total_estoq
ue 
 FROM produtos 
 GROUP BY categoria
 `;
    db.query(querySQL, (err, results) => {
        if (err) {
            res.status(500).json({
                error: "Erro ao gerar reatório por categoria", detalhes: err });
 } else {
                res.status(200).json(results);
            }
 });
});
produtoRouter.get('/status-limites', (req, res) => {

    const querySQL = `
 SELECT id ,
 nome,
 quantidade,
 (quantidade / 100) * 100 AS percentual_ating
ido,
 CASE 
VS CODE 6
 WHEN quantidade <= 0 THEN 'CRÍTICO: Limi
te Mínimo Atingido (Zerado)'
 WHEN quantidade >= 100 THEN 'ALERTA: Lim
ite Máximo Atingido (Lotado)'
 ELSE 'Estoque Regular'
 END AS status_estoque
 FROM produtos 
 `;
    db.query(querySQL, (err, results) => {
        if (err) {
            res.status(500).json({
                error: "Erro ao gerar relatório de limites", detalhes: err });
 } else {
                res.status(200).json(results);
            }
 });
})
produtoRouter.get('/relatorio-periodo', (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
        return res.status(400).json({
            error: "As datas inicial(dataInicio) e final(dataFim) são obrigatórias!" });
 }
 const querySQL = `
 SELECT 
 p.nome AS nome_produto,
 p.unidade_medida,
 COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN
m.quantidade ELSE 0 END), 0) AS total_entradas,
 COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN m.
quantidade ELSE 0 END), 0) AS total_saidas,
 (COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN
m.quantidade ELSE 0 END), 0) - 
 COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN
VS CODE 7
m.quantidade ELSE 0 END), 0)) AS saldo_no_periodo,
 COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN
m.quantidade * p.valor ELSE 0 END), 0) AS valor_financeiro_
entradas,
 COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN m.
quantidade * p.valor ELSE 0 END), 0) AS valor_financeiro_sa
idas
 FROM produtos p
 LEFT JOIN movimentacoes m ON p.id = m.id_produtos 
 AND m.data_movimentacoes BETWEEN ? AND ?
 GROUP BY p.id, p.nome
 `;
        db.query(querySQL, [dataInicio, dataFim], (err, results) => {
            if (err) {
                res.status(500).json({
                    error: "Erro ao gerar relatório por período", detalhes: err });
 } else {
                    res.status(200).json(results);
                }
 });
    })
produtoRouter.get('/maior-saida', (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
        return res.status(400).json({
            error: "As datas inicial e final são obrigatórias!"
 });
    }
    const querySQL = `
 SELECT
 p.nome AS nome_produto,
 SUM(m.quantidade) AS quantidade_total_saida,
VS CODE 8
 SUM(m.quantidade * p.valor) AS valor_total_fina
nceiro_saidas
 FROM produtos p
 INNER JOIN movimentacoes m
 ON p.id = m.id_produtos
 WHERE m.tipo = 'saida'
 AND m.data_movimentacoes BETWEEN ? AND ?
 GROUP BY p.id, p.nome
 ORDER BY quantidade_total_saida DESC
 `;
    db.query(querySQL, [dataInicio, dataFim], (err, results) => {
        if (err) {
            res.status(500).json({
                error: "Erro ao gerar relatório",
                detalhes: err
            });
        } else {
            res.status(200).json(results);
        }
    });
});
module.exports = produtoRouter;