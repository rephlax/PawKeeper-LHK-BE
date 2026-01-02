module.exports = {
    delete: {
      tags: ["Pet CRUD operations"], // operation's tag.
      description: "Deletes one Pet", // operation's description.
      operationId: "deletePet", // unique operation id.
      parameters: [
        {
          name: "petId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID of the pet to delete",
        },
      ],
  
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/PetModel",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Pet deleted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PetModel", // Response model
              },
            },
          },
        },
        404: {
          description: "Pet not found",
        },
      },
    },
  };
  