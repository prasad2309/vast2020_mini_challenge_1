import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from collections import defaultdict
"""
1 - 80.41
2 - 77.62
3 - 80.32
4 - 76.83
5 - 69.83
"""

"""
1 - 600971 39 25 | (41, (600971, 24.588741466861762)) | (600971, (39, 25.512618031324607)) | 56.413986433344526, 99.80276776083498
2 - 538771 57 58 | (56, (538771, 58.098928777142866)) | (538771, (57, 58.098928777142866)) | 42.95908035792836, 81.46942653501462
3 - 574136 39 31 | (41, (574136, 30.028252336971732))  | (574136, (39, 31.710130056548856)) | 60.26, 99.45518264318889
"""



# Load the data
# data_cgcs = pd.read_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/CGCS-Template.csv")
# data_q1 = pd.read_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/Q1-Graph5.csv")

data_cgcs = pd.read_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/CGCS-Template.csv")
data_q1 = pd.read_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/seed_pruned_3.csv")


def create_feature_vectors(data):
    """
    Create feature vectors for each node based on:
    - Degree (number of connections)
    - Weight Distribution
    - eType Distribution
    - Temporal Activity (based on Time)
    """
    degree = defaultdict(int)
    etypes = defaultdict(lambda: defaultdict(int))
    temporal_activity = defaultdict(list)
    weights = defaultdict(list)
    location_distribution = defaultdict(lambda: defaultdict(int))
    nodetype_distribution = defaultdict(lambda: defaultdict(int))

    for _, row in data.iterrows():
        source, target = row['Source'], row['Target']
        etype, time, weight = row['eType'], row['Time'], row['Weight']
        source_loc, target_loc = row['SourceLocation'], row['TargetLocation']
        source_nodetype, target_nodetype = row['Source_NodeType'], row['Target_NodeType']

        # Update counts and lists
        degree[source] += 1
        degree[target] += 1
        etypes[source][etype] += 1
        etypes[target][etype] += 1
        temporal_activity[source].append(time)
        temporal_activity[target].append(time)
        weights[source].append(weight)
        weights[target].append(weight)
        location_distribution[source][source_loc] += 1
        location_distribution[target][target_loc] += 1
        nodetype_distribution[source][source_nodetype] += 1
        nodetype_distribution[target][target_nodetype] += 1

    feature_vectors = {}
    for node in degree.keys():
        # Normalize distributions
        total_etype = sum(etypes[node].values())
        etype_dist = [etypes[node][e] / total_etype for e in sorted(etypes[node])]
        weight_mean = np.mean(weights[node])
        weight_std = np.std(weights[node])
        time_mean = np.mean(temporal_activity[node])
        time_std = np.std(temporal_activity[node])
        total_locations = sum(location_distribution[node].values())
        location_dist = [location_distribution[node][loc] / total_locations for loc in
                         sorted(location_distribution[node])]
        total_nodetypes = sum(nodetype_distribution[node].values())
        nodetype_dist = [nodetype_distribution[node][ntype] / total_nodetypes for ntype in
                         sorted(nodetype_distribution[node])]

        feature_vectors[node] = [degree[node], weight_mean, weight_std, time_mean,
                                 time_std] + etype_dist + location_dist + nodetype_dist

    return feature_vectors

def normalize_feature_vectors(feature_vectors, max_etype):
    scaler = MinMaxScaler()
    for node in feature_vectors.keys():
        etype_length = len(feature_vectors[node]) - 6
        if etype_length < max_etype:
            feature_vectors[node].extend([0] * (max_etype - etype_length))
    feature_matrix = scaler.fit_transform(list(feature_vectors.values()))
    return {node: vec for node, vec in zip(feature_vectors.keys(), feature_matrix)}



# Create and normalize feature vectors
feature_vectors_cgcs = create_feature_vectors(data_cgcs)
feature_vectors_q1 = create_feature_vectors(data_q1)
max_etype_length = max(max(len(vec) for vec in feature_vectors_cgcs.values()),
                       max(len(vec) for vec in feature_vectors_q1.values()))
normalized_cgcs = normalize_feature_vectors(feature_vectors_cgcs, max_etype_length)
normalized_q1 = normalize_feature_vectors(feature_vectors_q1, max_etype_length)

# Calculate cosine similarity
matrix_cgcs = np.array(list(normalized_cgcs.values()))
matrix_q1 = np.array(list(normalized_q1.values()))
similarity_matrix = cosine_similarity(matrix_cgcs, matrix_q1)

# Find the most similar nodes and calculate similarity percentages
similarity_percentages = {}
total_similarity = 0
for i, node_cgcs in enumerate(normalized_cgcs):
    similarity_scores = similarity_matrix[i]
    most_similar_index = np.argmax(similarity_scores)
    most_similar_node_q1 = list(normalized_q1.keys())[most_similar_index]
    similarity_score = similarity_matrix[i, most_similar_index] * 100
    total_similarity += similarity_score
    similarity_percentages[int(node_cgcs)] = (int(most_similar_node_q1), similarity_score)

# Output some results
print(list(similarity_percentages.items())[:20])

# Calculate the average similarity
average_similarity = total_similarity / len(normalized_cgcs)
average_similarity2 = total_similarity / len(list(similarity_percentages.items()))

print(average_similarity, average_similarity2)


# q = [x if x[1][0]==574136 else ""  for x in list(similarity_percentages.items())]
# q = [x for x in q if x]
# q.sort(key=lambda x: -x[1][1])
# print(q[1])

# x=pd.DataFrame([{"node_id": row[1][0], "similar_template_node": row[0], "similarity": row[1][1] } for row in similarity_percentages.items()])
# x.to_csv("/Users/darshansheth/Desktop/asu_courses/578_data_visualization/assignments/final_project/Darshan-Deep-Jayati-Prasad-Kaushal-Sravya/data/similarity/seed1.csv")