export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: es } = await import('./libs/elasticsearch/instance');
    await es.init('notes');
  }
}
