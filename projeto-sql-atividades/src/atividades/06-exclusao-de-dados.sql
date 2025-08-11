-- Excluir pedidos com valor menor que 100
DELETE FROM pedidos
WHERE valor < 100;

-- Excluir cliente "Carlos"
DELETE FROM clientes
WHERE nome = 'Carlos';