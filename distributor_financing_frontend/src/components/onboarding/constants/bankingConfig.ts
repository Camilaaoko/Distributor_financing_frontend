export const BANKING_VALIDATION_MESSAGES = {
  noSelection: 'Please select whether you have an existing bank account with us.',
  existingAccountRequired: 'Please enter the account number.',
  consentRequired: 'Please provide consent to create a new bank account before continuing.',
};

export const BANKING_OPTION_LABELS = {
  yes: {
    title: 'Yes, I have an existing account',
    description: 'I already have a bank account with us and would like to use it for financing disbursements.',
  },
  no: {
    title: 'No, I need a new account',
    description: "I don't currently have an account with us and would like to provide consent for a new account to be created for financing disbursements.",
  },
};

export const BANKING_CONSENT_TEXT = 'I consent to the creation of a bank account for the purpose of receiving financing disbursements and managing this application.';

export const BANKING_INFO_TEXT = {
  yes: 'I already have a bank account with us and would like to use it for financing disbursements.',
  no: "I don't currently have an account with us and would like to provide consent for a new account to be created for financing disbursements.",
};

export const ACCOUNT_NUMBER_HINT = 'Enter the account number you would like to use for financing disbursements.';

export const NEW_ACCOUNT_INFO = 'We can assist you with opening a bank account for financing disbursements.';

export const CONSENT_DISCLAIMER = 'Providing consent does not mean that an account has been created.';