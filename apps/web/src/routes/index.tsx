import { createFileRoute, Link } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/')({ component: Home });

function Home(): JSX.Element {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{'Bedrock Tweaks'}</h1>
      <p>{'Temporary navigation page - links to all routes:'}</p>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/resource-packs'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Resource Packs'}
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/addons'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Addons'}
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/crafting-tweaks'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Crafting Tweaks'}
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/privacy'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Privacy Policy'}
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/terms'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Terms of Service'}
            </Link>
          </li>
          {/* <li style={{ marginBottom: '1rem' }}>
            <Link to={'/discord'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'Discord (redirect)'}
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link to={'/github'} style={{ color: '#630000', fontSize: '1.2rem', textDecoration: 'underline' }}>
              {'GitHub (redirect)'}
            </Link>
          </li> */}
        </ul>
      </nav>
    </div>
  );
}
