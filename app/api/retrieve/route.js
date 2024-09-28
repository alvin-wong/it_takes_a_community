import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";


const allowedCategories = ['health_data', 'education_data', 'demographics_data'];  // Example


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const col_5_digit_fips_code = searchParams.get('col_5_digit_fips_code');
        if (!col_5_digit_fips_code) {
            return NextResponse.json({ error: 'col_5_digit_fips_code parameter is missing' }, { status: 400 });
        }
        if (!category || !allowedCategories.includes(category)) {
            console.log(category)
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }
        // Safely construct the query by directly interpolating the validated category
        const query = `SELECT * FROM ${category} WHERE col_5_digit_fips_code = $1`;
        const result = await queryDatabase(query, [col_5_digit_fips_code]);
        if (result.length === 0) {
            return NextResponse.json({ error: 'No data found for the given col_5_digit_fips_code and category' }, { status: 404 });
    }
        // Assuming result is an array of objects, return the first one (since each col_5_digit_fips_code should have a unique row)
        const metrics = result[0];
        return NextResponse.json(metrics, { status: 200 });
        } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
        }
    }