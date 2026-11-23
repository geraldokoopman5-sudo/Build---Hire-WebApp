import { Link } from 'react-router-dom';
import Workspace from '../../components/Workspace/Workspace';

const steps = [
  ['Choose a company', 'Browse approved company accounts and choose who receives your request.'],
  ['Agree on the quote', 'Review the scope and quote before giving the go-ahead.'],
  ['Follow the work', 'Keep project progress and updates together in your workspace.'],
  ['Try the payment demo', 'Follow a simulated EFT through review. No money moves.'],
];

export default function Home() {
  return (
    <Workspace className="customer-overview" title="Home">
      <section className="home-bento" aria-label="Plan your next project">
        <div className="bento-tile bento-hero">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>A better space.<br />A clearer process.</h1>
          <p>Find an approved company, share your idea, and keep your project moving from the first quote to the final update.</p>
          <div className="buttonrow">
            <Link className="primary" to="/marketplace">Explore companies</Link>
            <Link className="secondary" to="/my-jobs/new">Start a project</Link>
          </div>
        </div>

        <div className="bento-tile bento-plan">
          <span className="eyebrow">ROOM FOR YOUR IDEAS</span>
          <svg viewBox="0 0 480 280" fill="none" aria-label="Architectural floor plan" role="img">
            <g stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
              <path d="M70 40H410V240H70Z M240 40V240 M70 130H240 M240 155H410 M150 130V240" />
              <path d="M270 40H375V80H270Z M290 180H355V225H290Z M90 60H145V105H90Z M240 90H280A40 40 0 0 1 240 130 M150 160H185A35 35 0 0 1 150 195" strokeWidth="1.5" />
            </g>
          </svg>
          <p>Your next project, thoughtfully planned.</p>
        </div>

        <section className="bento-tile bento-projects" aria-labelledby="home-projects-title">
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2 id="home-projects-title">Every update.<br />One place.</h2>
          <p>Requests, quotes, and progress at a glance.</p>
          <Link className="secondary" to="/my-jobs">Open my projects</Link>
        </section>

        {steps.map(([title, description], index) => (
          <section className="bento-tile bento-step" key={title}>
            <span className="step-index" aria-label={'Step ' + (index + 1)}>{String(index + 1).padStart(2, '0')}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </section>
        ))}
      </section>
    </Workspace>
  );
}
