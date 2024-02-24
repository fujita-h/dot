import 'dotenv/config';

import es from '../../../libs/elasticsearch/instance';

const main = async () => {
  const indexExists = await es.existsIndex('notes');
  if (indexExists) {
    console.log('Index "notes" exists');
    return;
  }
  await es.init('notes');
  console.log('Index "notes" created');
};

main();
