import { execSync } from "node:child_process";
import supertest from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { app } from "../src/app";

/**
 * Testes Unitários => Unidade da sua aplicação
 * Testes de Integração => Comunicação entre duas ou mais unidades
 * Testes e2e (End to End) => Simulam um usuário operando a nossa aplicação
 *
 * Front-end => Abre a página, digita o text xpto, clique no botão
 * Back-end => Chamadas HTTPS, WebSockets, Etc...
 *
 * Pirâmide de testes => E2E (Não dependem de nenhuma tecnologia, não dependem de arquitetura)
 */

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // execSync => Executa comandos no terminal
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  // Todo teste deve excluir o contexto, não pode ter um teste dependendo do resultado de outro teste
  // Se caso tiver que utilizar dois testes, deve ser feito no mesmo contexto
  test("user can create a new transaction", async () => {
    await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  test("should be able to list all transactions", async () => {
    const createTransactionResponse = await supertest(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie") ?? [];

    const listTransactionsResponse = await supertest(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
        id: expect.any(String),
      }),
    ]);
  });
});
