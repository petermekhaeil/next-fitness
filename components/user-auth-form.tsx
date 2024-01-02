'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  return (
    <div>
      <button onClick={() => signIn('strava')}>Sign in</button>
    </div>
  );
}
