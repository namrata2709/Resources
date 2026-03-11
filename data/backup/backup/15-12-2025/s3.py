import json
import boto3
import time

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    file_key = event['Records'][0]['s3']['object']['key']

    # Ignore already processed files
    if file_key.startswith("processed/"):
        return {"status": "Skipped"}

    # Extract filename
    file_name = file_key.split('/')[-1]

    # New filename with timestamp
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    new_key = f"processed/{timestamp}_{file_name}"

    # Copy file
    s3.copy_object(
        Bucket=bucket_name,
        CopySource={'Bucket': bucket_name, 'Key': file_key},
        Key=new_key
    )

    # Delete original file
    s3.delete_object(
        Bucket=bucket_name,
        Key=file_key
    )

    print(f"File moved to {new_key}")

    return {
        'statusCode': 200,
        'body': json.dumps('File processed successfully')
    }