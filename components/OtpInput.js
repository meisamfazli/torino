'use client';

import { OTPInput } from 'input-otp';

export default function OtpInput({ value, onChange }) {
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

function OtpSlot(props) {
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
