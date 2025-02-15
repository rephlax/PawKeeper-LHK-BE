module.exports = {
    patch: {
      tags: ["Pet CRUD operations"], // operation's tag.
      description: "Updates one Pet", // operation's description.
      operationId: "updatePet", // unique operation id.
      parameters: [
        {
          name: "petId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "ID of the pet to update",
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
          description: "Pet updated successfully",
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
  