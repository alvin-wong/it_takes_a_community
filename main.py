from fastapi import FastAPI, HTTPException
from requests_html import AsyncHTMLSession
from fastapi.middleware.cors import CORSMiddleware

import openai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or specify your frontend origin)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)   

async def scrape_resources(metric: str, county_name: str, max_results: int = 10):
    query = f"{metric} support opportunities community in {county_name}"
    url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    
    session = AsyncHTMLSession()
    try:
        response = await session.get(url)
        await response.html.arender()

        results = []
        search_results = response.html.find('.g', first=False)

        for idx, result in enumerate(search_results[:max_results]):
            title_element = result.find('h3', first=True)
            link_element = result.find('a', first=True)

            if title_element and link_element:
                results.append({
                    'title': title_element.text,
                    'link': link_element.attrs['href']
                })

        detailed_resources = []
        for resource in results:
            page_response = await session.get(resource['link'])
            content = page_response.html.find('body', first=True).text[:200]

            detailed_resources.append({
                'title': resource['title'],
                'link': resource['link'],
                'content': content.replace('\n', ' ').strip()
            })

        return detailed_resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await session.close()

### Step 3: Define API Endpoint to Scrape and Call Langchain.js

@app.post("/suggest_resources")
async def suggest_resources(metric: str, county_name: str):
    try:
        # Scrape the resources
        scraped_resources = await scrape_resources(metric, county_name)

        # Prepare resources list for the Langchain model input
        resources = "\n".join([f"- {r['title']}: {r['link']}" for r in scraped_resources])

        # Define the prompt for the Langchain model
        prompt = f"""
        You are helping a user find ways to get involved in the {county_name} community for {metric}. 
        Here is a list of resources: 
        {resources}.
        Based on the above resources, summarize the most relevant and useful resources for the user and present them in a clear and friendly way.
        Give at least one resource.
        THE RESOURCE MUST BE SPECIFICALLY RELATED TO {metric} AND RELATED TO PARTICIPATING IN THE COMMUNITY.
        Return the data in the following JSON format, where the result is an object containing an array with resource objects.
        UNDER ALL CIRCUMSTANCES YOUR RESPONSE MUST BE VALID JSON IN THE BELOW FORMAT. DO NOT DEVIATE FROM THE BELOW FORMAT.

        {{
          "resources": [
            {{
              "title": "Resource Title",
              "description": "At least 3 sentences describing the Resource.",
              "how_you_help": "How the person can get involved in relation to the opportunity",
              "link": "Link to website"
            }}
          ]
        }}
        """

        # Call OpenAI (Langchain.js) for generating response

        response = openai.Completion.create(
            model="gpt-4o-mini",
            prompt=prompt,
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].text.strip()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

