import OpenAI from 'openai';

export const getOpenAIResponse = async (metrics, county_name) => {
  // Define the prompt based on metrics and county_name
  const prompt = `
  The worst five health care metrics for the county ${county_name} are ${metrics.join(', ')}. Based on these metrics, generate a paragraph
  containing the following: 
  (1) Listing out the metrics and stating how these metrics impact people's lives negatively.
  (2) How working together as a community can resolve the issues surrounding these metrics.
  (3) How improving upon these metrics can help strengthen the community and make people happier.
  (4) Provide encouragement to get involved in the community.
  `;

  // Initialize the OpenAI API with the apiKey from your environment variables
  const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

  try {
    // Use the OpenAI API to create a completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Adjust the model as per your requirements
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      temperature: 0.7, // Adjust creativity level
    });

    // Extract the generated content and return it
    const generatedText = response.choices[0].message.content.trim();
    return generatedText;
  } catch (error) {
    console.error('Error fetching response from OpenAI API:', error);
    return 'An error occurred while fetching response from OpenAI';
  }
};
