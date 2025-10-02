import time
import csv
import os

def fish_ranking(fish_list: list) -> dict:
    """
    Rank fish based on freshness and price.
    Freshness is given more weight than price.

    Example input:
    [fish_1, fish_2, fish_3, ...]

    Example output:
    {
        "fish_1": {
            "rank": int,
            "cleaning_difficulty": str,
            "commonality": str,
            "peak_season": str,
            "is_edible": bool
        },
        "fish_2": { ... },
        "fish_3": { ... },
        ...
    }
    """
    # give me the current date in MM-DD-YYYY format

    # give me the month
    current_month = int(time.strftime("%m"))

    # create a map from month day to month number
    month_map = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12
    }

    """
    for each fish in fish_list, we want to calculate a score based on cleaning_difficulty, commonality, peak_season, and edibility.
    we will say (is_edible*(cleaning_difficulty + commonality))/peak_season

    is_edible is 1 if true, 0 if false
    cleaning_difficulty is 1 for easy, 2 for medium, 3 for hard
    commonality is 1 for rare, 2 for uncommon, 3 for common
    if current_month is in peak_season, peak_season is 1,
        else the further away the current_month is from peak_season, the higher the number (max 6)
    """

    # Load fish data from CSV
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "fish_classification.csv")
    fish_data_map = {}

    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            scientific_name = row['scientificName']
            fish_data_map[scientific_name] = {
                'cleaning_difficulty': row['cleaning_difficulty'],
                'commonality': row['commonality'],
                'peak_season': row['peak_season'],
                'is_edible': row['is_edible'].lower() == 'true'
            }

    # Calculate scores for each fish
    fish_scores = []

    for fish_name in fish_list:
        # Get fish data from CSV, skip if not found
        if fish_name not in fish_data_map:
            continue

        fish_data = fish_data_map[fish_name]

        # Extract fish data
        is_edible = 1 if fish_data['is_edible'] else 0

        # Map cleaning difficulty to numeric value
        cleaning_map = {"easy": 1, "medium": 2, "hard": 3}
        cleaning_difficulty = cleaning_map.get(fish_data['cleaning_difficulty'].lower(), 2)

        # Map commonality to numeric value
        commonality_map = {"rare": 1, "uncommon": 2, "common": 3}
        commonality = commonality_map.get(fish_data['commonality'].lower(), 3)

        # Calculate peak season distance
        peak_season_str = fish_data['peak_season']

        # Check if it's year-round
        if peak_season_str == "Year-Round":
            peak_season_score = 1  # Always in season
        else:
            # Parse the range: "June-August" or single months
            peak_season_months = []

            # Extract month names from the string
            month_names_in_season = []
            for month_name in month_map.keys():
                if month_name in peak_season_str:
                    month_names_in_season.append(month_name)

            if len(month_names_in_season) >= 2:
                # It's a range: start_month to end_month
                start_month = month_map[month_names_in_season[0]]
                end_month = month_map[month_names_in_season[-1]]

                # Generate all months in the range (handle wrap-around)
                if start_month <= end_month:
                    peak_season_months = list(range(start_month, end_month + 1))
                else:
                    # Wraps around the year (e.g., November-February)
                    peak_season_months = list(range(start_month, 13)) + list(range(1, end_month + 1))
            elif len(month_names_in_season) == 1:
                # Single month
                peak_season_months = [month_map[month_names_in_season[0]]]

            # Calculate distance from current month to peak season
            if current_month in peak_season_months:
                peak_season_score = 1
            elif peak_season_months:
                # Find minimum distance to the peak season range (circular distance)
                min_distance = min(
                    min(abs(current_month - pm), 12 - abs(current_month - pm))
                    for pm in peak_season_months
                )
                peak_season_score = min(min_distance + 1, 6)  # max 6
            else:
                peak_season_score = 6  # worst score if no peak season info

        # Calculate final score (higher is better, so we invert the formula)
        # Original: (is_edible*(cleaning_difficulty + commonality))/peak_season
        # Lower score = better ranking
        if peak_season_score == 0:
            score = float('inf') if is_edible == 0 else 0
        else:
            score = (is_edible * commonality) / (peak_season_score + cleaning_difficulty)

        fish_scores.append({
            "name": fish_name,
            "score": score,
            "cleaning_difficulty": fish_data['cleaning_difficulty'],
            "commonality": fish_data['commonality'],
            "peak_season": fish_data['peak_season'],
            "is_edible": fish_data['is_edible']
        })

    # Sort by score (higher score = better rank)
    fish_scores.sort(key=lambda x: x["score"], reverse=True)

    # Build result dictionary with ranks
    result = {}
    for rank, fish_data in enumerate(fish_scores, start=1):
        fish_name = fish_data["name"]
        result[fish_name] = {
            "rank": rank,
            "cleaning_difficulty": fish_data["cleaning_difficulty"],
            "commonality": fish_data["commonality"],
            "peak_season": fish_data["peak_season"],
            "is_edible": fish_data["is_edible"],
            "score": fish_data["score"]
        }

    return result


if __name__ == "__main__":
    # Test the function with the specified fish
    test_fish = ["Thunnus albacares", "Fragum scruposum", "Fulvia aperta", "Plagiotremus tapeinosoma"]

    print("Testing fish ranking with:")
    for fish in test_fish:
        print(f"  - {fish}")
    print()

    result = fish_ranking(test_fish)

    print("Ranking Results:")
    print("=" * 80)
    for fish_name, data in result.items():
        print(f"\nRank #{data['rank']}: {fish_name}")
        print(f"  Cleaning Difficulty: {data['cleaning_difficulty']}")
        print(f"  Commonality: {data['commonality']}")
        print(f"  Peak Season: {data['peak_season']}")
        print(f"  Edible: {data['is_edible']}")
        print(f"  Score: {data['score']:.4f}")
    print("\n" + "=" * 80)



