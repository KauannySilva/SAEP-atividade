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

    const qtd = Number(quantidade);
    const id = Number(id_produtos);
    const tipoMovimentacao = String(tipo || '').toLowerCase();

    if (
        !Number.isInteger(qtd) ||
        qtd <= 0 ||
        !Number.isInteger(id) ||
        id <= 0 ||
        !['entrada', 'saida'].includes(tipoMovimentacao)
    ) {
        return res.status(400).json({
            error: 'Informe um produto, uma quantidade positiva e o tipo entrada ou saida.'
        });
    }

    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({
                error: 'Erro ao iniciar a movimentação.'
            });
        }

        db.query(
            'SELECT quantidade FROM produtos WHERE id = ? FOR UPDATE',
            [id],
            (err, resultados) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            error: 'Erro ao consultar o estoque.'
                        });
                    });
                }

                if (resultados.length === 0) {
                    return db.rollback(() => {
                        res.status(404).json({
                            error: 'Produto não encontrado.'
                        });
                    });
                }

                const saldoAtual = Number(resultados[0].quantidade);

                if (
                    tipoMovimentacao === 'saida' &&
                    saldoAtual < qtd
                ) {
                    return db.rollback(() => {
                        res.status(400).json({
                            error: 'Estoque insuficiente para essa saída.'
                        });
                    });
                }

                const operador = tipoMovimentacao === 'entrada' ? '+' : '-';

                db.query(
                    `UPDATE produtos SET quantidade = quantidade ${operador} ? WHERE id = ?`,
                    [qtd, id],
                    err => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    error: 'Erro ao atualizar o estoque.'
                                });
                            });
                        }

                        const data = new Date().toISOString().split('T')[0];

                        db.query(
                            'INSERT INTO movimentacoes (data_movimentacoes, tipo, quantidade, id_produtos) VALUES (?, ?, ?, ?)',
                            [data, tipoMovimentacao, qtd, id],
                            (err, resultado) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            error: 'Erro ao registrar a movimentação.'
                                        });
                                    });
                                }

                                db.commit(err => {
                                    if (err) {
                                        return db.rollback(() => {
                                            res.status(500).json({
                                                error: 'Erro ao confirmar a movimentação.'
                                            });
                                        });
                                    }

                                    res.status(201).json({
                                        message: 'Movimentação registrada e estoque atualizado!',
                                        id: resultado.insertId
                                    });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

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