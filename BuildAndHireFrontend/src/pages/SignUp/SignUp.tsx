import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '.././AuthLayout/AuthLayout';
import styles from './SignUp.module.css';
import {
  AccountStatus,
  AccountType,
  type SignUpRole,
  type SignUpStep,
  type FormErrors,
  type CustomerFormValues,
  type CompanyFormValues,
  type AddressFormValues,
  type CustomerSignUpPayload,
  type CompanySignUpPayload,
} from './SignUp.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_CUSTOMER: CustomerFormValues = {
  customerName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const INITIAL_COMPANY: CompanyFormValues = {
  companyName: '',
  companyEmail: '',
  password: '',
  confirmPassword: '',
  registrationNumber: '',
  taxNumber: '',
};

const INITIAL_ADDRESS: AddressFormValues = {
  streetAddress: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
};

function validateCustomer(values: CustomerFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.customerName.trim()) errors.customerName = 'Full name is required.';

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function validateCompany(values: CompanyFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.companyName.trim()) errors.companyName = 'Company name is required.';

  if (!values.companyEmail.trim()) {
    errors.companyEmail = 'Company email is required.';
  } else if (!EMAIL_PATTERN.test(values.companyEmail)) {
    errors.companyEmail = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.registrationNumber) {
    errors.registrationNumber = 'Registration number is required.';
  } else if (values.registrationNumber.length !== 10) {
    errors.registrationNumber = 'Registration number must be 10 digits.';
  }

  if (!values.taxNumber) {
    errors.taxNumber = 'Tax number is required.';
  } else if (values.taxNumber.length !== 10) {
    errors.taxNumber = 'Tax number must be 10 digits.';
  }

  return errors;
}

