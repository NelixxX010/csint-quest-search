import ReCAPTCHA from 'react-google-recaptcha';
import { useState } from 'react';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
}

export function ReCaptcha({ onVerify, onError }: ReCaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Site key will be loaded from environment
  const siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key for now

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={onVerify}
        onErrored={onError}
        onLoad={() => setIsLoaded(true)}
        theme="light"
        size="normal"
      />
    </div>
  );
}