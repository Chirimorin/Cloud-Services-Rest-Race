function init(mongoose){

	var userSchema = new mongoose.Schema({
		username: { type: String, required: true }
		password: { type: String, required: true }
		races: [{ type : ObjectId, ref: 'Race' }]
	});
	
	mongoose.model('User', userSchema);
}

module.exports = init;