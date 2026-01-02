module.exports = {
    post: {
        tags: ["User CRUD operations and Authentication"], // operation's tag.
        description: "Login User", // operation's description.
        operationId: "loginUser", // unique operation id.
        parameters: [], // expected params.
        requestBody: {
          // expected request body
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserModel", // input data model
              },
            },
          },
        },
        // expected responses
        responses: {
          // response code
          400: {
              description: "Invalid credentials or request format",
          },
          401: {
              description: "Unauthorized - Incorrect email or password",
          },
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserModel", // Response model
                },
              },
            },
          },
        },
    }
}
