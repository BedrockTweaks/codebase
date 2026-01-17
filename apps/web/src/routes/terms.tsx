import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/terms')({ component: Terms });

function Terms(): JSX.Element {
  return (
    <div>
      <h1>{'Terms of Service'}</h1>
      <p>{'Please read these terms carefully before using our services.'}</p>

      <section>
        <h2>{'Acceptance of Terms'}</h2>
        <p>{'By accessing this website, you agree to these terms...'}</p>
      </section>

      <section>
        <h2>{'Use License'}</h2>
        <p>{'Details about permitted usage...'}</p>
      </section>

      <section>
        <h2>{'Disclaimer'}</h2>
        <p>{'Disclaimer information...'}</p>
      </section>

      <section>
        <h2>{'Limitations'}</h2>
        <p>{'Limitation of liability...'}</p>
      </section>
    </div>
  );
}
