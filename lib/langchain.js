import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Initialize OpenAI with the model of your choice (gpt-3.5-turbo or gpt-4)
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,  // OpenAI API key from .env.local
  modelName: 'gpt-4o',  
  temperature: 0.7,
});

// Define the new ChatPromptTemplate
const prompt = ChatPromptTemplate.fromTemplate(`
  The user needs help with resources in the area of {metric}. 
  Here are some local resources:
  {resources}.
  Summarize the best resources and provide suggestions for the user based on this information.
`);

export async function getSuggestedResources(scrapedResources, metric) {
  // Prepare the input for the prompt
  const input = {
    metric,
    resources: scrapedResources.map(r => `- ${r.title}: ${r.link}`).join('\n'),
  };

  // Pipe the prompt into the OpenAI model and invoke it with dynamic input
  const chain = prompt.pipe(model);
  
  const response = await chain.invoke(input);

  return response.text;  // Return the generated response
}
