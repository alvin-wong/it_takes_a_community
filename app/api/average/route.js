import { NextResponse } from "next/server";
import { queryDatabase } from "/lib/db";

// Whitelisted tables to prevent SQL injection
const allowedCategories = ['health_data', 'education_data', 'demographics_data'];

export async function GET(req) {
    try {
        // Get the category from the request query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        if (!category || !allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
        }

        // Query to get column names of the table, filtering only numeric fields
        const columnQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${category}' AND data_type IN ('integer', 'numeric', 'float', 'double precision', 'real');
        `;
        const columnsResult = await queryDatabase(columnQuery);

        if (columnsResult.length === 0) {
            return NextResponse.json({ error: 'No numeric fields found in the specified category' }, { status: 404 });
        }

        // Build the query dynamically to average all numeric fields
        const avgFields = columnsResult.map(col => `AVG(${col.column_name}) AS avg_${col.column_name}`).join(', ');

        const query = `
          SELECT 
            ${avgFields}
          FROM ${category}
        `;
        
        const result = await queryDatabase(query);

        if (result.length === 0) {
            return NextResponse.json({ error: 'No data found for the given category' }, { status: 404 });
        }

        // Return the averages as a response
        const averages = result[0];

        return NextResponse.json(averages, { status: 200 });
    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
