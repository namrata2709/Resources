# ──────────────────────────────────────────────────────────────────────────────
# Check-Stock Lambda Function
# Module 13 Lab - Serverless Inventory Tracking System
# Session Date: April 23, 2026 | Instructor: Todd Pritsky
# ──────────────────────────────────────────────────────────────────────────────
#
# PURPOSE:
#   Triggered by DynamoDB Streams whenever items are written to the Inventory
#   table. Checks each new item's Count — if Count == 0, publishes an
#   out-of-stock alert to the 'NoStock' SNS topic.
#
# TRIGGER:  DynamoDB Streams on the Inventory table (NEW_AND_OLD_IMAGES)
# OUTPUTS:  SNS publish to 'NoStock' topic → email/SMS to subscribers
# ROLE:     Lambda-Check-Stock-Role (DynamoDB Streams read + SNS publish)
#
# TODD'S NOTES:
#   - This function is intentionally separate from Load-Inventory (Single
#     Responsibility Principle). Adding business logic to Load-Inventory
#     would make both functions harder to maintain.
#   - The SNS topic ARN is discovered at runtime by listing topics.
#     PRODUCTION BEST PRACTICE: Store the ARN in an environment variable:
#       SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']
#     and use it directly — avoids the list_topics() call on every invocation.
#   - DynamoDB trigger can take 2-3 minutes to become active after creation.
#     Wait before testing, and confirm your SNS email subscription first.
# ──────────────────────────────────────────────────────────────────────────────

import json
import boto3

# ── PRODUCTION BEST PRACTICE VERSION ──────────────────────────────────────────
# Replace the SNS topic discovery below with:
#
# import os
# SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']   # Set in Lambda env vars
#
# Then in lambda_handler, replace the sns.list_topics() block with:
#   sns.publish(
#       TopicArn=SNS_TOPIC_ARN,
#       Message=message,
#       Subject='Inventory Alert!',
#       MessageStructure='raw'
#   )
# ──────────────────────────────────────────────────────────────────────────────


def lambda_handler(event, context):
    """
    Main handler — invoked by Lambda runtime on every DynamoDB Streams event.
    
    Args:
        event (dict): DynamoDB Streams event containing Records list.
                      Each record has 'eventName' (INSERT/MODIFY/REMOVE)
                      and 'dynamodb' dict with 'NewImage' and/or 'OldImage'.
        context (LambdaContext): Runtime information.
    
    Returns:
        str: Summary of records processed.
    """
    # Log the full event for debugging in CloudWatch Logs
    print("Event received by Lambda function: " + json.dumps(event, indent=2))

    # Process each stream record in the batch
    for record in event['Records']:

        # Get the new item state (None if this was a DELETE event)
        newImage = record['dynamodb'].get('NewImage', None)

        if newImage:
            # DynamoDB Streams returns values with type descriptors:
            # {'N': '0'} for numbers, {'S': 'Berlin'} for strings
            count = int(record['dynamodb']['NewImage']['Count']['N'])

            if count == 0:
                # This item is out of stock — send an alert
                store = record['dynamodb']['NewImage']['Store']['S']
                item  = record['dynamodb']['NewImage']['Item']['S']

                message = store + ' is out of stock of ' + item
                print(message)

                # Connect to SNS and find the NoStock topic ARN
                sns = boto3.client('sns')
                alertTopic = 'NoStock'

                # Discover topic ARN dynamically (runtime lookup)
                # NOTE: For production, use environment variable instead (see header)
                snsTopicArn = [
                    t['TopicArn'] for t in sns.list_topics()['Topics']
                    if t['TopicArn'].lower().endswith(':' + alertTopic.lower())
                ][0]

                # Publish the out-of-stock alert to SNS
                sns.publish(
                    TopicArn=snsTopicArn,
                    Message=message,
                    Subject='Inventory Alert!',
                    MessageStructure='raw'
                )

    return 'Successfully processed {} records.'.format(len(event['Records']))