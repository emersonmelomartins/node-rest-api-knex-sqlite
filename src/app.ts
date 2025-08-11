import cookie from "@fastify/cookie";
import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions";

export const app = fastify();

app.register(cookie);

// Hook global para todas as rotas
app.addHook("preHandler", async (request) => {
  console.log(`[${request.method}] ${request.url}`);
});

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
