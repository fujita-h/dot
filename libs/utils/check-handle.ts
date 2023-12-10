export function checkHandle(handle: string): void {
  if (!handle || !handle.match(/^[a-zA-Z][0-9a-zA-Z\-]{2,}$/i)) {
    throw new Error('Invalid handle');
  }
}
