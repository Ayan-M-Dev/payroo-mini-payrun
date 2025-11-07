import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

export async function uploadPdfToS3(
  bucketName: string,
  key: string,
  pdfBuffer: Buffer
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  });

  await s3Client.send(command);
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}
