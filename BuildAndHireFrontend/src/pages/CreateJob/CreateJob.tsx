import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import JobsHeader from '../../components/JobsHeader/JobsHeader';

import { companies } from '../../data/companies';

import { PaymentMethod } from '../../types/enums';

import {
  getCurrentCustomerId,
  useCustomerJobs,
} from '../../context/CustomerJobsContext';

import styles from './CreateJob.module.css';

interface FormValues {
  companyId: string;
  jobDescription: string;
  startDate: string;
  endDate: string;
  payingMethod: string;

  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
}

interface FormErrors {
  companyId?: string;
  jobDescription?: string;
  startDate?: string;
  endDate?: string;
  payingMethod?: string;

  streetAddress?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;

  general?: string;
}

const INITIAL_VALUES: FormValues = {
  companyId: '',
  jobDescription: '',
  startDate: '',
  endDate: '',
  payingMethod: '',
  streetAddress: '',
  suburb: '',
  city: '',
  province: '',
  postalCode: '',
};

function calculateDays(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(
    `${startDate}T00:00:00`
  );

  const end = new Date(
    `${endDate}T00:00:00`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  if (end < start) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ) + 1
  );
}

export default function CreateJob() {
  const navigate = useNavigate();

  const { createJob } =
    useCustomerJobs();

  const [values, setValues] =
    useState<FormValues>(
      INITIAL_VALUES
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const daysWorking = useMemo(
    () =>
      calculateDays(
        values.startDate,
        values.endDate
      ),
    [
      values.startDate,
      values.endDate,
    ]
  );

  const activeCompanies =
    companies.filter(
      (company) =>
        company.status === 0
    );

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    /*
     * Company
     */
    if (!values.companyId) {
      nextErrors.companyId =
        'Please select a company.';
    }

    /*
     * Job description
     */
    const description =
      values.jobDescription.trim();

    if (!description) {
      nextErrors.jobDescription =
        'Job description is required.';
    } else if (description.length < 20) {
      nextErrors.jobDescription =
        'Job description must be at least 20 characters.';
    } else if (description.length > 5000) {
      nextErrors.jobDescription =
        'Job description cannot exceed 5000 characters.';
    }

    /*
     * Dates
     */
    if (!values.startDate) {
      nextErrors.startDate =
        'Start date is required.';
    }

    if (!values.endDate) {
      nextErrors.endDate =
        'End date is required.';
    }

    if (
      values.startDate &&
      values.endDate
    ) {
      const start = new Date(
        `${values.startDate}T00:00:00`
      );

      const end = new Date(
        `${values.endDate}T00:00:00`
      );

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime())
      ) {
        if (end < start) {
          nextErrors.endDate =
            'End date must be on or after the start date.';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
          nextErrors.startDate =
            'Start date cannot be in the past.';
        }
      }
    }

    /*
     * Payment method
     *
     * Optional for now because your backend model
     * allows PayingMethod to be null.
     */
    if (values.payingMethod) {
      const allowedMethods = [
        PaymentMethod.EFT,
        PaymentMethod.Cash,
        PaymentMethod.Payshap,
        PaymentMethod.Paypal,
        PaymentMethod.DebitOrCreditCard,
      ];

      const selectedMethod =
        Number(values.payingMethod);

      if (
        !allowedMethods.includes(
          selectedMethod as PaymentMethod
        )
      ) {
        nextErrors.payingMethod =
          'Please select a valid payment method.';
      }
    }

    /*
     * Address
     */
    if (!values.streetAddress.trim()) {
      nextErrors.streetAddress =
        'Street address is required.';
    } else if (
      values.streetAddress.trim().length < 5
    ) {
      nextErrors.streetAddress =
        'Please enter a valid street address.';
    }

    if (!values.suburb.trim()) {
      nextErrors.suburb =
        'Suburb is required.';
    }

    if (!values.city.trim()) {
      nextErrors.city =
        'City is required.';
    }

    if (!values.province.trim()) {
      nextErrors.province =
        'Province is required.';
    }

    /*
     * South African postal code:
     * exactly 4 digits.
     */
    if (!values.postalCode.trim()) {
      nextErrors.postalCode =
        'Postal code is required.';
    } else if (
      !/^\d{4}$/.test(
        values.postalCode.trim()
      )
    ) {
      nextErrors.postalCode =
        'Postal code must be exactly 4 digits.';
    }

    return nextErrors;
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    /*
     * Clear the error for the field being edited.
     */
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      general: undefined,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const company =
        activeCompanies.find(
          (entry) =>
            entry.id === values.companyId
        );

      if (!company) {
        setErrors({
          general:
            'The selected company could not be found.',
        });

        return;
      }

      const job = createJob({
        companyId:
          company.id,

        companyName:
          company.companyName,

        customerId:
          getCurrentCustomerId(),

        jobDescription:
          values.jobDescription.trim(),

        daysWorking,

        startDate:
          values.startDate,

        endDate:
          values.endDate,

        payingMethod:
          values.payingMethod
            ? (
                Number(
                  values.payingMethod
                ) as PaymentMethod
              )
            : null,

        address: {
          streetAddress:
            values.streetAddress.trim(),

          suburb:
            values.suburb.trim(),

          city:
            values.city.trim(),

          province:
            values.province.trim(),

          postalCode:
            Number(
              values.postalCode
            ),
        },
      });

      navigate(
        `/my-jobs/${job.jobId}`,
        {
          replace: true,
        }
      );
    } catch {
      setErrors({
        general:
          'Something went wrong while creating the job. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <JobsHeader activeLink="my-jobs" />

      <main className={styles.main}>
        <Link
          to="/my-jobs"
          className={styles.backLink}
        >
          ← Back to My Jobs
        </Link>

        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Customer
          </span>

          <h1 className={styles.title}>
            Post a Project
          </h1>

          <p className={styles.subtitle}>
            Tell a construction company what you
            need built.
          </p>
        </div>

        {errors.general && (
          <div
            className={styles.error}
            role="alert"
          >
            {errors.general}
          </div>
        )}

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>
                01
              </span>

              <div>
                <h2 className={styles.sectionTitle}>
                  Choose a Company
                </h2>

                <p className={styles.sectionText}>
                  Select the construction company
                  you want to receive your request.
                </p>
              </div>
            </div>

            <label className={styles.label}>
              Construction Company

              <select
                name="companyId"
                value={values.companyId}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.companyId
                    ? styles.inputError
                    : ''
                }`}
                aria-invalid={
                  Boolean(errors.companyId)
                }
                aria-describedby={
                  errors.companyId
                    ? 'company-error'
                    : undefined
                }
                disabled={isSubmitting}
              >
                <option value="">
                  Select a company
                </option>

                {activeCompanies.map(
                  (company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.companyName}
                    </option>
                  )
                )}
              </select>

              {errors.companyId && (
                <span
                  id="company-error"
                  className={styles.fieldError}
                >
                  {errors.companyId}
                </span>
              )}
            </label>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>
                02
              </span>

              <div>
                <h2 className={styles.sectionTitle}>
                  Project Details
                </h2>

                <p className={styles.sectionText}>
                  Describe exactly what you need
                  the company to do.
                </p>
              </div>
            </div>

            <label className={styles.label}>
              Job Description

              <textarea
                name="jobDescription"
                value={values.jobDescription}
                onChange={handleChange}
                className={`${styles.textarea} ${
                  errors.jobDescription
                    ? styles.inputError
                    : ''
                }`}
                placeholder="Describe the work required, materials, scope, and important requirements..."
                rows={7}
                maxLength={5000}
                aria-invalid={
                  Boolean(
                    errors.jobDescription
                  )
                }
                disabled={isSubmitting}
              />

              <span className={styles.characterCount}>
                {values.jobDescription.length}/5000
              </span>

              {errors.jobDescription && (
                <span className={styles.fieldError}>
                  {errors.jobDescription}
                </span>
              )}
            </label>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>
                03
              </span>

              <div>
                <h2 className={styles.sectionTitle}>
                  Schedule &amp; Payment
                </h2>
              </div>
            </div>

            <div className={styles.grid}>
              <label className={styles.label}>
                Start Date

                <input
                  type="date"
                  name="startDate"
                  value={values.startDate}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.startDate
                      ? styles.inputError
                      : ''
                  }`}
                  aria-invalid={
                    Boolean(errors.startDate)
                  }
                  disabled={isSubmitting}
                />

                {errors.startDate && (
                  <span className={styles.fieldError}>
                    {errors.startDate}
                  </span>
                )}
              </label>

              <label className={styles.label}>
                End Date

                <input
                  type="date"
                  name="endDate"
                  value={values.endDate}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.endDate
                      ? styles.inputError
                      : ''
                  }`}
                  aria-invalid={
                    Boolean(errors.endDate)
                  }
                  disabled={isSubmitting}
                />

                {errors.endDate && (
                  <span className={styles.fieldError}>
                    {errors.endDate}
                  </span>
                )}
              </label>
            </div>

            <div className={styles.calculated}>
              <span>Days Working</span>

              <strong>
                {daysWorking > 0
                  ? `${daysWorking} ${
                      daysWorking === 1
                        ? 'day'
                        : 'days'
                    }`
                  : 'Calculated from dates'}
              </strong>
            </div>

            <label className={styles.label}>
              Preferred Payment Method

              <select
                name="payingMethod"
                value={values.payingMethod}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.payingMethod
                    ? styles.inputError
                    : ''
                }`}
                disabled={isSubmitting}
              >
                <option value="">
                  Choose later
                </option>

                <option
                  value={PaymentMethod.EFT}
                >
                  EFT
                </option>

                <option
                  value={PaymentMethod.Cash}
                >
                  Cash
                </option>

                <option
                  value={PaymentMethod.Payshap}
                >
                  PayShap
                </option>

                <option
                  value={PaymentMethod.Paypal}
                >
                  PayPal
                </option>

                <option
                  value={
                    PaymentMethod.DebitOrCreditCard
                  }
                >
                  Credit / Debit Card
                </option>
              </select>

              {errors.payingMethod && (
                <span className={styles.fieldError}>
                  {errors.payingMethod}
                </span>
              )}
            </label>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>
                04
              </span>

              <div>
                <h2 className={styles.sectionTitle}>
                  Project Address
                </h2>

                <p className={styles.sectionText}>
                  Where will the work take place?
                </p>
              </div>
            </div>

            <label className={styles.label}>
              Street Address

              <input
                name="streetAddress"
                value={values.streetAddress}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.streetAddress
                    ? styles.inputError
                    : ''
                }`}
                placeholder="123 Main Street"
                disabled={isSubmitting}
              />

              {errors.streetAddress && (
                <span className={styles.fieldError}>
                  {errors.streetAddress}
                </span>
              )}
            </label>

            <div className={styles.grid}>
              <label className={styles.label}>
                Suburb

                <input
                  name="suburb"
                  value={values.suburb}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.suburb
                      ? styles.inputError
                      : ''
                  }`}
                  disabled={isSubmitting}
                />

                {errors.suburb && (
                  <span className={styles.fieldError}>
                    {errors.suburb}
                  </span>
                )}
              </label>

              <label className={styles.label}>
                City

                <input
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.city
                      ? styles.inputError
                      : ''
                  }`}
                  disabled={isSubmitting}
                />

                {errors.city && (
                  <span className={styles.fieldError}>
                    {errors.city}
                  </span>
                )}
              </label>

              <label className={styles.label}>
                Province

                <input
                  name="province"
                  value={values.province}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.province
                      ? styles.inputError
                      : ''
                  }`}
                  disabled={isSubmitting}
                />

                {errors.province && (
                  <span className={styles.fieldError}>
                    {errors.province}
                  </span>
                )}
              </label>

              <label className={styles.label}>
                Postal Code

                <input
                  name="postalCode"
                  value={values.postalCode}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.postalCode
                      ? styles.inputError
                      : ''
                  }`}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  disabled={isSubmitting}
                />

                {errors.postalCode && (
                  <span className={styles.fieldError}>
                    {errors.postalCode}
                  </span>
                )}
              </label>
            </div>
          </section>

          <div className={styles.submitRow}>
            <Link
              to="/my-jobs"
              className={styles.cancelButton}
            >
              Cancel
            </Link>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Creating Job…'
                : 'Create Job'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}