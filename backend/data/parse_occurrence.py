import pandas as pd
import sys

def parse_occurrence_file(input_file, output_file):
    """
    Parse the occurrence.txt file and save it in a more efficient format.
    Keeps all columns from the original file.
    """
    print(f"Reading {input_file}...")

    try:
        # Read the tab-separated file
        df = pd.read_csv(input_file, sep='\t', low_memory=False)

        print(f"Successfully loaded {len(df)} rows and {len(df.columns)} columns")

        # Keep only columns relevant for mapping fish locations
        relevant_columns = [
            # Identification
            'id',
            'catalogNumber',
            'occurrenceID',

            # Taxonomy - species identification
            'scientificName',
            'kingdom',
            'phylum',
            'class',
            'order',
            'family',
            'genus',
            'specificEpithet',
            'vernacularName',

            # Geographic location
            'decimalLatitude',
            'decimalLongitude',
            'country',
            'continent',
            'waterBody',
            'locality',
            'stateProvince',
            'county',
            'island',
            'islandGroup',

            # Depth/elevation
            'minimumDepthInMeters',
            'maximumDepthInMeters',
            'minimumElevationInMeters',
            'maximumElevationInMeters',

            # Date/time
            'eventDate',
            'year',
            'month',
            'day',

            # Sample info
            'individualCount',
            'sex',
            'lifeStage',
            'occurrenceStatus',
            'habitat',
            'samplingProtocol',

            # Quality/verification
            'basisOfRecord',
            'coordinateUncertaintyInMeters',
        ]

        # Filter to only columns that exist in the dataframe
        existing_columns = [col for col in relevant_columns if col in df.columns]
        df_filtered = df[existing_columns].copy()

        print(f"\nFiltered to {len(df_filtered.columns)} relevant columns for fish mapping")
        print(f"Columns kept: {list(df_filtered.columns)}")
        print(f"\nFirst few rows:\n{df_filtered.head()}")
        print(f"\nMemory usage: {df_filtered.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

        # Use filtered dataframe
        df = df_filtered

        # Save as CSV for easy viewing
        print(f"\nSaving to {output_file}...")
        df.to_csv(output_file, index=False)
        print(f"Saved as CSV format")

        print(f"\nSummary:")
        print(f"  Total rows: {len(df)}")
        print(f"  Total columns: {len(df.columns)}")
        print(f"  Missing values per column:")
        missing = df.isnull().sum()
        missing = missing[missing > 0].sort_values(ascending=False)
        if len(missing) > 0:
            print(missing.head(20))
        else:
            print("  No missing values")

        return df

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    input_file = "/Users/reagan/Documents/GitHub/sushihacks2025/backend/occurrence.txt"
    output_file = "/Users/reagan/Documents/GitHub/sushihacks2025/backend/occurrence_parsed.csv"

    df = parse_occurrence_file(input_file, output_file)
    print("\nDone!")