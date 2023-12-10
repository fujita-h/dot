import { BlobServiceClient, Metadata, Tags } from '@azure/storage-blob';

export class BlobClient {
  private blobServiceClient: BlobServiceClient;

  constructor() {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not defined');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  }

  async createContainer(containerName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    return containerClient.createIfNotExists();
  }

  async upload(
    containerName: string,
    blobName: string,
    contentType: string,
    body: string | Buffer,
    metadata?: Metadata,
    tags?: Tags
  ) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.upload(body, body.length, {
      blobHTTPHeaders: { blobContentType: contentType },
      metadata,
      tags,
    });
  }

  async getProperties(containerName: string, blobName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.getProperties();
  }

  async download(containerName: string, blobName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.download();
  }

  async downloadToBuffer(containerName: string, blobName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.downloadToBuffer();
  }

  async delete(containerName: string, blobName: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.deleteIfExists();
  }

  async deleteManySync(containerName: string, blobPrefix: string) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blobs = containerClient.listBlobsFlat({ prefix: blobPrefix });
    const results = [];
    for await (const blob of blobs) {
      const result = await this.delete(containerName, blob.name);
      results.push(result);
    }
    return results;
  }
}
