import pandas as pd

base_path = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/"

data_to_process = [
    ("seed_pruned_1.csv", "similarity/seed_1_similar.csv"),
    ("seed_pruned_2.csv", "similarity/seed_2_similar.csv"),
    ("seed_pruned_3.csv", "similarity/seed_3_similar.csv"),
]

for x in data_to_process:
    source, dest = x
    source = base_path + source
    dest = base_path + dest

    data = pd.read_csv(source)

    # Sort by similarity, drop duplicates, and take top 100
    # top_100 = (data.sort_values(by='similarity', ascending=False)
    #              .drop_duplicates(subset='Source')
    #              .head(10))['Source']

    top_100 = (data.sort_values(by='similarity', ascending=False)
                .drop_duplicates(subset='Target')
                .head(100))  # Select only the 'Source' column

    top_100 = top_100['Target']
    # Convert to DataFrame and rename 'Source' column to 'ID'
    top_100_df = pd.DataFrame(top_100)
    top_100_df.rename(columns={'Target': 'ID'}, inplace=True)


    # Save to new CSV file
    top_100.to_csv(dest, index=False)
