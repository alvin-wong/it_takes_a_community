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

        // Use SQL to calculate the averages for the specified fields
        const query = `
          SELECT 
            AVG(limited_access_to_healthy_foods) AS avg_limited_access_to_healthy_foods,
            AVG(food_insecurity) AS avg_food_insecurity,
            AVG(poor_mental_health_days) AS avg_poor_mental_health_days,
            AVG(access_to_exercise_opportunities) AS avg_access_to_exercise_opportunities,
            AVG(premature_death) AS avg_premature_death
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
    