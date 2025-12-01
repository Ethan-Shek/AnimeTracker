const mongoose = require('mongoose');
const _ = require('underscore');

let DomoModel = {};

const setName = (name) => _.escape(name).trim();

const DomoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    age: {
        type: Number,
        min: 0,
        required: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

DomoSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    age: doc.age,
});

DomoSchema.statics.findByOwner = async (ownerId) => {
    const search = { owner: new mongoose.Types.ObjectId(ownerId) };
    const docs = await DomoModel.find(search).select('name age').lean();
    return docs;
};

DomoModel = mongoose.model('Domo', DomoSchema);

module.exports = DomoModel;
