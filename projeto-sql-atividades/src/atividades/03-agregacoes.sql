-- 03-agregacoes.sql

-- 1. Total de pedidos por cliente
SELECT c.nome, COUNT(p.id) AS total_pedidos
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id;

-- 2. Valor médio dos pedidos
SELECT AVG(valor) AS valor_medio
FROM pedidos;

-- 3. Clientes com mais de 2 pedidos
SELECT c.nome
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id
HAVING COUNT(p.id) > 2;