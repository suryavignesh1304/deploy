import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Question {
  question: string;
  options: { label: string; text: string }[];
  correct_answer?: string;
}

interface ExamData {
  title: string;
  questions: Question[];
}

const AnswerInput: React.FC = () => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // Changed endpoint to /exam
        const response = await axios.get('http://localhost:5000/exam');
        setExamData(response.data);
        
        // Pre-fill answers if they exist in the parsed data
        const prefilledAnswers: Record<string, string> = {};
        response.data.questions.forEach((question: Question, index: number) => {
          if (question.correct_answer) {
            prefilledAnswers[index] = question.correct_answer;
          }
        });
        setAnswers(prefilledAnswers);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      }
    };

    fetchExamData();
  }, []);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      console.log('Answers before submission:', answers); // Debug log
      await axios.post('http://localhost:5000/save-answers', answers);
      navigate('/exam-setup');
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  };

  if (!examData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Confirm or Input Correct Answers</h2>
      <form onSubmit={handleSubmit}>
        {examData.questions.map((question, index) => (
          <div key={index} className="mb-4">
            <p className="font-semibold">{index + 1}. {question.question}</p>
            <div className="ml-4">
              {question.options.map((option) => (
                <div key={option.label}>
                  {option.label}) {option.text}
                </div>
              ))}
            </div>
            <select
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select correct answer</option>
              {question.options.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Answers and Continue
        </button>
      </form>
    </div>
  );
};

export default AnswerInput;
