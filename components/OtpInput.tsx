'use client';

import { OTPInput, SlotProps } from 'input-otp';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OtpInput({ value, onChange }: OtpInputProps) {
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={onChange}
      inputMode="numeric"
      pattern="[0-9]*"
      render={({ slots }) => (
        <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
          {slots.map((slot, index) => (
            <OtpSlot key={index} {...slot} />
          ))}
        </div>
      )}
    />
  );
}

function OtpSlot(props: SlotProps) {
  return (
    <div
      style={{
        width: '42px',
        height: '48px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
      }}
    >
      {props.char}
      {props.hasFakeCaret && <span>|</span>}
    </div>
  );
}