CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  categoria VARCHAR(100),
  quantidade INT NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidade_medida VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  quantidade INT NOT NULL,
  observacao VARCHAR(255),
  data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE OR REPLACE VIEW vw_estoque AS
SELECT
  id, nome, categoria, quantidade, valor_unitario, unidade_medida,
  quantidade * valor_unitario AS valor_total
FROM produtos;