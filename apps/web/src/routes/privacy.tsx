import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/privacy')({ component: Privacy });

function Privacy(): JSX.Element {
  return (
    <div>
      <h1>{'Privacy Policy'}</h1>
      <p>{'Your privacy is important to us. This policy outlines how we handle your data.'}</p>

      <section>
        <h2>{'Information We Collect'}</h2>
        <p>{'Details about information collection...'}</p>
      </section>

      <section>
        <h2>{'How We Use Your Information'}</h2>
        <p>{'Details about information usage...'}</p>
      </section>

      <section>
        <h2>{'Contact Us'}</h2>
        <p>{'If you have questions about this privacy policy, please contact us.'}</p>
      </section>
    </div>
  );
}
