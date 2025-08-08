import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

// Cookies <--> Formas da gente manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
  // cada plugin do fastify possui um contexto
  // toda regra criada aqui só será visivel nesse contexto

  // podemos adicionar um preHandler global no contexto com hooks
  // app.addHook("preHandler", async (request, reply) => {
  //   console.log(`[${request.method}] ${request.url}`);
  // });

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();
      return { transactions };
      // return reply.status(200).send(transactions);
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await knex("transactions")
        .where({
          id,
          session_id: sessionId,
        })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", {
          as: "amount",
        })
        .first();

      return { summary };
    }
  );

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
        maxAge: 60 * 60 * 24 * 7, // 60 segundos (1min) | 60 minutos (1hora) | 24 horas (1dia) | 7 dias (1semana)
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
