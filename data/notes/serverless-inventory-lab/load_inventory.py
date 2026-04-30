# ──────────────────────────────────────────────────────────────────────────────
# Load-Inventory Lambda Function
# Module 13 Lab - Serverless Inventory Tracking System
# Session Date: April 23, 2026 | Instructor: Todd Pritsky
# ──────────────────────────────────────────────────────────────────────────────
#
# PURPOSE:
#   Triggered by an S3 object creation event whenever an inventory CSV file
#   is uploaded. Downloads the file, reads each row, and writes it to the
#   DynamoDB 'Inventory' table.
#
# TRIGGER:  Amazon S3 — s3:ObjectCreated:* events on the inventory bucket
# OUTPUTS:  DynamoDB put_item calls (one per CSV row)
# ROLE:     Lambda-Load-Inventory-Role (S3 read + DynamoDB write)
#
# CSV FORMAT EXPECTED:
#   store,item,count
#   Springfield,Echo Dot,12
#   Springfield,Echo Show,0
#
# TODD'S NOTES:
#   - Always click Deploy after pasting this code — your most common mistake.
#   - Use Python 3.12 (not 3.9 — it's deprecated).
#   - /tmp/ is the only writable path inside Lambda.
#   - For production: replace hardcoded 'Inventory' with os.environ['TABLE_NAME']
# ──────────────────────────────────────────────────────────────────────────────

import json
import urllib
import boto3
import csv

# Connect to S3 and DynamoDB
s3 = boto3.resource('s3')
dynamodb = boto3.resource('dynamodb')

# Connect to the DynamoDB Inventory table
# PERSONAL ACCOUNT BEST PRACTICE: Use environment variable instead:
#   import os
#   inventoryTable = dynamodb.Table(os.environ['TABLE_NAME'])
inventoryTable = dynamodb.Table('Inventory')


def lambda_handler(event, context):
    """
    Main handler — invoked by Lambda runtime on every S3 trigger.
    
    Args:
        event (dict): S3 event payload containing bucket name and object key
        context (LambdaContext): Runtime information (function name, timeout, etc.)
    
    Returns:
        str: Number of rows inserted
    """
    # Log the full event for debugging in CloudWatch Logs
    print("Event received by Lambda function: " + json.dumps(event, indent=2))

    # Extract the S3 bucket name and object key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    localFilename = '/tmp/inventory.txt'  # /tmp/ is Lambda's only writable directory

    # Download the CSV file from S3 to Lambda's local /tmp/ filesystem
    try:
        s3.meta.client.download_file(bucket, key, localFilename)
    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. '
              'Make sure they exist and your bucket is in the same region '
              'as this function.'.format(key, bucket))
        raise e

    # Read the CSV and insert each row into DynamoDB
    with open(localFilename) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        rowCount = 0

        for row in reader:
            rowCount += 1

            # Log each row to CloudWatch for debugging
            print(row['store'], row['item'], row['count'])

            try:
                # Write the item to DynamoDB
                # put_item creates new or fully replaces existing item with same key
                inventoryTable.put_item(
                    Item={
                        'Store': row['store'],    # Partition key
                        'Item':  row['item'],     # Sort key
                        'Count': int(row['count'])
                    }
                )
            except Exception as e:
                print(e)
                print("Unable to insert data into DynamoDB table")

    return "%d counts inserted" % rowCount