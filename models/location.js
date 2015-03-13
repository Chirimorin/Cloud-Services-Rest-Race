/*
Id
Naam
beschrijving
lat
long
 */

function init(mongoose){

    var locationSchema = new mongoose.Schema({
        _id: { type: String, required: true, unique: true, lowercase: true },
        name: { type: String, required: true },
        description: { type: String, required: false },
        lat: { type: Number, required: true },
        long: { type: Number, required: true },
        distance: { type: Number, required: true }
    });

    mongoose.model('Location', locationSchema);
}

module.exports = init;