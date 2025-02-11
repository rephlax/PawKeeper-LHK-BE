const mongoose = require('mongoose');

const locationPinSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: {
                latitude: {
                    type: Number,
                    required: true
                },
                longitude: {
                    type: Number,
                    required: true
                }
            },
            required: true
        }
    },
    serviceRadius: {
        type: Number,
        default: 10,
        min: 1,
        max: 50
    },
    services: [{
        type: String,
        enum: [
            'Dog Walking', 
            'Cat Sitting', 
            'Pet Boarding', 
            'Pet Grooming', 
            'Reptile Care', 
            'Bird Sitting'
        ]
    }],
    availability: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Weekends Only'],
        default: 'Part Time'
    },
    hourlyRate: {
        type: Number,
        min: 0
    }
}, { 
    timestamps: true 
});

locationPinSchema.index({ 
    'location.coordinates': '2dsphere' 
});

module.exports = mongoose.model('LocationPin', locationPinSchema);