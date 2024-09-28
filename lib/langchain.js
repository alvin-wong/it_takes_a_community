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
Summarize the most relevant and useful resources for the user and present them in a clear and friendly way. Give atleast one resource
Return the data in the following JSON format, where the result is an object containing an array with resource objects.
THE JSON DATA MUST BE IN THE FOLLOWING FORMAT. EACH OBJECT IN THE RESOURCE ARRAY MUST HAVE ALL FIELDS OF title, description, how_it_helps, and link.
IF IT DOES NOT HAVE ALL FIELDS, DO NOT INCLUDE IT IN THE RESOURCES ARRAY.

{{
  "resources": [
    {{
      "title": "Resource Title",
      "description": "Paragraph describing the Resource",
      "how_it_helps": "How the resource helps",
      "link": "Link to website"
    }}
  ]
}}

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
  return response.content;  // Return the generated response
}
