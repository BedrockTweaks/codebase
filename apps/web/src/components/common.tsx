import { JSX } from 'react';
import { Link } from '@tanstack/react-router';

export function NotFoundPage(): JSX.Element {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{'404 - Page Not Found'}</h1>
      <p>{'The page you\'re looking for doesn\'t exist.'}</p>
      <Link to={'/'} style={{ color: '#630000', textDecoration: 'underline' }}>
        {'Go back home'}
      </Link>
    </div>
  );
}

export function InternalServerErrorPage(): JSX.Element {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{'500 - Internal Server Error'}</h1>
      <p>{'Something went wrong. Please try again later.'}</p>
      <Link to={'/'} style={{ color: '#630000', textDecoration: 'underline' }}>
        {'Go back home'}
      </Link>
    </div>
  );
}
