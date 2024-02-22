import pandas as pd


base_path = "/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/similarity/"

# File paths
seed1_file = base_path + 'seed_1_similar.csv'  # Update with actual file path
seed2_file = base_path + 'seed_2_similar.csv'  # Update with actual file path
seed3_file = base_path + 'seed_3_similar.csv'  # Update with actual file path
graph_file = '/Users/darshansheth/Downloads/CGCS-GraphData.csv'  # Update with actual file path

# Load graph data
graph_data = pd.read_csv(graph_file)

def filter_and_save(seed_file, graph_data, output_file):
    # Load seed data
    seed_data = pd.read_csv(seed_file)

    # Filter graph data based on seed data and specified Etypes
    filtered_data = graph_data[
        graph_data['Source'].isin(seed_data['ID']) &
        graph_data['Target'].isin(seed_data['ID'])
        # &
        # graph_data['eType'].isin([0, 1, 6])
        ]

    # Save the filtered data to a new CSV file
    filtered_data.to_csv(output_file, index=False)


# Process each seed file
filter_and_save(seed1_file, graph_data, base_path + 'seed1_filtered.csv')
filter_and_save(seed2_file, graph_data, base_path + 'seed2_filtered.csv')
filter_and_save(seed3_file, graph_data, base_path + 'seed3_filtered.csv')