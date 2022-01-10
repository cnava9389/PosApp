-- name: GetBusinesses :many
SELECT * FROM businesses;

--name: GetBusiness :one
SELECT * FROM businesses
WHERE id = $1 LIMIT 1;

--name: DeleteBusiness :exec
DELETE FROM businesses
WHERE id = $1;

--name: CreateBusiness :one
INSERT INTO businesses (businessname, code, email)
VALUES ($1, $2, $3) RETURNING *;

--name: GetUsers :many
SELECT * FROM users;

--name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

--name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

--name: CreateUser :one
INSERT INTO users (name, password, email, businessname, phone,
city, state, street, apt, ppic, auth) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

--name: GetOrders :many
SELECT * FROM orders;

--name: GetOrder :one
SELECT * FROM orders
WHERE id = $1 LIMIT 1;

--name: DeleteOrder :exec
DELETE FROM orders
WHERE id = $1;

--name: CreateOrder :one
INSERT INTO orders (credit, dateTime, description, employee, items, name,
paid, subTotal, tax, type, custom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

--name: GetItems :many
SELECT * FROM items;

--name: GetItem :one
SELECT * FROM items
WHERE id = $1 LIMIT 1;

--name: DeleteItem :exec
DELETE FROM items
WHERE id = $1;

--name: CreateItem :one
INSERT INTO items (name, price, type,) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;