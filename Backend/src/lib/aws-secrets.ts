import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({});

export async function getDatabaseUrl(secretArn?: string): Promise<string> {
  if (!secretArn) {
    return process.env.DATABASE_URL || "postgresql://localhost:5432/payroo";
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretArn });
    const response = await secretsClient.send(command);

    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      const host = secret.host || process.env.DB_HOST || "localhost";
      const port = secret.port || process.env.DB_PORT || "5432";
      const database = secret.dbname || secret.dbName || "payroo";
      const username = secret.username || "payrooAdmin";
      const password = secret.password;

      if (!password) {
        throw new Error("Database password not found in secret");
      }

      return `postgresql://${username}:${password}@${host}:${port}/${database}`;
    }
  } catch (error) {
    console.error("Error retrieving database secret:", error);
    throw error;
  }

  return process.env.DATABASE_URL || "postgresql://localhost:5432/payroo";
}
