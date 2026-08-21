import { useParams, Link } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { companies } from '../../data/companies';

import { getAccountStatusLabel, getAccountTypeLabel } from '../../utils/accountLabels';
import styles from './CompanyProfile.module.css';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const company = companies.find((entry) => entry.id === id);

  if (!company) {
    return (
      <div className={styles.page}>
        <DashboardHeader activeLink="marketplace" />
        <main className={styles.notFound}>
          <p>Company not found.</p>
          <Link to="/marketplace" className={styles.backLink}>
            Back to Marketplace
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <DashboardHeader activeLink="projects" />

      <section
        className={styles.hero}
        style={{ backgroundImage: `linear-gradient(180deg, rgba(84,58,50,0.55), rgba(84,58,50,0.65)), url(${company.imageUrl})` }}
      >
        <h1 className={styles.heroTitle}>{company.companyName}</h1>
        <p className={styles.heroSubtitle}>{company.about}</p>
        <div className={styles.heroButtons}>
          <button type="button" className={styles.primaryButton}>
            Request Quote
          </button>
          <a href={`mailto:${company.companyEmail}`} className={styles.secondaryButton}>
            View Portfolio
          </a>
        </div>
      </section>

      <section className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Specialties</h2>
          <div className={styles.tagList}>
            {company.services.map((service) => (
              <span key={service} className={styles.tag}>
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Experience</h2>
          <p className={styles.infoText}>
            Category: <strong>{company.category}</strong>
          </p>
          <p className={styles.projectsCount}>
            {company.completedProjects}+
            <span className={styles.projectsLabel}>Completed Projects</span>
          </p>
        </div>

        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Certifications</h2>
          <ul className={styles.certList}>
            {company.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div>
          <h2 className={styles.contactTitle}>Company Info</h2>
          <p className={styles.contactSubtitle}>
            Ready to discuss your next landmark project? Our estimators are standing by.
          </p>

          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Email Us</span>
            <span>{company.companyEmail}</span>
          </div>
          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Call Us</span>
            <span>{company.phone}</span>
          </div>
          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Location</span>
            <span>
              {company.address.streetAddress}, {company.address.suburb}, {company.address.city},{' '}
              {company.address.province}, {company.address.postalCode}
            </span>
          </div>
          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Company Details</span>
            <span>Reg: {company.registrationNumber}</span>
            <span>Tax: {company.taxNumber}</span>
          </div>
          <div className={styles.contactRow}>
            <span className={styles.contactLabel}>Account Info</span>
            <span>Status: {getAccountStatusLabel(company.status)}</span>
            <span>Type: {getAccountTypeLabel(company.accountType)}</span>
          </div>
        </div>

        <div className={styles.proposalCard}>
          <h3 className={styles.proposalTitle}>Request a Proposal</h3>

          <div className={styles.proposalGrid}>
            <div className={styles.proposalField}>
              <label htmlFor="fullName" className={styles.proposalLabel}>
                Full Name
              </label>
              <input id="fullName" type="text" placeholder="John Doe" className={styles.proposalInput} />
            </div>
            <div className={styles.proposalField}>
              <label htmlFor="companyField" className={styles.proposalLabel}>
                Company
              </label>
              <input id="companyField" type="text" placeholder="Acme Corp" className={styles.proposalInput} />
            </div>
          </div>

          <div className={styles.proposalField}>
            <label htmlFor="projectType" className={styles.proposalLabel}>
              Project Type
            </label>
            <select id="projectType" className={styles.proposalInput}>
              <option>Commercial Structural</option>
              <option>Residential</option>
              <option>Industrial</option>
            </select>
          </div>

          <div className={styles.proposalField}>
            <label htmlFor="projectDescription" className={styles.proposalLabel}>
              Project Description
            </label>
            <textarea
              id="projectDescription"
              placeholder="Tell us about your project requirements..."
              className={styles.proposalTextarea}
            />
          </div>

          <button type="button" className={styles.submitButton}>
            Submit Proposal Request
          </button>
        </div>
      </section>
    </div>
  );
}