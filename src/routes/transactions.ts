import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

// Cookies <--> Formas da gente manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select();
    return { transactions };
    // return reply.status(200).send(transactions);
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions").where("id", id).first();

    return { transaction };
  });

  app.get("/summary", async () => {
    const summary = await knex("transactions")
      .sum("amount", {
        as: "amount",
      })
      .first();

    return { summary };
  });

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/", // qualquer rota tem acesso ao cookie
        // maxAge: 1000 * 60 * 60 * 24 * 7 // 1000 milisegundos (1seg) | 60 segundos (1min) | 60 minutos (1hora) | 24 horas (1dia) | 7 dias (1semana)
        maxAge: 60 * 60 * 24 * 7 // 60 segundos (1min) | 60 minutos (1hora) | 24 horas (1dia) | 7 dias (1semana)
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
