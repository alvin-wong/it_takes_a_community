import { getTopWorstPercentiles } from '@/utils/percentiles';
import { scrapeResources } from '@/lib/scraper';
import { getSuggestedResources } from '@/lib/langchain';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { fips5digit } = params;

  try {
    // Step 1: Get the top 5 worst percentiles
    const top5WorstMetrics = await getTopWorstPercentiles(fips5digit);

    // Step 2: Scrape resources for the top 5 worst metrics
    const scrapedResources = await Promise.all(
      top5WorstMetrics.map(async ([metric]) => scrapeResources(metric, fips5digit))
    );

    // Step 3: Use Langchain to summarize and suggest resources
    const suggestions = await Promise.all(
      top5WorstMetrics.map(([metric], i) => getSuggestedResources(scrapedResources[i], metric))
    );

    return NextResponse.json({ suggestions });  // Ensure 'suggestions' is the correct key
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
