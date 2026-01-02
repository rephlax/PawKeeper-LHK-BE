module.exports = {
    delete: {
        tags: ["User CRUD operations and Authentication"], // operation's tag.
        description: "Delete User", // operation's description.
        operationId: "deleteUser", // unique operation id.
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the user whose password is being changed"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserModel", // Request body schema for password change
              },
            },
          },
        },
        responses: {
          200: {
            description: "User Deleted Successfully",
          },
          400: {
            description: "Invalid request body",
          },
          404: {
            description: "User not found",
          },
        },
    }
}