var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({

  title: {type: String, required: true, trim: true},
  content: {type: String, required: true, trim: true},

}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Question = mongoose.model('Question', schema);

module.exports = Question;
