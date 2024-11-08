from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_pdf(file_name, questions):
    # Create a PDF canvas
    c = canvas.Canvas(file_name, pagesize=letter)
    
    width, height = letter  # 8.5 x 11 inches
    
    # Title at the top
    c.setFont("Helvetica-Bold", 14)
    c.drawString(200, height - 40, "Multiple Choice Questions")
    
    # Starting position
    y_position = height - 60
    
    # Loop through each question
    for q in questions:
        c.setFont("Helvetica", 12)
        
        # Write the question
        c.drawString(40, y_position, f"Q: {q['question']}")
        y_position -= 20  # Move down
        
        # Write the options (A, B, C, D)
        options = q['options']
        for index, option in enumerate(options):
            c.drawString(40, y_position, f"{chr(65+index)}. {option}")
            y_position -= 20
        
        # Write the correct answer
        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, y_position, f"Answer: {q['answer']}")
        y_position -= 40  # Extra space after each question
        
        # If the space runs out, create a new page
        if y_position < 100:
            c.showPage()  # Start a new page
            y_position = height - 40  # Reset position
    
    # Save the PDF
    c.save()

# Example questions
questions = [
    {
        'question': 'What is the capital of France?',
        'options': ['Berlin', 'Madrid', 'Paris', 'Rome'],
        'answer': 'C'
    },
    {
        'question': 'What is 2 + 2?',
        'options': ['3', '4', '5', '6'],
        'answer': 'B'
    },
    {
        'question': 'Which planet is known as the Red Planet?',
        'options': ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        'answer': 'B'
    },
    {
        'question': 'Who wrote "Romeo and Juliet"?',
        'options': ['Shakespeare', 'Dickens', 'Hemingway', 'Austen'],
        'answer': 'A'
    }
]

# Create the PDF
create_pdf("mcq_questions.pdf", questions)
