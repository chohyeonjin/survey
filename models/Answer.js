var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  qId : {type : String, required : true},
  ansBy: {type: String, required: true, trim: true},
  ansRes: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Answer = mongoose.model('Answer', schema);

module.exports = Answer;
