const TITLES: Record<string, string> = {
  notes: 'Notes',
  login: 'Log in',
  signup: 'Sign in',
  settings: 'Settings',
};

export function titleForView(view: string) {
  return TITLES[view] || 'Copy anything. Paste it. Stay organized';
}
