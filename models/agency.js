const mongoose = require('mongoose')

const Agency = new mongoose.Schema({
    AgencyId: {
        type: String,
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Address1: {
        type: String,
        required: true
    },
    Address2: {
        type: String,
    },
    State: {
        type: String,
        required: true
    },
    City: {
        type: String,
        required: true
    },
    PhoneNumber: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Agency', Agency)