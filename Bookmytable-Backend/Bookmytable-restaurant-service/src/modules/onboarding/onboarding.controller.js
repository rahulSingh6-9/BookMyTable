import * as onboardingService from './onboarding.services.js';

export const saveDraft = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context missing'
      });
    }

    const { currentStep, formData, completedSteps, skippedSteps, draftData, uploadedMedia } = req.body;
    
    const draft = await onboardingService.saveDraft(userId, { 
      currentStep, 
      formData, 
      completedSteps, 
      skippedSteps, 
      draftData, 
      uploadedMedia 
    });
    
    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: draft
    });
  } catch (error) {
    next(error);
  }
};

export const getDraft = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context missing'
      });
    }

    const draft = await onboardingService.getDraft(userId);
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'No onboarding draft found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: draft
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDraft = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context missing'
      });
    }

    await onboardingService.deleteDraft(userId);
    
    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const submitOnboarding = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    console.log("🚀 Submit onboarding started");

    console.log("👤 User:", req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context missing'
      });
    }

    const restaurant = await onboardingService.submitOnboarding(userId, req.body, req.ip);
    console.log(
      "📦 Request Body:",
      JSON.stringify(req.body, null, 2)
    );

    console.log("✅ Submit completed");
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully and queued for review.',
      data: restaurant
    });
  } catch (error) {

    console.error("❌ SUBMIT ERROR:");
    console.error(error);

    console.error("❌ ERROR MESSAGE:", error.message);

    console.error("❌ ERROR STACK:", error.stack);

    res.status(400).json({
      success: false,
      message: error.message || 'Onboarding submission failed.'
    });
  }
};
