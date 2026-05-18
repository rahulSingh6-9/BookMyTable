import mongoose from 'mongoose';

const onboardingDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStep: {
    type: Number,
    default: 0
  },
  completedSteps: {
    type: [Number],
    default: []
  },
  skippedSteps: {
    type: [Number],
    default: []
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  draftData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  uploadedMedia: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastSavedAt on every save
onboardingDraftSchema.pre('save', function(next) {
  this.lastSavedAt = new Date();
  next();
});

const OnboardingDraft = mongoose.model('OnboardingDraft', onboardingDraftSchema);

export default OnboardingDraft;
