import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../src/app";

describe("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // Todo teste deve excluir o contexto, não pode ter um teste dependendo do resultado de outro teste
  // Se caso tiver que utilizar dois testes, deve ser feito no mesmo contexto
  test("user can create a new transaction", async () => {
    const response = await supertest(app.server)
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
