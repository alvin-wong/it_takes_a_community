import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

const allowedCategories = ['health_data', 'education_data', 'demographics_data'];  // Example

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const countyName = searchParams.get('county_name');
        
        if (!countyName) {
            return NextResponse.json({ error: 'county_name parameter is missing' }, { status: 400 });
        }

        if (!category || !allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }

        // Query to fetch FIPS code based on county name
        const queryFips = `SELECT col_5_digit_fips_code FROM ${category} WHERE name = $1`;
        const resultFips = await queryDatabase(queryFips, [countyName]);

        if (resultFips.length === 0) {
            return NextResponse.json({ error: 'No FIPS code found for the given county name' }, { status: 404 });
        }

        const fipsCode = resultFips[0].col_5_digit_fips_code;

        // Safely construct the query using the retrieved FIPS code
        const queryData = `SELECT * FROM ${category} WHERE col_5_digit_fips_code = $1`;
        const resultData = await queryDatabase(queryData, [fipsCode]);

        if (resultData.length === 0) {
            return NextResponse.json({ error: 'No data found for the given FIPS code and category' }, { status: 404 });
        }

        // Assuming resultData is an array of objects, return the first one (since each FIPS code should have a unique row)
        const metrics = resultData[0];
        return NextResponse.json({ fipsCode}, { status: 200 });

    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
