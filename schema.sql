-- =====================================================
-- schema.sql - EstoquePro
-- Nomes de tabelas e colunas conforme routes/produtos.js
-- e routes/movimentacoes.js
--
-- ATENCAO: este script APAGA e recria as tabelas.
-- Use somente se o banco ainda nao tem dados importantes.
-- (Nao ha CREATE DATABASE/USE: rode dentro do banco do Railway.)
-- =====================================================

-- Ordem de remocao respeita a chave estrangeira
DROP VIEW IF EXISTS vw_estoque;
DROP TABLE IF EXISTS movimentacoes;
DROP TABLE IF EXISTS produtos;

-- -----------------------------------------------------
-- Tabela: produtos
-- INSERT da rota: (nome, quantidade, valor, categoria, unidade_medida)
-- -----------------------------------------------------
CREATE TABLE produtos (
    id             INT            NOT NULL AUTO_INCREMENT,
    nome           VARCHAR(100)   NOT NULL,
    quantidade     INT            NOT NULL DEFAULT 0,
    valor          DECIMAL(10,2)  NOT NULL,
    categoria      VARCHAR(50)    NOT NULL,
    unidade_medida VARCHAR(20)    NOT NULL,
    PRIMARY KEY (id)
);

-- -----------------------------------------------------
-- Tabela: movimentacoes
-- INSERT da rota: (data_movimentacoes, tipo, quantidade, id_produtos)
-- -----------------------------------------------------
CREATE TABLE movimentacoes (
    id                 INT                       NOT NULL AUTO_INCREMENT,
    data_movimentacoes DATE                      NOT NULL,
    tipo               ENUM('entrada', 'saida')  NOT NULL,
    quantidade         INT                       NOT NULL,
    id_produtos        INT                       NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_movimentacoes_produto (id_produtos),
    INDEX idx_movimentacoes_data (data_movimentacoes),
    CONSTRAINT fk_movimentacoes_produtos
        FOREIGN KEY (id_produtos) REFERENCES produtos (id)
);

-- -----------------------------------------------------
-- View: vw_estoque  (usada por GET /produtos/vw_estoque)
-- As colunas abaixo sao uma suposicao: ajuste para as que
-- o front espera, se a sua view anterior era diferente.
-- -----------------------------------------------------
CREATE VIEW vw_estoque AS
SELECT
    p.id,
    p.nome,
    p.categoria,
    p.unidade_medida,
    p.quantidade,
    p.valor,
    (p.quantidade * p.valor) AS valor_total
FROM produtos p;