import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Theme name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#3f51b5',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
  },
  icon: {
    type: String,
    default: 'category'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  phraseCount: {
    type: Number,
    default: 0
  },
  minPhrases: {
    type: Number,
    default: 25,
    min: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

themeSchema.index({ name: 'text' });
themeSchema.index({ isActive: 1 });
themeSchema.index({ priority: -1 });

themeSchema.methods.updatePhraseCount = async function() {
  const Phrase = mongoose.model('Phrase');
  const count = await Phrase.countDocuments({ 
    themes: this._id,
    status: 'approved',
    isActive: true 
  });
  this.phraseCount = count;
  await this.save();
};

const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);

export default Theme;