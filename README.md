# dot

## Requirements

- Node.js >= 18
- MySQL >= 8.0
- Elasticsearch >= 8.11 (for `dense_vector` with 4096 dimensions)
- Redis >= 6.2
- Azure Entra ID
- Azure Blob Storage

## Environment variables

### `AZURE_AD_CLIENT_ID`
Client (App) ID of Enrta ID
- Required: Yes
- Example: 

### `AZURE_AD_CLIENT_SECRET`
Client secret of the app
- Required: Yes
- Example: 

### `AZURE_AD_TENANT_ID`
Tenant ID of Enrta ID
- Required: Yes
- Example: 

### `AZURE_STORAGE_CONNECTION_STRING`
Connection string for Azure Blob Storage for the specific container
- Required: Yes
- Example: `DefaultEndpointsProtocol=...`

### `AZURE_OPENAI_COMPLETION_ENDPOINT`
Endpoint of completion model of Azure OpenAI API
- Required: Yes
- Example: `https://<resource-name>.openai.azure.com/`

### `AZURE_OPENAI_COMPLETION_KEY`
Key of completion model of Azure OpenAI API
- Required: Yes
- Example:

### `AZURE_OPENAI_COMPLETION_API_VERSION`
API version of completion model of Azure OpenAI API
- Required: Yes
- Example: `2024-06-01`

### `AZURE_OPENAI_COMPLETION_DEPLOYMENT`
Deployment name of completion model of `gpt-4o` grade model
- Required: Yes
- Example: `gpt-4o`

### `AZURE_OPENAI_EMBEDDING_ENDPOINT`
Endpoint of embedding model of Azure OpenAI API
- Required: Yes
- Example: `https://<resource-name>.openai.azure.com/`

### `AZURE_OPENAI_EMBEDDING_KEY`
Key of embedding model of Azure OpenAI API
- Required: Yes
- Example:

### `AZURE_OPENAI_EMBEDDING_API_VERSION`
API version of embedding model of Azure OpenAI API
- Required: Yes
- Example: `2024-06-01`

### `AZURE_OPENAI_EMBEDDING_DEPLOYMENT`
Deployment name of embedding model of `text-embedding-3-large`
- Required: Yes
- Example: `text-embedding-3-large`

### `DATABASE_URL`
See [Prisma Doc](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- Required: Yes
- Example: `mysql://user:pass@host:port/database`

### `REDIS_URL`
Redis URL, see [ioredis README](https://github.com/redis/ioredis)
- Required: Yes
- Example: `reids://user:pass@host:port/db`

### `ELASTICSEARCH_URL`
Elasticsearch URL, see [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html)
- Required: Yes
- Example: `http://user:pass@host:port`

### `ELASTICSEARCH_EMBEDDING_DIMS`
Embedding dimensions which is used for similarity search. Default is `3072`.  
Reducing this value will reduce the search time but may reduce the accuracy.
- Required: No
- Default: `3072`
- Acceptable values: `768`, `1536`, `3072`

### `AUTH_SECRET`
See [Auth.js Guide](https://authjs.dev/getting-started/deployment#environment-variables)  
A random string used to encrypt cookies and tokens. It should be at least 32 characters long.
On Linux systems, you can generate a suitable string using the command `openssl rand -base64 32`.
- Required: Yes
- Example: 

### `AUTH_URL`
See [NextAuth.js Doc](https://next-auth.js.org/configuration/options)
- Required: Yes
- Example: `https://example.com`

### `AUTH_SESSION_MAX_AGE`
Maximum session time (in seconds). Default is `86400`. See [NextAuth.js Doc](https://next-auth.js.org/configuration/options)
- Required: No
- Default: `86400`

### `AUTH_SESSION_UPDATE_AGE`
Session update time (in seconds). Default is `300`. See [NextAuth.js Doc](https://next-auth.js.org/configuration/options)
- Required: No
- Default: `300`

### `LOCALE`
Locale to use for the app. A string with a BCP 47 language tag or an `Intl.Locale instance`. Default is `ja-JP`.
- Required: No
- Default: `ja-JP`

### `TIMEZONE`
Timezone to use for the app. The time zone names of the IANA time zone database. Default is `Asia/Tokyo`.
- Required: No
- Default: `Asia/Tokyo`

### `USER_ROLE_FOR_GROUP_CREATION`
User role required to create a group. Default is empty string (`""`). Empty string (`""`) means that anyone can create a group.
- Required: No
- Default: `""`

### `USER_ROLE_FOR_TOPIC_CREATION`
User role required to create a topic. Default is empty string (`""`). Empty string (`""`) means that anyone can create a topic.
- Required: No
- Default: `""`
