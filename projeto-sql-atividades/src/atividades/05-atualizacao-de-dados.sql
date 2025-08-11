-- Atualizar o nome do cliente com ID 5 para "Pedro Henrique"
UPDATE clientes
SET nome = 'Pedro Henrique'
WHERE id = 5;

-- Aumentar 10% no valor dos pedidos acima de R$ 100,00
UPDATE pedidos
SET valor = valor * 1.10
WHERE valor > 100;