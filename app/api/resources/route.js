import { getTopWorstPercentiles } from '@/utils/percentiles';
import { scrapeResources } from '@/lib/scraper';
import { getSuggestedResources } from '@/lib/langchain';
import { NextResponse } from 'next/server';

export async function GET(req) {
  // Get the FIPS code from query parameters
  const { searchParams } = new URL(req.url);
  const col_5_digit_fips_code = searchParams.get('col_5_digit_fips_code');

  if (!col_5_digit_fips_code) {
    return NextResponse.json({ error: 'col_5_digit_fips_code parameter is missing' }, { status: 400 });
  }

  try {
    // Step 1: Get the top 5 worst percentiles
    const top5WorstMetrics = await getTopWorstPercentiles(col_5_digit_fips_code);

    // Step 2: Scrape resources for the top 5 worst metrics
    const scrapedResources = await Promise.all(
      top5WorstMetrics.map(async ([metric]) => scrapeResources(metric, col_5_digit_fips_code))
    );

    // Step 3: Use Langchain to summarize and suggest resources
    const suggestions = await Promise.all(
      top5WorstMetrics.map(([metric], i) => getSuggestedResources(scrapedResources[i], metric))
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
