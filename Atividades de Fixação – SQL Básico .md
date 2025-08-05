# 📘 Atividades de Fixação – SQL Básico e Intermediário

**Disciplina:** Administração de Banco de Dados II
**Professor:** Luiz Efigênio
**Instituto Superior do Litoral do Paraná – ISULPAR**

---

## 📌 Objetivo

Este conjunto de atividades tem como finalidade **reforçar os conceitos essenciais de SQL**, incluindo:

- Consultas com filtros (`SELECT`, `WHERE`)
- Junções entre tabelas (`JOIN`)
- Agregações (`GROUP BY`, `HAVING`)
- Manipulação de dados (`INSERT`, `UPDATE`, `DELETE`)
- Criação e alteração de estruturas (`CREATE`, `ALTER`)
- Criação de views

---

## 🧠 Tabelas Utilizadas

### 🧾 clientes

| id  | nome   | cidade    |
| --- | ------ | --------- |
| 1   | João   | Paranaguá |
| 2   | Maria  | Curitiba  |
| 3   | Carlos | Matinhos  |
| 4   | Ana    | Paranaguá |
| 5   | Pedro  | Guaratuba |

### 🧾 pedidos

| id  | cliente_id | valor  | data       |
| --- | ---------- | ------ | ---------- |
| 1   | 1          | 150.00 | 2023-01-15 |
| 2   | 1          | 90.00  | 2023-02-10 |
| 3   | 2          | 300.00 | 2023-03-05 |
| 4   | 3          | 50.00  | 2023-04-12 |
| 5   | 4          | 200.00 | 2023-05-20 |
| 6   | 1          | 120.00 | 2023-06-01 |
| 7   | 5          | 80.00  | 2023-07-18 |

---

## ✅ Atividades Propostas

### 🔹 1. Consultas com Filtros

- [ ] 1. Listar pedidos com valor maior que 100.
- [ ] 2. Listar clientes da cidade “Paranaguá”.
- [ ] 3. Listar pedidos com valor entre 100 e 200.
- [ ] 4. Listar pedidos feitos entre ‘2023-01-01’ e ‘2023-12-31’.

### 🔹 2. Junções

- [ ] 5. Nome do cliente e valor do pedido.
- [ ] 6. Todos os clientes, mesmo os que não têm pedidos.

### 🔹 3. Agregações

- [ ] 7. Total de pedidos por cliente.
- [ ] 8. Valor médio dos pedidos.
- [ ] 9. Clientes com mais de 2 pedidos.

### 🔹 4. Inserção de Dados

- [ ] 10. Inserir cliente “Lucas”, cidade “Antonina”.
- [ ] 11. Novo pedido para Lucas com valor 250.00 e data atual.

### 🔹 5. Atualização de Dados

- [ ] 12. Atualizar nome do cliente ID 5 para “Pedro Henrique”.
- [ ] 13. Aumentar 10% no valor dos pedidos acima de R$ 100,00.

### 🔹 6. Exclusão de Dados

- [ ] 14. Excluir pedidos com valor menor que 100.
- [ ] 15. Excluir cliente “Carlos”.

### 🔹 7. Criação e Alteração de Estruturas

- [ ] 16. Criar tabela `produtos` com id, nome e preço.
- [ ] 17. Adicionar campo `email` à tabela `clientes`.

### 🔹 8. Criação de View

- [ ] 18. Criar view `vw_total_pedidos` com total de pedidos por cliente.

---

## 📅 Entrega

- Entregar as atividades resolvidas via ambiente virtual ou conforme instrução do professor.
- Arquivo recomendado: `.sql`, `.txt`, ou capturas de tela.

---

## 🧑‍💻 Autor

**Prof. Luiz Efigênio**
[GitHub](https://github.com/efigenioluiz) | [LinkedIn](https://linkedin.com/in/efigenioluiztads)

---

## 📚 Referências

- MACHADO, Felipe Nery Rodrigues. _Banco de dados: projeto e implementação_. Saraiva, 2020.
- SANTOS, Marcela Gonçalves dos. _Algoritmos e programação_. SAGAH, 2017.
- WAZLAWICK, Raul. _Introdução a algoritmos e programação com Python_. LTC, 2017.
