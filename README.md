# Environment variables

| Variable                            | Description                                                                                                               | Required | Sample                                     |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------|
| `AZURE_AD_CLIENT_ID`                | Client (App) ID of Enrta ID                                                                                               | Yes      |                                            |
| `AZURE_AD_CLIENT_SECRET`            | Client secret of the app                                                                                                  | Yes      |                                            |
| `AZURE_AD_TENANT_ID`                | Tenant ID of Enrta ID                                                                                                     | Yes      |                                            |
| `AZURE_STORAGE_CONNECTION_STRING`   | Connection string for Azure Blob Storage for the specific container                                                       | Yes      | DefaultEndpointsProtocol=...               |
| `AZURE_OPENAI_ENDPOINT`             | Endpoint of OpenAI API                                                                                                    | Yes      | https://<resource name>.openai.azure.com/  |
| `AZURE_OPENAI_KEY`                  | Key of OpenAI API                                                                                                         | Yes      |                                            |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Deployment name of embedding model of `text-embedding-ada-002`                                                            | Yes      | text-embedding-ada-002                     |
| `DATABASE_URL`                      | See https://www.prisma.io/docs/reference/database-reference/connection-urls                                               | Yes      | mysql://user:pass@host:port/database       |
| `REDIS_URL`                         | Redis URL, see https://github.com/redis/ioredis                                                                           | Yes      | reids://user:pass@host:port/db             |
| `ELASTICSEARCH_URL`                 | Elasticsearch URL, see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html | Yes      | http://user:pass@host:port                 |
| `NEXTAUTH_SECRET`                   | See https://next-auth.js.org/configuration/options                                                                        | Yes      |                                            |
| `NEXTAUTH_URL`                      | See https://next-auth.js.org/configuration/options                                                                        | Yes      | https://example.com                        |
| `NEXTAUTH_URL_INTERNAL`             | See https://next-auth.js.org/configuration/options                                                                        | No       | http://localhost:3000                      |
| `SESSION_MAX_AGE`                   | Maximum session time (in seconds).                                                                                        | No       | 86400                                      |
| `LOCALE `                           | Locale to use for the app. A string with a BCP 47 language tag or an `Intl.Locale instance`.                              | No       | ja-JP                                      |
| `TIMEZONE`                          | Timezone to use for the app. The time zone names of the IANA time zone database.                                          | No       | Asia/Tokyo                                 |
 