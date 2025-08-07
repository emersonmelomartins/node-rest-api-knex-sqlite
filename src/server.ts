import fastify from "fastify";
import { knex } from "./database";

const app = fastify();

app.get("/hello", async () => {
  // const tables = await knex("sqlite_schema").select("*");
  // return tables;

  // const transaction = await knex("transactions")
  //   .insert({
  //     id: crypto.randomUUID(),
  //     title: "Transação de teste",
  //     amount: 1000,
  //   })
  //   .returning("*");

  const transactions = await knex("transactions")
    .where("amount", 1000)
    .select("*");

  return transactions;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Servidor iniciado...");
  });
