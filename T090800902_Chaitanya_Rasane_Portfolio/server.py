from flask import Flask, request, jsonify
import fitz  # PyMuPDF for reading resume PDFs
import pyttsx3
import openai
import os
import time

app = Flask(__name__)

# Initialize Text-to-Speech Engine
engine = pyttsx3.init('sapi5')
engine.setProperty('voice', engine.getProperty('voices')[0].id)

# Store Chat History
chat_history = []

# Function to Speak Responses
def speak(text):
    try:
        engine.say(text)
        engine.runAndWait()
    except RuntimeError:
        pass  # Prevents "run loop already started" error

# Extract Resume Information
def extract_resume_text(pdf_path):
    with fitz.open(pdf_path) as doc:
        return " ".join([page.get_text() for page in doc]).lower()

resume_path = "resume.pdf"
resume_text = extract_resume_text(resume_path)
last_modified_time = os.path.getmtime(resume_path)

# Function to Check Resume Updates
def check_resume_update():
    global resume_text, last_modified_time
    new_time = os.path.getmtime(resume_path)
    if new_time != last_modified_time:
        print("Resume updated! Reloading data...")
        resume_text = extract_resume_text(resume_path)
        last_modified_time = new_time

# Function to Extract Information from Resume
def get_info(query):
    responses = {
        "who": "I am Chaitanya Rasane, a Software Engineer specializing in AI and Full-Stack Development.",
        "skills": "I have expertise in Python, Java, AI, Machine Learning, and Web Development.",
        "experience": "I have worked on AI-based projects, including an AI-driven vehicle selling web app and a WhatsApp Web clone.",
        "education": "I am pursuing a Bachelor's degree in Computer Engineering.",
        "projects": "My key projects include an AI-Based Vehicle Selling Web Application and a WhatsApp Web Clone."
    }

    for key in responses:
        if key in query:
            return responses[key]

    return chatgpt_response(query)  # Use ChatGPT if no match

# **Integrate ChatGPT API with Chat History**
openai.api_key = "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"  # 🔹 Replace this with your actual OpenAI API key

def chatgpt_response(user_query):
    chat_history.append({"role": "user", "content": user_query})  # Store user query
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an AI assistant for Chaitanya Rasane's portfolio."},
            ] + chat_history  # Include previous messages
        )
        ai_response = response.choices[0].message["content"]
        chat_history.append({"role": "assistant", "content": ai_response})  # Store AI response
        return ai_response
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"

# Flask Route to Handle Queries
@app.route("/ask", methods=["GET"])
def ask():
    check_resume_update()  # Check if resume has changed
    query = request.args.get("query", "").lower()
    answer = get_info(query)
    speak(answer)  # AI speaks the answer
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True)
