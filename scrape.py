import os
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS  
from groq import Groq
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from pymongo import MongoClient
import threading

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests


#TO DO - Move to env variables
MONGO_URI = "mongodb+srv://sgaglani1:Rooneymessi10@cluster0.en813.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)

# Select the database and collection
db = client["EthicalFashionDB"]  # Database Name
collection = db["EthicalAnalysis"]  # Collection Name


# **Step 1: Extract Page Text with Selenium**
def scrape_clothing_info(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("start-maximized")  
    options.add_argument("disable-infobars")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        driver.get(url)
        time.sleep(5)  # Allow time for content to load

        # Extract all visible text
        full_text = driver.execute_script("return document.body.innerText;")
        driver.quit()

        return full_text.strip()

    except Exception as e:
        driver.quit()
        return f"Error: {str(e)}"

# **Step 2: Send Extracted Text to Groq API**
def analyze_product_ethics(page_text):
    api_key = "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"  # For test use only 
    client = Groq(api_key=api_key)

    prompt = f"""
    Analyze the ethical aspects of the following product based on available text and additional industry knowledge.
    Provide insights into the brand's labor practices, sustainability claims, and animal welfare policies.
    Maintain a negative bias. The burden of proof is on the brand to prove its ethical claims and if there 
    isnt any proof then that should be reflected in the analysis.

    Return ONLY a valid JSON object with these fields. PLEASE DO NOT RETURN ANY OTHER TEXT PLEASE JUST THE JSON:
    {{
    "Product Name": "string",
    "Brand": "string", 
    "Animal Materials": "integer (0-1)", 0 if no animal materials, 1 if animal materials present
    "Material Composition": "string", 
    "Manufacturing Country": "string",  If not specified, check which country this brand usually manufactures in and say that.
    "Sustainability Practices": "string",
    "Labor Conditions": "string", If no Info, check and provide historical record of the brand.
    "Animal Welfare Policies": "string", 
    "Transparency Level": "string", 
    "Historical Brand Insights": "string", 
    "Detailed Analysis": "string", 
    "Related Links": "string", Add plain text links to the brands code of conduct/sustainibility practises etc. 
    "Overall Ethical Rating": "integer (0-10)"
    }}

    Ensure the response is a **properly formatted JSON object** with no extra text. PLEASE MAKE SURE NOT TO ADD ANYTHING BEFORE OR AFTER THE JSON OBJECT JUST THE JSON
    IS ALL THAT IS NEEDED.
    Here is the product page text:
    {page_text}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            temperature=0
        )

        print("Groq API Raw Response:", response.choices[0].message.content)  # Debugging line

        structured_data = json.loads(response.choices[0].message.content)
        return structured_data

    except json.JSONDecodeError:
        return {"Error": "Invalid JSON response from Groq API"}
    except Exception as e:
        return {"Error": f"Groq API request failed: {str(e)}"}

# **Flask Endpoints**

def store_in_mongo(ethics_data, url):
    """Function to store data asynchronously in MongoDB"""
    try:
        ethics_data["timestamp"] = time.time()  # Add timestamp
        ethics_data["url"] = url  # Store URL for reference
        collection.insert_one(ethics_data)  # Insert into MongoDB
        print("Data successfully stored in MongoDB")
    except Exception as e:
        print(f"MongoDB Storage Failed: {str(e)}")

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"message": "API is running!"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"Error": "Missing URL parameter"}), 400

    print(f"Received URL: {url}")

    # **Extract page text**
    page_text = scrape_clothing_info(url)
    if "Error" in page_text:
        return jsonify({"Error": "Scraping failed"}), 500

    # **Send to Groq API for Ethical Analysis**
    ethics_data = analyze_product_ethics(page_text)

    # **Return response immediately**
    response = jsonify(ethics_data)

    # **Store in MongoDB asynchronously**
    threading.Thread(target=store_in_mongo, args=(ethics_data, url)).start()  

    return response  



if __name__ == "__main__":
    app.run(debug=True)
