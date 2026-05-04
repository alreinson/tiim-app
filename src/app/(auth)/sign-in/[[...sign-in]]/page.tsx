import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: '#6030FF',
          borderRadius: '10px',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          rootBox: {
            boxShadow: 'var(--pz-shadow-md)',
            borderRadius: 'var(--pz-radius-md)',
          },
          card: {
            boxShadow: 'none',
            border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-md)',
          },
        },
      }}
    />
  )
}
