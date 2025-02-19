module.exports = {
    post: {
        tags: ["User CRUD operations and Authentication"], // operation's tag.
        description: "Signup New User", // operation's desc.
        operationId: "signupUser", // unique operation id.
        parameters: [], // expected params.
        requestBody: {
          // expected request body
          content: {
            // content-type
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserModel", // todo input data model
              },
            },
          },
        },
        // expected responses
        responses: {
          // response code
          400: {
              description: "Invalid request",
          },

          200: {
            description: "Operation sucessfull"
          },
  
          201: {
            description: "User Created successfully", // response desc.
            content: {
              // content-type
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserModel", // Todo model
                },
              },
            },
          },
        },
    }
}