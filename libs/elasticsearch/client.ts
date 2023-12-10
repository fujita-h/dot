'server-only';

import { Client } from '@elastic/elasticsearch';
import { DeleteByQueryRequest, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { promises as fs } from 'fs';

export class EsClient {
  private esClient: Client;

  constructor() {
    const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
    if (!ELASTICSEARCH_URL) {
      throw new Error('ELASTICSEARCH_URL is not defined');
    }

    this.esClient = new Client({ node: ELASTICSEARCH_URL, tls: { rejectUnauthorized: false } });
  }

  async init(index: string) {
    const exists = await this.esClient.indices.exists({ index }, { ignore: [404] });
    if (!exists) {
      const file = await fs.readFile(process.cwd() + '/libs/elasticsearch/mappings/_base.json', 'utf8');
      const body = JSON.parse(file);
      console.log(body);
      this.esClient.indices.create({ index, body });
    }
    const files = await fs.readdir(process.cwd() + '/libs/elasticsearch/mappings/');
    for (const f of files) {
      if (f.startsWith(`${index}.`) && f.endsWith('.json')) {
        const file = await fs.readFile(process.cwd() + `/libs/elasticsearch/mappings/${f}`, 'utf8');
        const body = JSON.parse(file);
        await this.esClient.indices.putMapping({ index, body: body });
      }
    }
  }

  createIndex(index: string, body?: any) {
    return this.esClient.indices.create({ index, body });
  }

  existsIndex(index: string) {
    return this.esClient.indices.exists({ index });
  }

  deleteIndex(index: string) {
    return this.esClient.indices.delete({ index });
  }

  /**
   * @description create or update document
   */
  create(index: string, id: string, body: any) {
    return this.esClient.index({ index, id, body });
  }

  get(index: string, id: string) {
    return this.esClient.get({ index, id });
  }

  exists(index: string, id: string) {
    return this.esClient.exists({ index, id });
  }

  search(index: string, body: SearchRequest) {
    return this.esClient.search({ index, body });
  }

  delete(index: string, id: string, ignore?: number[]) {
    return this.esClient.delete({ index, id }, { ignore });
  }

  deleteByQuery(request: DeleteByQueryRequest) {
    return this.esClient.deleteByQuery(request);
  }
}
