import pandas as pd
from collections import deque
import time
import boto3
import pandas as pd
from io import StringIO


# AWS configuration
AWS_ACCESS_KEY = ''
AWS_SECRET_KEY = ''
BUCKET_NAME = ""

# S3 object key names
S3_FILE_KEY = 'CGCS-GraphData.csv'  # e.g., 'folder/data.csv'
S3_UPLOAD_KEY = 'output/CGCS-GraphData_updated.csv'  # e.g., 'folder/data_modified.csv'

# Initialize S3 client
s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)

# Function to fetch data from S3 and load into a DataFrame
def fetch_data_from_s3(bucket, file_key):
    response = s3_client.get_object(Bucket=bucket, Key=file_key)
    return pd.read_csv(response['Body'])

# Function to upload DataFrame back to S3
def upload_data_to_s3(bucket, file_key, dataframe):
    csv_buffer = StringIO()
    dataframe.to_csv(csv_buffer, index=False)
    s3_client.put_object(Bucket=bucket, Body=csv_buffer.getvalue(), Key=file_key)



def get_children(node_id):
    return set(df[df["Source"] == node_id]["Target"].values.tolist())


def get_existing_node_ids(df):
    return set()

if __name__ == "__main__":
    # SOURCE_CSV = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/Q1-Graph1.csv"
    SOURCE_CSV = "/Users/darshansheth/Downloads/CGCS-GraphData.csv"
    TARGET_CSV = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/seed_pruned_3.csv"
    TOTAL_DEPTH = 0
    df = pd.read_csv(SOURCE_CSV)

    # Fetch data from S3
    # df = fetch_data_from_s3(BUCKET_NAME, S3_FILE_KEY)
    # Print the DataFrame
    # print(df)
    # df['Hash'] = df.apply(lambda row: hash(tuple(row)), axis=1)
    # Upload the DataFrame back to S3
    # upload_data_to_s3(BUCKET_NAME, S3_UPLOAD_KEY, df)

    # Create a unique hash for each row
    print("loaded csv..")
    seed = [
        # {"id": 600971, "parent": 600971, "depth": -1},
        # {"id": 538771, "parent": 538771, "depth": -1},
        # {"id": 574136, "parent": 574136, "depth": -1},
    ]
    filtered_rows = []

    queue = deque(seed)
    hierarchy = {}

    # populate queue
    print("populating queue..")
    row_count = 0
    queue_count = len(queue)
    visited = get_existing_node_ids(df)

    while queue:
        node = queue.pop()
        queue_count -= 1
        if (node["depth"] <= TOTAL_DEPTH) and (node["id"] not in visited):
            print(f"== rows={row_count}, queue_count={queue_count} ==")
            visited.add(node["id"])
            row_count += 1
            filtered_rows.append(node)

            start_time = time.time()
            children = get_children(node["id"])
            print(f"{(time.time() - start_time)}s to get children")
            start_time = time.time()
            for child in children:
                if ((node["depth"] + 1) < TOTAL_DEPTH) and (child not in visited):
                    queue.append({"id": child, "parent": node["parent"], "depth": node["depth"] + 1})
                    queue_count += 1
            print(f"{(time.time() - start_time)}s to process children")
    print("all rows loaded")
    df["parent"] = "None"
    df["depth"] = -1
    for row in filtered_rows:
        if row["depth"] == 0:
            df.loc[df["Source"] == row["parent"], "parent"] = row["parent"]
            df.loc[df["Source"] == row["parent"], "depth"] = 0
        else:
            if "None" in list(df[df["Source"] == row["id"]]["parent"]):
                df.loc[df["Source"] == row["id"], "parent"] = row["parent"]
                df.loc[df["Source"] == row["id"], "depth"] = row["depth"]
            elif len(df[df["Source"] == row["id"]]["parent"]) > 0 and list(df[df["Source"] == row["id"]]["parent"])[0] != row["parent"]:
                print("parents overlapped", row["id"], row["parent"])
            else:
                pass

    final_df = df[df["parent"]!="None"]
    final_df.to_csv(TARGET_CSV)
    print(filtered_rows)
