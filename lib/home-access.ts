export function shouldShowGuestActions(user: unknown): boolean {
  return user == null;
}
