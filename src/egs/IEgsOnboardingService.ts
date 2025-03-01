// src/egs/IEgsOnboardingService.ts
export interface IEgsOnboardingService {
    /**
     * Performs the onboarding process by generating keys/CSR,
     * signing the CSR, and submitting it with the OTP.
     * Returns the CSID upon successful onboarding.
     *
     * @param otp - One Time Password provided by the user
     * @returns Promise resolving to the CSID (string)
     */
    onboard(otp: string): Promise<string>;
}