function validateAddress(values: AddressFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.streetAddress.trim()) errors.streetAddress = 'Street address is required.';
  if (!values.suburb.trim()) errors.suburb = 'Suburb is required.';
  if (!values.city.trim()) errors.city = 'City is required.';
  if (!values.province.trim()) errors.province = 'Province is required.';

  if (!values.postalCode) {
    errors.postalCode = 'Postal code is required.';
  } else if (values.postalCode.length !== 4) {
    errors.postalCode = 'Postal code is only 4 digits.';
  }

  return errors;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState<SignUpRole | null>(null);
  const [step, setStep] = useState<SignUpStep>('role');
  const [customerValues, setCustomerValues] = useState<CustomerFormValues>(INITIAL_CUSTOMER);
  const [companyValues, setCompanyValues] = useState<CompanyFormValues>(INITIAL_COMPANY);
  const [addressValues, setAddressValues] = useState<AddressFormValues>(INITIAL_ADDRESS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const resetAllValues = (): void => {
    setCustomerValues(INITIAL_CUSTOMER);
    setCompanyValues(INITIAL_COMPANY);
    setAddressValues(INITIAL_ADDRESS);
    setErrors({});
  };

  const handleSelectRole = (selectedRole: SignUpRole): void => {
    resetAllValues();
    setRole(selectedRole);
    setStep('details');
  };

  const handleChangeRole = (): void => {
    resetAllValues();
    setRole(null);
    setStep('role');
  };

  const handleCustomerChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setCustomerValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setCompanyValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyDigitsChange = (
    event: ChangeEvent<HTMLInputElement>,
    maxLength: number
  ): void => {
    const { name, value } = event.target;
    const digitsOnly = value.replace(/\D/g, '').slice(0, maxLength);
    setCompanyValues((prev) => ({ ...prev, [name]: digitsOnly }));
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setAddressValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 4);
    setAddressValues((prev) => ({ ...prev, postalCode: digitsOnly }));
  };

  const handleDetailsSubmit = (event: React.SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const validationErrors =
      role === 'customer' ? validateCustomer(customerValues) : validateCompany(companyValues);

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setStep('address');
    }
  };

  const handleAddressSubmit = async (event: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const validationErrors = validateAddress(addressValues);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const address = {
        streetAddress: addressValues.streetAddress,
        suburb: addressValues.suburb,
        city: addressValues.city,
        province: addressValues.province,
        postalCode: Number(addressValues.postalCode),
      };

      const payload: CustomerSignUpPayload | CompanySignUpPayload =
        role === 'customer'
          ? {
              customerName: customerValues.customerName,
              email: customerValues.email,
              password: customerValues.password,
              status: AccountStatus.Active,
              accountType: AccountType.Customer,
              address,
            }
          : {
              companyName: companyValues.companyName,
              companyEmail: companyValues.companyEmail,
              password: companyValues.password,
              status: AccountStatus.Pending,
              account: AccountType.Company,
              registrationNumber: companyValues.registrationNumber,
              taxNumber: companyValues.taxNumber,
              address,
            };

      // TODO: replace with the real API call, e.g.
      // await fetch('/api/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      console.log('Sign up payload:', payload);
      navigate('/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.card}>
        {step === 'role' && (
          <>
            <h2 className={styles.title}>Create Your Account</h2>
            <p className={styles.subtitle}>Tell us who you are to get started.</p>

            <div className={styles.roleGrid}>
              <button
                type="button"
                className={styles.roleCard}
                onClick={() => handleSelectRole('customer')}
              >
                <span className={styles.roleLabel}>Customer</span>
                <span className={styles.roleDescription}>Browse companies and see the work they can do for you.</span>
              </button>
              <button
                type="button"
                className={styles.roleCard}
                onClick={() => handleSelectRole('company')}
              >
                <span className={styles.roleLabel}>Company</span>
                <span className={styles.roleDescription}>Register a business account.</span>
              </button>
            </div>

            <p className={styles.footerText}>
              Already have an account?
              <Link to="/" className={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 'details' && role === 'customer' && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.title}>Customer Details</h2>
              <button type="button" className={styles.changeRoleButton} onClick={handleChangeRole}>
                Change role
              </button>
            </div>

            <form onSubmit={handleDetailsSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="customerName" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={customerValues.customerName}
                  onChange={handleCustomerChange}
                  className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
                />
                {errors.customerName && <p className={styles.errorText}>{errors.customerName}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={customerValues.email}
                  onChange={handleCustomerChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={customerValues.password}
                  onChange={handleCustomerChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={customerValues.confirmPassword}
                  onChange={handleCustomerChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                />
                {errors.confirmPassword && (
                  <p className={styles.errorText}>{errors.confirmPassword}</p>
                )}
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.submitButton}>
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'details' && role === 'company' && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.title}>Company Details</h2>
              <button type="button" className={styles.changeRoleButton} onClick={handleChangeRole}>
                Change role
              </button>
            </div>

            <form onSubmit={handleDetailsSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="companyName" className={styles.label}>
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyValues.companyName}
                  onChange={handleCompanyChange}
                  className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
                />
                {errors.companyName && <p className={styles.errorText}>{errors.companyName}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="companyEmail" className={styles.label}>
                  Company Email
                </label>
                <input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  value={companyValues.companyEmail}
                  onChange={handleCompanyChange}
                  className={`${styles.input} ${errors.companyEmail ? styles.inputError : ''}`}
                />
                {errors.companyEmail && <p className={styles.errorText}>{errors.companyEmail}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="companyPassword" className={styles.label}>
                  Password
                </label>
                <input
                  id="companyPassword"
                  name="password"
                  type="password"
                  value={companyValues.password}
                  onChange={handleCompanyChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
              </div>

              <div className={styles.field}>
                <label htmlFor="companyConfirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  id="companyConfirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={companyValues.confirmPassword}
                  onChange={handleCompanyChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                />
                {errors.confirmPassword && (
                  <p className={styles.errorText}>{errors.confirmPassword}</p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="registrationNumber" className={styles.label}>
                  Registration Number
                </label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  inputMode="numeric"
                  value={companyValues.registrationNumber}
                  onChange={(event) => handleCompanyDigitsChange(event, 10)}
                  className={`${styles.input} ${errors.registrationNumber ? styles.inputError : ''}`}
                />
                <p className={styles.hint}>Exactly 10 digits, numbers only.</p>
                {errors.registrationNumber && (
                  <p className={styles.errorText}>{errors.registrationNumber}</p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="taxNumber" className={styles.label}>
                  Tax Number
                </label>
                <input
                  id="taxNumber"
                  name="taxNumber"
                  type="text"
                  inputMode="numeric"
                  value={companyValues.taxNumber}
                  onChange={(event) => handleCompanyDigitsChange(event, 10)}
                  className={`${styles.input} ${errors.taxNumber ? styles.inputError : ''}`}
                />
                <p className={styles.hint}>Exactly 10 digits, numbers only.</p>
                {errors.taxNumber && <p className={styles.errorText}>{errors.taxNumber}</p>}
              </div>

              <div className={styles.buttonRow}>
                <button type="submit" className={styles.submitButton}>
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'address' && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.title}>Address Details</h2>
              <button type="button" className={styles.changeRoleButton} onClick={handleChangeRole}>
                Change role
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="streetAddress" className={styles.label}>
                  Street Address
                </label>
                <input
                  id="streetAddress"
                  name="streetAddress"
                  type="text"
                  value={addressValues.streetAddress}
                  onChange={handleAddressChange}
                  className={`${styles.input} ${errors.streetAddress ? styles.inputError : ''}`}
                />
                {errors.streetAddress && <p className={styles.errorText}>{errors.streetAddress}</p>}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="suburb" className={styles.label}>
                    Suburb
                  </label>
                  <input
                    id="suburb"
                    name="suburb"
                    type="text"
                    value={addressValues.suburb}
                    onChange={handleAddressChange}
                    className={`${styles.input} ${errors.suburb ? styles.inputError : ''}`}
                  />
                  {errors.suburb && <p className={styles.errorText}>{errors.suburb}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="city" className={styles.label}>
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={addressValues.city}
                    onChange={handleAddressChange}
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                  />
                  {errors.city && <p className={styles.errorText}>{errors.city}</p>}
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="province" className={styles.label}>
                    Province
                  </label>
                  <input
                    id="province"
                    name="province"
                    type="text"
                    value={addressValues.province}
                    onChange={handleAddressChange}
                    className={`${styles.input} ${errors.province ? styles.inputError : ''}`}
                  />
                  {errors.province && <p className={styles.errorText}>{errors.province}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="postalCode" className={styles.label}>
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    value={addressValues.postalCode}
                    onChange={handlePostalCodeChange}
                    className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`}
                  />
                  <p className={styles.hint}>Exactly 4 digits.</p>
                  {errors.postalCode && <p className={styles.errorText}>{errors.postalCode}</p>}
                </div>
              </div>

              <div className={styles.buttonRow}>
                <button type="button" className={styles.secondaryButton} onClick={() => setStep('details')}>
                  Back
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}