import type { PreSignUpTriggerHandler } from "aws-lambda";

export const handler: PreSignUpTriggerHandler = async (event) => {
  // Auto-confirm the user without requiring verification code
  event.response.autoConfirmUser = true;

  // Auto-verify the email address
  event.response.autoVerifyEmail = true;

  return event;
};
