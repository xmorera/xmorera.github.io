---
layout: post
title:  "Moving Stuff in S3 Buckets to Glacier"
date:   2024-12-01 00:00:00 -0600
categories: ["Posts"] 
---
# Moving Stuff in S3 Buckets to Glacier

I store all my Pluralsight training media stuff in S3, which means that after many years it is quite a lot. 

So I would benefit from moving everything to Glacier. Here's how to do it.

## Steps to Take
To move data from an S3 bucket to Amazon Glacier, you can use S3 Lifecycle policies. These policies automatically transition objects in your S3 bucket to Glacier or delete them after a certain period. Here’s how you can do it step-by-step:

---

### **Using the AWS Management Console**

1. **Go to the S3 Console**:
   - Log in to the [AWS Management Console](https://aws.amazon.com/console/) and navigate to the **S3 service**.

2. **Select Your Bucket**:
   - Click on the S3 bucket containing the objects you want to move to Glacier.

3. **Set Up a Lifecycle Rule**:
   - Go to the **"Management"** tab and select **"Lifecycle rules"**.
   - Click on **"Create lifecycle rule"**.

4. **Name Your Rule**:
   - Provide a name for your rule, such as `MoveToGlacier`.

5. **Specify Scope**:
   - Choose the rule scope:
     - **"Apply to all objects in the bucket"**: If you want to apply it to the entire bucket.
     - **"Limit the scope using one or more filters"**: To target specific prefixes or object tags.

6. **Set Transition Actions**:
   - In the **"Lifecycle rule actions"** section, select **"Transition current versions of objects between storage classes"**.
   - Choose **Glacier Flexible Retrieval**, **Glacier Instant Retrieval**, or **Glacier Deep Archive** as the target storage class.

7. **Define Transition Timing**:
   - Specify the number of days after object creation to transition the objects to Glacier (e.g., 0 for immediate transition).

8. **Review and Save**:
   - Review the rule settings and click **"Create rule"**.

---

### **Using the AWS CLI**

If you prefer to use the AWS CLI, follow these steps:

1. **Create a Lifecycle Configuration JSON**:
   Create a file, e.g., `lifecycle.json`, with the following content:

   ```json
   {
     "Rules": [
       {
         "ID": "MoveToGlacier",
         "Filter": {
           "Prefix": ""
         },
         "Status": "Enabled",
         "Transitions": [
           {
             "Days": 0,
             "StorageClass": "GLACIER"
           }
         ]
       }
     ]
   }
   ```

   Replace `"GLACIER"` with:
   - `GLACIER_IR` for Glacier Instant Retrieval.
   - `DEEP_ARCHIVE` for Glacier Deep Archive.

2. **Apply the Lifecycle Policy**:
   Run the following command:

   ```bash
   aws s3api put-bucket-lifecycle-configuration --bucket <bucket-name> --lifecycle-configuration file://lifecycle.json
   ```

   Replace `<bucket-name>` with your S3 bucket name.

---

### **Considerations**

- **Costs**: Glacier storage is cheaper, but retrieval costs can be higher, especially for bulk requests.
- **Retrieval Times**:
  - **Glacier Flexible Retrieval**: Standard (3-5 hours), Expedited (1-5 minutes).
  - **Glacier Deep Archive**: 12-48 hours retrieval.
  - **Glacier Instant Retrieval**: Millisecond retrieval.

- **Bucket Policy Permissions**: Ensure you have sufficient permissions (`s3:PutLifecycleConfiguration`) to configure lifecycle policies.

- **Check Compliance**: If you need to move data to Glacier for compliance or archiving purposes, verify that the chosen storage class aligns with your requirements.

If you need further clarification or help setting this up, let me know!

## What About Cost?
Transitioning your Amazon S3 objects to Glacier storage classes can lead to significant cost savings for infrequently accessed data. However, it's essential to consider several factors to ensure a cost-effective transition:

**1. Transition Request Costs:**
Each object transitioned to a Glacier storage class incurs a fee per request. For instance, moving data from S3 Standard to S3 Glacier Deep Archive is charged at $0.05 per 1,000 requests. 

**2. Storage Overhead Charges:**
When transitioning objects to S3 Glacier or S3 Glacier Deep Archive, Amazon S3 adds 40 KB of metadata per object—8 KB charged at S3 Standard rates and 32 KB at Glacier rates. This overhead can impact costs, especially for smaller objects. 

**3. Minimum Storage Duration Charges:**
Glacier storage classes have minimum storage durations:
- **S3 Glacier Instant Retrieval and S3 Glacier Flexible Retrieval:** 90 days
- **S3 Glacier Deep Archive:** 180 days

Deleting, overwriting, or transitioning objects before these periods elapse results in pro-rated charges for the remaining days. 

**4. Object Size Considerations:**
Transitioning very small objects may not be cost-effective due to per-request fees and storage overhead. Aggregating smaller objects into larger ones before transitioning can help reduce costs. 

**5. Retrieval Costs and Times:**
Retrieving data from Glacier storage classes incurs varying costs and times:
- **S3 Glacier Instant Retrieval:** Milliseconds access with retrieval fees.
- **S3 Glacier Flexible Retrieval:** Expedited (1–5 minutes), Standard (3–5 hours), and Bulk (5–12 hours) retrievals, each with associated costs.
- **S3 Glacier Deep Archive:** Standard (12 hours) and Bulk (48 hours) retrievals with respective fees.

Frequent retrievals can diminish the cost benefits of Glacier storage. 

**6. Monitoring and Analytics:**
Utilize tools like Amazon S3 Storage Lens to analyze storage patterns and identify which objects are suitable for transitioning, ensuring that frequently accessed data remains in more appropriate storage classes. 

By carefully evaluating these factors, you can develop a strategy that balances cost savings with data accessibility requirements. 