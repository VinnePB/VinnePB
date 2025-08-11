-- Consultas SQL para listar pedidos com valor maior que 100
SELECT * FROM pedidos WHERE valor > 100;

-- Consultas SQL para listar clientes da cidade "Paranaguá"
SELECT * FROM clientes WHERE cidade = 'Paranaguá';

-- Consultas SQL para listar pedidos com valor entre 100 e 200
SELECT * FROM pedidos WHERE valor BETWEEN 100 AND 200;

-- Consultas SQL para listar pedidos feitos entre '2023-01-01' e '2023-12-31'
SELECT * FROM pedidos WHERE data BETWEEN '2023-01-01' AND '2023-12-31';