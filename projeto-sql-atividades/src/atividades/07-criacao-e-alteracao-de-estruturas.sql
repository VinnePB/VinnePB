-- Criação da tabela produtos
CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL
);

-- Adição do campo email à tabela clientes
ALTER TABLE clientes
ADD COLUMN email VARCHAR(255);