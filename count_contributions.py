
with open("authors.txt", "r") as f:
    lines = f.readlines()

author_counts = {}
for line in lines:
    author = line.strip()
    if "Haley" in author or "haley" in author:
        author = "Haley Tri"
    elif "Hanna" in author or "hanna" in author:
        author = "Hanna Asfaw" 
    elif "Sameer" in author or "sameer" in author:
        author = "Sameer Gul"
    elif "Ayan" in author or "ayan" in author:
        author = "Ayan Anees"
    elif "Team" in author:
        author = "Team"
        
    if author in author_counts:
        author_counts[author] += 1
    else:
        author_counts[author] = 1

print("Contribution Statistics:")
print("-----------------------")
for author, count in sorted(author_counts.items()):
    print(f"{author}: {count} commits")

print(f"\nTotal commits: {len(lines)}")

# Calculate percentages
total = len(lines)
print("\nContribution Percentages:")
print("-----------------------")
for author, count in sorted(author_counts.items()):
    percentage = (count / total) * 100
    print(f"{author}: {percentage:.1f}%")
