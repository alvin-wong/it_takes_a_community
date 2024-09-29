import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { group } from "console";

const allowedCategories = ['health_data', 'education_data', 'demographics_data'];  // Example

export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');
      
      // Get multiple col_5_digit_fips_code values from the query string
      const col_5_digit_fips_code = searchParams.getAll('col_5_digit_fips_code');
  
      if (!col_5_digit_fips_code || col_5_digit_fips_code.length === 0) {
        return NextResponse.json({ error: 'col_5_digit_fips_code parameter is missing' }, { status: 400 });
      }
  
      if (!category || !allowedCategories.includes(category)) {
        return NextResponse.json({ error: 'Invalid or missing category parameter' }, { status: 400 });
      }
  
      // Convert FIPS codes to strings if needed
      const fipsCodesAsString = col_5_digit_fips_code.map(fips => fips.toString().padStart(5, '0'));
  
      // Build the SQL query to handle multiple FIPS codes
      const placeholders = fipsCodesAsString.map((_, index) => `$${index + 1}`).join(", ");
      const query = `SELECT * FROM ${category} WHERE col_5_digit_fips_code IN (${placeholders})`;
  
      // Execute the query with the array of FIPS codes as parameters
      const result = await queryDatabase(query, fipsCodesAsString);
  
      if (result.length === 0) {
        return NextResponse.json({ error: 'No data found for the given col_5_digit_fips_code and category' }, { status: 404 });
      }

        // Transform the array of results into an object grouped by FIPS code
        const groupedByFips = result.reduce((acc, item) => {
            const fipsCode = item.col_5_digit_fips_code;
            acc[fipsCode] = item; // Use FIPS code as key and item as the value
            return acc;
        }, {});

    
        // Return the grouped results
        return NextResponse.json(groupedByFips, { status: 200 });
  
    } catch (error) {
      console.error('Error handling request:', error);
      return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
  }
  