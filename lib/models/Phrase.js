import mongoose from 'mongoose';

const phraseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Phrase text is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Phrase cannot exceed 100 characters']
  },
  themes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme'
  }],
  category: {
    type: String,
    enum: ['general', 'steps', 'sponsorship', 'gratitude', 'service', 'newcomer', 'oldtimer'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  flagReason: {
    type: String,
    maxlength: 500
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    text: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    version: Number
  }]
}, {
  timestamps: true
});

phraseSchema.index({ text: 'text' });
phraseSchema.index({ category: 1 });
phraseSchema.index({ status: 1 });
phraseSchema.index({ themes: 1 });

phraseSchema.pre('save', function(next) {
  if (this.isModified('text') && !this.isNew) {
    this.history.push({
      text: this._original?.text || '',
      modifiedBy: this.modifiedBy,
      version: this.version
    });
    this.version += 1;
  }
  next();
});

const Phrase = mongoose.models.Phrase || mongoose.model('Phrase', phraseSchema);

export default Phrase;