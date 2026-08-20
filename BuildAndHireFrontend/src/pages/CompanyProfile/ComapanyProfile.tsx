import { useParams, Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import { companies } from '../../data/companies';
import styles from './CompanyProfile.module.css';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const company = companies.find((entry) => entry.id === id);

  if (!company) {
    return (
      <div className={styles.page}>
        <AppHeader />
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
      <AppHeader />

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
            Contact Company
          </a>
        </div>
      </section>

      <section className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Services</h2>
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
          <h2 className={styles.contactTitle}>Get in Touch</h2>
          <p className={styles.contactSubtitle}>
            Ready to discuss your next project? Our team is standing by.
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
              {company.address.province}
            </span>
          </div>
        </div>

        <div className={styles.proposalCard}>
          <h3 className={styles.proposalTitle}>Request a Proposal</h3>
          <p className={styles.proposalHint}>
            This form isn&apos;t wired up yet — swap in your real submission handler when ready.
          </p>
        </div>
      </section>
    </div>
  );
}