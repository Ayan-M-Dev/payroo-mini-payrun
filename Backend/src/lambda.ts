import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import serverlessExpress from "@vendia/serverless-express";
import { getDatabaseUrl } from "./lib/aws-secrets";

let serverlessApp: ReturnType<typeof serverlessExpress>;
let dbInitialized = false;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbInitialized && process.env.DB_SECRET_ARN) {
    try {
      const dbUrl = await getDatabaseUrl(process.env.DB_SECRET_ARN);
      process.env.DATABASE_URL = dbUrl;
      dbInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database URL:", error);
      throw error;
    }
  }

  if (!serverlessApp) {
    const { default: app } = await import("./app");
    serverlessApp = serverlessExpress({ app });
  }

  return new Promise<APIGatewayProxyResult>((resolve, reject) => {
    serverlessApp(
      event,
      context,
      (error: string | Error | null | undefined, result?: unknown) => {
        if (error) {
          reject(error instanceof Error ? error : new Error(error));
        } else {
          resolve(result as APIGatewayProxyResult);
        }
      }
    );
  });
};
