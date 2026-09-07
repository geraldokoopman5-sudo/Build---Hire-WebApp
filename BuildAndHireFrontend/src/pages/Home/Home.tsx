import { Link } from 'react-router-dom';
import HomeHeader from '../../components/HomeHeader/HomeHeader';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <HomeHeader />

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.eyebrow}>Platform Overview</span>
          <h1 className={styles.heroTitle}>About Build &amp; Hire</h1>
          <p className={styles.heroText}>
            Build &amp; Hire is a platform designed to connect customers with trusted
            construction companies. It&apos;s a marketplace to make managing construction
            projects simpler, more transparent, and more efficient.
          </p>
          <p className={styles.heroText}>
            Customers can create and manage jobs, companies can manage their projects and
            workers, and administrators oversee verification and platform health — all from
            one place.
          </p>

          <div className={styles.heroActions}>
            <Link to="/marketplace" className={styles.primaryButton}>
              Explore Companies →
            </Link>
            <Link to="/signup" className={styles.secondaryButton}>
              Create an Account
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <span className={styles.flowLabel}>How a Project Moves Through the Platform</span>

          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <span className={styles.flowNumber}>01</span>
              <div>
                <span className={styles.flowTitle}>Job Posted</span>
                <span className={styles.flowDescription}>
                  Customer submits an application describing the project.
                </span>
              </div>
            </div>
            <div className={styles.flowStep}>
              <span className={styles.flowNumber}>02</span>
              <div>
                <span className={styles.flowTitle}>Company Reviews &amp; Quotes</span>
                <span className={styles.flowDescription}>
                  The company reviews the application and issues a quote.
                </span>
              </div>
            </div>
            <div className={styles.flowStep}>
              <span className={styles.flowNumber}>03</span>
              <div>
                <span className={styles.flowTitle}>Customer Accepts &amp; Pays</span>
                <span className={styles.flowDescription}>
                  Customer reviews the quote and pays to confirm the job.
                </span>
              </div>
            </div>
            <div className={styles.flowStep}>
              <span className={styles.flowNumber}>04</span>
              <div>
                <span className={styles.flowTitle}>Company Manages the Work</span>
                <span className={styles.flowDescription}>
                  The company tracks the job and assigns workers from their dashboard.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.modulesSection}>
        <span className={styles.sectionEyebrow}>Two Sides of the Marketplace</span>
        <h2 className={styles.sectionTitle}>Built for Customers and Construction Companies</h2>

        <div className={styles.modulesGrid}>
          <div className={styles.moduleCard}>
            <span className={styles.moduleIcon} aria-hidden="true">🏠</span>
            <h3 className={styles.moduleTitle}>Customers</h3>
            <ul className={styles.moduleList}>
              <li>Browse and search verified companies</li>
              <li>Submit job applications with project details</li>
              <li>Review and accept quotes</li>
              <li>Pay securely to confirm a job</li>
            </ul>
            <Link to="/marketplace" className={styles.moduleLink}>
              Browse Companies →
            </Link>
          </div>

          <div className={styles.moduleCard}>
            <span className={styles.moduleIcon} aria-hidden="true">🏗️</span>
            <h3 className={styles.moduleTitle}>Construction Companies</h3>
            <ul className={styles.moduleList}>
              <li>Maintain a public company profile</li>
              <li>Review incoming applications and issue quotes</li>
              <li>Track active jobs and payment status</li>
              <li>Manage your workforce and assignments</li>
            </ul>
            <Link to="/company/jobs" className={styles.moduleLink}>
              Company Dashboard →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <span className={styles.sectionEyebrow}>Core Features</span>
        <h2 className={styles.sectionTitle}>What Build &amp; Hire Handles</h2>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureTag}>Job Management</span>
            <h3 className={styles.featureTitle}>Applications &amp; Quotes</h3>
            <p className={styles.featureDescription}>
              Customers submit job applications, companies respond with quotes, and both sides
              track status from submission through acceptance.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureTag}>Workforce</span>
            <h3 className={styles.featureTitle}>Team Directory</h3>
            <p className={styles.featureDescription}>
              Companies maintain a directory of workers, their roles, and current project
              assignments.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureTag}>Payments</span>
            <h3 className={styles.featureTitle}>Secure Payments</h3>
            <p className={styles.featureDescription}>
              Customers pay to accept a quote via card, EFT, or PayPal, with a payment record
              tied to the job.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.featureTag}>Oversight</span>
            <h3 className={styles.featureTitle}>Admin Verification</h3>
            <p className={styles.featureDescription}>
              Platform admins review and verify new company accounts, and can suspend or remove
              accounts that violate platform standards.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <span className={styles.ctaEyebrow}>Get Started</span>
          <h2 className={styles.ctaTitle}>Ready to Start Your Next Project?</h2>
          <p className={styles.ctaText}>
            Browse verified companies or post a project to get quotes from construction teams
            ready to work.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/marketplace" className={styles.ctaPrimaryButton}>
              Explore Companies
            </Link>
            <Link to="/marketplace" className={styles.ctaSecondaryButton}>
              Post a Project
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>Build &amp; Hire</span>
          <p className={styles.footerTagline}>
            Connecting customers with construction companies, across residential and commercial
            projects.
          </p>
        </div>

        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <span className={styles.footerHeading}>Platform</span>
            <Link to="/marketplace">Find Companies</Link>
            <Link to="/marketplace">Post a Project</Link>
            <Link to="/home">How It Works</Link>
          </div>
          <div className={styles.footerColumn}>
            <span className={styles.footerHeading}>Companies</span>
            <Link to="/signup">Join as a Company</Link>
            <Link to="/company/jobs">Company Dashboard</Link>
          </div>
          <div className={styles.footerColumn}>
            <span className={styles.footerHeading}>Company</span>
            <Link to="/home">About</Link>
            <Link to="/home">Contact</Link>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2024 Build &amp; Hire. All rights reserved.</span>
          <div className={styles.footerLegal}>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}