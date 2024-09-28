import { getTopWorstPercentiles } from '@/utils/percentiles';
import { scrapeResources } from '@/lib/scraper';
import { getSuggestedResources } from '@/lib/langchain';
import { NextResponse } from 'next/server';
import { queryDatabase } from "@/lib/db";


export async function GET(req) {
  
  // Get the FIPS code from query parameters
  const { searchParams } = new URL(req.url);
  const col_5_digit_fips_code = searchParams.get('col_5_digit_fips_code');

  if (!col_5_digit_fips_code) {
    return NextResponse.json({ error: 'col_5_digit_fips_code parameter is missing' }, { status: 400 });
  }

  try {

    const countyQuery = `SELECT name FROM health_data WHERE col_5_digit_fips_code = $1`;
    const countyResult = await queryDatabase(countyQuery, [col_5_digit_fips_code]);

    if (countyResult.length === 0) {
      return NextResponse.json({ error: 'No county found for the given FIPS code' }, { status: 404 });
    }

    const countyName = countyResult[0].name;
    
    // Step 1: Get the top 5 worst percentiles
    const top5WorstMetrics = await getTopWorstPercentiles(col_5_digit_fips_code);
    console.log("top5WorstMetrics",top5WorstMetrics)

    // Step 2: Scrape resources for the top 5 worst metrics
    const scrapedResources = await Promise.all(
      top5WorstMetrics.map(async ([metric]) => scrapeResources(metric, countyName))
    );

    // Step 3: Use Langchain to summarize and suggest resources
    const suggestions = await Promise.all(
      top5WorstMetrics.map(([metric], i) => getSuggestedResources(scrapedResources[i], metric, countyName))
    );
    const parsedSuggestions = suggestions.map(suggestion => {
      try {
        return JSON.parse(suggestion);
      } catch (error) {
        console.error(`ChatGPT failed parsing json suggestion: ${error.message}`);
        return { error: 'Invalid JSON format', rawSuggestion: suggestion };
      }
    });
    
    console.log("Parsed suggestion:", parsedSuggestions);
    return NextResponse.json(parsedSuggestions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
