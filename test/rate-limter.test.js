const axios = require("axios");

const baseURL = "http://localhost:3000";

describe("Rate Limit Test", () => {
  test("Allow first 15 requests", async () => {
    const requests = Array.from({ length: 15 }, () =>
      axios.post(`http://localhost:3000/v1/users/login/`)
    );

    const responses = await Promise.all(requests);
    responses.forEach((response) => {
      expect(response.status).toBe(400);
      expect(response.data.message).toBe("Success");
    });
  });

  test("Throw 429 after 15 requests", async () => {
    const response = await axios.post(`${baseURL}/v1/users/login`);

    expect(response.status).toBe(429);
    expect(response.data.message).toBe(
      "Too many requests, please try again later."
    );
  });
});
