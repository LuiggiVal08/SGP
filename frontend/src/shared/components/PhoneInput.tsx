import PhoneInput, { getCountryCallingCode } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputFieldProps {
  value?: string;
  onChange: (value?: string) => void;
  error?: string;
  placeholder?: string;
  id?: string;
}

export function PhoneInputField({ value, onChange, error, placeholder = '+01 234 567 890', id }: PhoneInputFieldProps) {
  return (
    <div>
      <PhoneInput
        id={id}
        value={value}
        onChange={onChange}
        defaultCountry="VE"
        international
        placeholder={placeholder}
        className="phone-input-custom"
        onCountryChange={(country) => {
          if (country && !value) {
            onChange(`+${getCountryCallingCode(country)}`);
          }
        }}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
