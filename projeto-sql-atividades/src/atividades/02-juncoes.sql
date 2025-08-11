-- Consultar nome do cliente e valor do pedido
SELECT c.nome, p.valor
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id;

-- Listar todos os clientes, mesmo os que não têm pedidos
SELECT c.nome, p.valor
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id;