import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Initialize OpenAI with the model of your choice (gpt-3.5-turbo or gpt-4)
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,  // OpenAI API key from .env.local
  modelName: 'gpt-4o-mini',  
  temperature: 0.7,
});

// Refined ChatPromptTemplate
const prompt = ChatPromptTemplate.fromTemplate(`
  You are helping a user find resources in {countyName} for {metric}. 
  Based on the following resources:
  {resources}.
  Summarize the most relevant and useful resources for the user and present them in a clear and friendly way. 
  Please format it cleanly, avoiding unnecessary technical language.

  Return in the following JSON format: title, link, description, and "how_it_helps"

`);


export async function getSuggestedResources(scrapedResources, metric, countyName) {
  const input = {
    metric,
    countyName,
    resources: scrapedResources.map(r => `- ${r.title}: ${r.link}`).join('\n'),
  };

  // Pipe the prompt into the OpenAI model and invoke it with dynamic input
  const chain = prompt.pipe(model);
  
  const response = await chain.invoke(input);

  return response.text;  // Return the generated response
}
