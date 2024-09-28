import { NextResponse } from "next/server";
import { queryDatabase } from "@/app/lib/db";

// Whitelisted tables to prevent SQL injection
const allowedCategories = ['healthcare', 'education', 'demographics'];  // Example

export async function GET(req) {
    try {
        // Get the category and county from the request query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const county = searchParams.get('county');

        if (!county) {
            return NextResponse.json({ error: 'county parameter is missing' }, { status: 400 });
        }
        if (!category || !allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }

        // Safely construct the query by directly interpolating the validated category
        const query = `SELECT * FROM ${category} WHERE county = $1`;
        const result = await queryDatabase(query, [county]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'No data found for the given county and category' }, { status: 404 });
        }

        // Assuming result is an array of objects, return the first one (since each county should have a unique row)
        const metrics = result[0];

        return NextResponse.json(metrics, { status: 200 });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
