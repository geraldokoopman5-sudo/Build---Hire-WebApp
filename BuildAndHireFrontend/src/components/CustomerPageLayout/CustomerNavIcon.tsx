export default function CustomerNavIcon({ kind }: { kind: 'home' | 'companies' | 'projects' | 'signout' }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'home' ? <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>
      : kind === 'companies' ? <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3" /></>
      : kind === 'signout' ? <path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4" />
      : <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
  </svg>;
}
