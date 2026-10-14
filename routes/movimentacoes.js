const express = require('express');
const movimentacoesRouter = express.Router();
const db = require('../mysql');
movimentacoesRouter.get('/', (req, res) => {

    db.query('SELECT * FROM movimentacoes', (err, results)=> {
        if (err) {
            res.status(500).json({
                error: "erro ao bsucar movimentacoes"})
 } else {
                res.json(results);
            }
 })
});
movimentacoesRouter.post('/', (req, res) => {
    const { tipo, quantidade, id_produtos } = req.body;

    const data_movimentacoes = new Date().toISOString().spl
    it('T')[0];
    db.query(
        'INSERT INTO movimentacoes (data_movimentacoes, tipo, quantidade, id_produtos) VALUES(?, ?, ?, ?)',
    [data_movimentacoes, tipo, quantidade, id_produtos],
    (err, results) => {
        if (err) {
            res.status(500).json({
                error: "Erro ao registrar movimentação", detalhes: err });
 } else {
                res.status(201).json({
                    message: "Movimentação registrada com sucesso!", id: results.insertId });
 }
 }
            );
})
movimentacoesRouter.get('/saidas', (req, res) => {


    const querySQL = `
 SELECT * FROM movimentacoes 
 WHERE tipo = 'saida' 
 ORDER BY data_movimentacoes DESC
 `;
    db.query(querySQL, (err, results) => {
        if (err) {
            res.status(500).json({
                error: "Erro ao buscar saídas de produtos", detalhes: err });
 } else {
                res.status(200).json(results);
            }
 });
});
module.exports = movimentacoesRouter