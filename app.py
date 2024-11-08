from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import PyPDF2
import json
import re
import os

app = Flask(__name__, static_folder='dist')
CORS(app)

# Convert PDF content to text
def pdf_to_text(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# Parse MCQ text from extracted PDF text
def parse_mcq_text(text):
    mcq_list = []
    lines = text.strip().split('\n')
    current_question = None
    options = []
    correct_answer = None

    for line in lines:
        line = line.strip()
        
        # Match question format like "1. What is Python?"
        question_match = re.match(r'^\d+\.\s*(.+)', line)
        if question_match:
            if current_question and options:
                mcq_list.append({
                    "question": current_question,
                    "options": options,
                    "correct_answer": correct_answer
                })
            current_question = question_match.group(1).strip()
            options = []
            correct_answer = None
        elif line.startswith(('(A)', '(B)', '(C)', '(D)')):
            option = line[3:].strip()
            options.append(option)
        elif line.startswith('**Answer:**'):
            answer_match = re.search(r'\*\*Answer:\*\* (.+)', line)
            if answer_match:
                correct_answer = answer_match.group(1).strip()

    if current_question and options:
        mcq_list.append({
            "question": current_question,
            "options": options,
            "correct_answer": correct_answer
        })

    return mcq_list

# Endpoint to handle PDF uploads and parse MCQs
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.pdf'):
        try:
            text = pdf_to_text(file)
            mcq_list = parse_mcq_text(text)

            questions = []
            answers = {}
            for index, mcq in enumerate(mcq_list):
                questions.append({
                    "id": index,
                    "question": mcq["question"],
                    "options": mcq["options"]
                })
                answers[index] = mcq["correct_answer"]

            exam_json = {
                "title": "Generated Exam",
                "questions": questions
            }

            with open('exam_data.json', 'w') as json_file:
                json.dump(exam_json, json_file, indent=2)

            with open('exam_answers.json', 'w') as json_file:
                json.dump(answers, json_file, indent=2)

            return jsonify({"message": "Exam data generated successfully"}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400

# Endpoint to retrieve the exam data
@app.route('/exam', methods=['GET'])
def get_exam():
    try:
        with open('exam_data.json', 'r') as json_file:
            exam_data = json.load(json_file)
        return jsonify(exam_data), 200
    except FileNotFoundError:
        return jsonify({'error': 'Exam data not found'}), 404

# Endpoint to submit answers and calculate score
@app.route('/submit', methods=['POST'])
def submit_exam():
    user_answers = request.json
    try:
        with open('exam_answers.json', 'r') as json_file:
            correct_answers = json.load(json_file)
    except FileNotFoundError:
        return jsonify({'error': 'Answer key not found'}), 404

    results = []
    score = 0
    total = len(correct_answers)

    for question_id, user_answer in user_answers.items():
        correct_answer = correct_answers.get(str(question_id))
        is_correct = user_answer == correct_answer
        if is_correct:
            score += 1

        results.append({
            'question_id': int(question_id),
            'user_answer': user_answer,
            'correct_answer': correct_answer,
            'is_correct': is_correct
        })

    percentage = (score / total) * 100 if total > 0 else 0

    return jsonify({
        'score': score,
        'total': total,
        'percentage': percentage,
        'results': results
    })

# Endpoint to save user answers
@app.route('/save-answers', methods=['POST'])
def save_answers():
    try:
        user_answers = request.json
        with open('user_answers.json', 'w') as json_file:
            json.dump(user_answers, json_file, indent=2)
        return jsonify({'message': 'Answers saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve React frontend
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Serve any other static file (CSS, JS, etc.)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
