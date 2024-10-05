import mongoose from 'mongoose';

const otpSchema = mongoose.Schema(
    {
      email: { type: String, required: true },
      otp: { type: String, required: true },
      otpExpires: { type: Date, required: true },
    },
    { timestamps: true }
  );

  const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
