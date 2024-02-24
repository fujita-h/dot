import 'dotenv/config';

import es from '../../../libs/elasticsearch/instance';

const main = async () => {
  const indexExists = await es.existsIndex('notes');
  if (!indexExists) {
    console.log('Index "notes" does not exist');
    return;
  }
  await es.deleteIndex('notes');
  console.log('Index "notes" deleted');
};

main();
