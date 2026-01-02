module.exports = {
  get: {
    tags: ["User CRUD operations and Authentication"], // operation's tag.
    description: "Verify User Details", // operation's description.
    operationId: "verifyUser", // unique operation id.
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: {
                type: "string",
                format: "email",
                description: "User's email address",
              },
              token: {
                type: "string",
                description: "Token to verify",
              },
            },
            required: ["email", "token"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "User successfully verified",
      },
      400: {
        description: "Invalid request data",
      },
      404: {
        description: "User not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  },
};
