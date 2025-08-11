-- Instruções SQL para inserir um novo cliente "Lucas" na tabela de clientes e um novo pedido para Lucas com valor 250.00 e data atual.

-- Inserir cliente "Lucas"
INSERT INTO clientes (nome, cidade) VALUES ('Lucas', 'Antonina');

-- Inserir novo pedido para Lucas
INSERT INTO pedidos (cliente_id, valor, data) VALUES ((SELECT id FROM clientes WHERE nome = 'Lucas'), 250.00, CURRENT_DATE);