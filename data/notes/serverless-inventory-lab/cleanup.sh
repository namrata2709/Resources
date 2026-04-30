#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Serverless Inventory Lab — Complete Cleanup Script
# April 23, 2026 | Instructor: Todd Pritsky
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   1. Set BUCKET_NAME below to your actual bucket name
#   2. chmod +x cleanup.sh
#   3. bash cleanup.sh
#
# What this deletes:
#   S3 bucket (+ all objects) | Lambda functions | DynamoDB tables
#   SNS topic + subscriptions | SQS DLQ | CloudWatch alarms | IAM roles
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REGION="us-east-1"
BUCKET_NAME="your-inventory-bucket-name"    # ← CHANGE THIS before running

# ─── Safety check ────────────────────────────────────────────────────────────
if [ "$BUCKET_NAME" = "your-inventory-bucket-name" ]; then
  echo "❌ ERROR: Please edit cleanup.sh and set BUCKET_NAME to your actual bucket name."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ ERROR: AWS CLI not configured. Run 'aws configure' first."
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Serverless Inventory Lab — Cleanup"
echo "══════════════════════════════════════════════════════════════"
echo "  Bucket  : $BUCKET_NAME"
echo "  Region  : $REGION"
echo "  Account : $ACCOUNT_ID"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  This will permanently DELETE all lab resources listed above."
read -p "Type 'yes' to confirm and continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled. Nothing was deleted."
  exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# ─── Step 1: S3 Bucket ───────────────────────────────────────────────────────
echo "🗑  [1/7] Emptying and deleting S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
  aws s3 rm "s3://$BUCKET_NAME" --recursive --region "$REGION" 2>/dev/null || true
  aws s3api delete-bucket --bucket "$BUCKET_NAME" --region "$REGION"
  echo "     ✅ S3 bucket deleted."
else
  echo "     ℹ️  Bucket not found — skipping."
fi

# ─── Step 2: Lambda Functions ────────────────────────────────────────────────
echo ""
echo "🗑  [2/7] Removing DynamoDB stream trigger and deleting Lambda functions..."

# Remove Check-Stock DynamoDB event source mapping
MAPPING_UUID=$(aws lambda list-event-source-mappings \
  --function-name Check-Stock --region "$REGION" \
  --query "EventSourceMappings[0].UUID" --output text 2>/dev/null || echo "")
if [ -n "$MAPPING_UUID" ] && [ "$MAPPING_UUID" != "None" ]; then
  aws lambda delete-event-source-mapping --uuid "$MAPPING_UUID" --region "$REGION" 2>/dev/null || true
  echo "     Removed DynamoDB stream trigger from Check-Stock."
fi

for FUNC in Load-Inventory Check-Stock; do
  if aws lambda get-function --function-name "$FUNC" --region "$REGION" >/dev/null 2>&1; then
    aws lambda delete-function --function-name "$FUNC" --region "$REGION"
    echo "     Deleted Lambda: $FUNC"
  else
    echo "     ℹ️  Lambda $FUNC not found — skipping."
  fi
done
echo "     ✅ Lambda functions deleted."

# ─── Step 3: DynamoDB Tables ─────────────────────────────────────────────────
echo ""
echo "🗑  [3/7] Deleting DynamoDB tables..."
for TABLE in Inventory FileProcessingStatus; do
  if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" >/dev/null 2>&1; then
    aws dynamodb delete-table --table-name "$TABLE" --region "$REGION"
    echo "     Deleted table: $TABLE"
  else
    echo "     ℹ️  Table $TABLE not found — skipping."
  fi
done
echo "     ✅ DynamoDB tables deleted."

# ─── Step 4: SNS Topic and Subscriptions ─────────────────────────────────────
echo ""
echo "🗑  [4/7] Deleting SNS subscriptions and NoStock topic..."
TOPIC_ARN=$(aws sns list-topics --region "$REGION" \
  --query "Topics[?ends_with(TopicArn, ':NoStock')].TopicArn" \
  --output text 2>/dev/null || echo "")
if [ -n "$TOPIC_ARN" ] && [ "$TOPIC_ARN" != "None" ]; then
  SUBS=$(aws sns list-subscriptions-by-topic --topic-arn "$TOPIC_ARN" \
    --region "$REGION" \
    --query "Subscriptions[?SubscriptionArn != 'PendingConfirmation'].SubscriptionArn" \
    --output text 2>/dev/null || echo "")
  for SUB in $SUBS; do
    aws sns unsubscribe --subscription-arn "$SUB" --region "$REGION" 2>/dev/null || true
    echo "     Unsubscribed: $SUB"
  done
  aws sns delete-topic --topic-arn "$TOPIC_ARN" --region "$REGION"
  echo "     ✅ SNS topic and subscriptions deleted."
else
  echo "     ℹ️  NoStock topic not found — skipping."
fi

# ─── Step 5: SQS Dead Letter Queue ───────────────────────────────────────────
echo ""
echo "🗑  [5/7] Deleting SQS Dead Letter Queue (inventory-dlq)..."
DLQ_URL=$(aws sqs get-queue-url --queue-name inventory-dlq --region "$REGION" \
  --query QueueUrl --output text 2>/dev/null || echo "")
if [ -n "$DLQ_URL" ] && [ "$DLQ_URL" != "None" ]; then
  aws sqs delete-queue --queue-url "$DLQ_URL" --region "$REGION"
  echo "     ✅ SQS DLQ deleted."
else
  echo "     ℹ️  inventory-dlq not found — skipping."
fi

# ─── Step 6: CloudWatch Alarms ───────────────────────────────────────────────
echo ""
echo "🗑  [6/7] Deleting CloudWatch alarms..."
aws cloudwatch delete-alarms \
  --alarm-names LoadInventory-Errors CheckStock-Errors \
  --region "$REGION" 2>/dev/null || true
echo "     ✅ CloudWatch alarms deleted (if they existed)."

# ─── Step 7: IAM Roles ───────────────────────────────────────────────────────
echo ""
echo "🗑  [7/7] Deleting IAM roles..."
for ROLE in Lambda-Load-Inventory-Role Lambda-Check-Stock-Role; do
  if aws iam get-role --role-name "$ROLE" >/dev/null 2>&1; then

    # Detach all managed policies
    POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE" \
      --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null || echo "")
    for POLICY in $POLICIES; do
      aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY" 2>/dev/null || true
    done

    # Delete all inline policies
    INLINE_POLICIES=$(aws iam list-role-policies --role-name "$ROLE" \
      --query "PolicyNames" --output text 2>/dev/null || echo "")
    for P in $INLINE_POLICIES; do
      aws iam delete-role-policy --role-name "$ROLE" --policy-name "$P" 2>/dev/null || true
    done

    aws iam delete-role --role-name "$ROLE"
    echo "     Deleted role: $ROLE"
  else
    echo "     ℹ️  Role $ROLE not found — skipping."
  fi
done
echo "     ✅ IAM roles deleted."

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  🎉 Cleanup Complete!"
echo "══════════════════════════════════════════════════════════════"
echo "  All Serverless Inventory Lab resources have been deleted."
echo "  Your AWS account has zero ongoing costs from this lab."
echo ""
echo "  If you used CloudFormation for setup, also run:"
echo "  aws cloudformation delete-stack \\"
echo "    --stack-name serverless-inventory-setup \\"
echo "    --region $REGION"
echo "══════════════════════════════════════════════════════════════"
echo ""