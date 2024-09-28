import { NextResponse } from "next/server";
import { queryDatabase } from "/lib/db";

// Whitelisted tables to prevent SQL injection
const allowedCategories = ['health_data', 'education_data', 'demographics_data'];  // Example

export async function GET(req) {
    try {
        // Get the category and fips5digit from the request query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const fips5digit = searchParams.get('fips5digit');

        if (!fips5digit) {
            return NextResponse.json({ error: 'fips5digit parameter is missing' }, { status: 400 });
        }
        if (!category || !allowedCategories.includes(category)) {
            console.log(category)
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }

        // Safely construct the query by directly interpolating the validated category
        const query = `SELECT * FROM ${category} WHERE fips_5_digit_code = $1`;
        const result = await queryDatabase(query, [fips5digit]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'No data found for the given fips5digit and category' }, { status: 404 });
        }

        // Assuming result is an array of objects, return the first one (since each fips5digit should have a unique row)
        const metrics = result[0];

        return NextResponse.json(metrics, { status: 200 });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
