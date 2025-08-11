-- Criação da tabela clientes
CREATE TABLE clientes (
    id INT PRIMARY KEY,
    nome VARCHAR(100),
    cidade VARCHAR(100)
);

-- Inserção de dados na tabela clientes
INSERT INTO clientes (id, nome, cidade) VALUES
(1, 'João', 'Paranaguá'),
(2, 'Maria', 'Curitiba'),
(3, 'Carlos', 'Matinhos'),
(4, 'Ana', 'Paranaguá'),
(5, 'Pedro', 'Guaratuba');

-- Criação da tabela pedidos
CREATE TABLE pedidos (
    id INT PRIMARY KEY,
    cliente_id INT,
    valor DECIMAL(10, 2),
    data DATE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Inserção de dados na tabela pedidos
INSERT INTO pedidos (id, cliente_id, valor, data) VALUES
(1, 1, 150.00, '2023-01-15'),
(2, 1, 90.00, '2023-02-10'),
(3, 2, 300.00, '2023-03-05'),
(4, 3, 50.00, '2023-04-12'),
(5, 4, 200.00, '2023-05-20'),
(6, 1, 120.00, '2023-06-01'),
(7, 5, 80.00, '2023-07-18');