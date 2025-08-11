CREATE VIEW vw_total_pedidos AS
SELECT c.nome, SUM(p.valor) AS total_pedidos
FROM clientes c
JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.nome;