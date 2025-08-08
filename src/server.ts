import cookie from "@fastify/cookie";
import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(cookie);

app.register(transactionsRoutes, {
  prefix: "transactions",
});

// app.get("/hello", async () => {
// const tables = await knex("sqlite_schema").select("*");
// return tables;

// const transaction = await knex("transactions")
//   .insert({
//     id: crypto.randomUUID(),
//     title: "Transação de teste",
//     amount: 1000,
//   })
//   .returning("*");

//   const transactions = await knex("transactions")
//     .where("amount", 1000)
//     .select("*");

//   return transactions;
// });

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("Servidor iniciado...");
  });
