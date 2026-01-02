const { Schema, model } = require("mongoose");

const petSchema = new Schema({
    petName: {type: String, required: true},
    petAge: {type: Number, required: true},
    petSpecies: {type: String, required: true},
    petPicture: { type: String },
    owner:{type: Schema.Types.ObjectId, ref: "user"}    
})

const PetModel = model("Pet", petSchema)
module.exports = PetModel;