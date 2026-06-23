import crypto from 'crypto';

const generatedOtp = () => {
  // crypto.randomInt(min, max) generates a cryptographically secure random number.
  // min is inclusive (100000), max is exclusive (1000000, so the max returned is 999999).
  return crypto.randomInt(100000, 1000000);
};

export default generatedOtp;
