import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

// Whitelisted tables to prevent SQL injection
const allowedCategories = ['health_data', 'education_data', 'demographics_data']; // Example categories

// Fields that should be excluded from percentile calculation
const excludedFields = ['county_clustered_yes_1_no_0_', 'release_year'];

export async function GET(req) {
    try {
        // Get the category and col_5_digit_fips_code from the request query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const col_5_digit_fips_code = searchParams.get('col_5_digit_fips_code');

        // Validate category and fips code
        if (!col_5_digit_fips_code) {
            return NextResponse.json({ error: 'col_5_digit_fips_code parameter is missing' }, { status: 400 });
        }
        if (!category || !allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }

        // Query the entire dataset for the requested category
        const allDataQuery = `SELECT * FROM ${category}`;
        const allDataResult = await queryDatabase(allDataQuery);

        if (allDataResult.length === 0) {
            return NextResponse.json({ error: 'No data found for the given category' }, { status: 404 });
        }

        // Query the specific county data
        const countyDataQuery = `SELECT * FROM ${category} WHERE col_5_digit_fips_code = $1`;
        const countyDataResult = await queryDatabase(countyDataQuery, [col_5_digit_fips_code]);

        if (countyDataResult.length === 0) {
            return NextResponse.json({ error: 'No data found for the given col_5_digit_fips_code' }, { status: 404 });
        }

        const countyData = countyDataResult[0];

        // Calculate percentile for each relevant numeric field, excluding specified fields
        const numericFields = Object.keys(countyData).filter(
            key => !excludedFields.includes(key) && !isNaN(parseFloat(countyData[key])) && isFinite(countyData[key])
        );

        const percentiles = {};

        numericFields.forEach(field => {
            const values = allDataResult.map(row => parseFloat(row[field])).sort((a, b) => a - b);
            const countyValue = parseFloat(countyData[field]);

            // Find the percentile rank of the countyValue
            const rank = values.filter(v => v <= countyValue).length;
            const percentile = (rank / values.length) * 100;

            percentiles[field] = percentile;
        });

        // Return the percentiles
        return NextResponse.json({ col_5_digit_fips_code, percentiles }, { status: 200 });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
