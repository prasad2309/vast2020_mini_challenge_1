import pandas as pd

# SOURCE_FP_1 = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/seed_pruned_3.csv"
# SOURCE_FP_2 = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/CGCS-GraphData-NodeTypes.csv"
# TARGET_FP = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/-seed_pruned_3.csv"
#
# source = pd.read_csv(SOURCE_FP_1)
# node_type = pd.read_csv(SOURCE_FP_2)
#
# # Merge the dataframes based on the 'Source' and 'NodeID' columns
# merged_df = source.merge(node_type, left_on='Source', right_on='NodeID', how='left')
#
# # Rename the 'NodeType' column to 'Source_NodeType' in the merged dataframe
# merged_df.rename(columns={'NodeType': 'Source_NodeType'}, inplace=True)
#
# # Drop the redundant 'NodeID' column if needed
# merged_df.drop('NodeID', axis=1, inplace=True)
#
# merged_df = merged_df.merge(node_type, left_on='Target', right_on='NodeID', how='left')
# merged_df.rename(columns={'NodeType': 'Target_NodeType'}, inplace=True)
#
# # Drop the redundant 'NodeID' column if needed
# merged_df.drop('NodeID', axis=1, inplace=True)
#
# # Print the merged dataframe
# print(merged_df)
# merged_df.to_csv(TARGET_FP)



SOURCE_FP_1 = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/archive/seed_pruned_3.csv"
SOURCE_FP_2 = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/similarity/seed3.csv"
TARGET_FP = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/seed_pruned_3.csv"

source = pd.read_csv(SOURCE_FP_1)
node_type = pd.read_csv(SOURCE_FP_2)

# Merge the dataframes based on the 'Source' and 'NodeID' columns
merged_df = source.merge(node_type, left_on='Target', right_on='node_id', how='left')
merged_df.drop('node_id', axis=1, inplace=True)
# merged_df.drop('Unnamed: 0.2', axis=1, inplace=True)
# merged_df.drop('Unnamed: 0.1', axis=1, inplace=True)
merged_df.drop('Unnamed: 0_y', axis=1, inplace=True)
merged_df['similarity'].fillna(0, inplace=True)
# Rename the 'NodeType' column to 'Source_NodeType' in the merged dataframe
# merged_df.rename(columns={'similarity': 'Similarity'}, inplace=True)

# Drop the redundant 'NodeID' column if needed


# Print the merged dataframe
print(merged_df)
merged_df.to_csv(TARGET_FP)



# df = pd.read_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/similarity/seed1.csv")
#
# # Group by 'x' and select rows with maximum 'y' within each group
# result_df = df.groupby('node_id')['similarity'].idxmax().reset_index()
# result_df = df.loc[result_df['similarity']]
#
# result_df.to_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/similarity/seed1.csv")
#
