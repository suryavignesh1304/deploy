import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface ExamData {
  title: string;
  questions: Question[];
}

interface ExamResult {
  score: number;
  total: number;
  percentage: number;
  results: {
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
}

const Exam: React.FC = () => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/exam');
        setExamData(response.data);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      }
    };

    fetchExamData();

    const duration = location.state?.duration || 60;
    setTimeLeft(duration * 60);
  }, [location.state]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && examData) {
      submitExam();
    }
  }, [timeLeft, examData]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    const answerLetter = String.fromCharCode(65 + answerIndex); // A, B, C, D
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerLetter,
    }));
  };

  // Submit exam answers
  const submitExam = async () => {
    if (!examData) return;

    try {
      const response = await axios.post('http://localhost:5000/submit', selectedAnswers);
      setExamResult(response.data);
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  if (!examData) {
    return <div>Loading exam...</div>;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Exam result display
  if (examResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Exam Results</h2>
        <p>Score: {examResult.score} / {examResult.total}</p>
        <p>Percentage: {examResult.percentage.toFixed(2)}%</p>
        <h3 className="text-xl font-bold mt-4 mb-2">Detailed Results:</h3>
        {examResult.results.map((result, index) => (
          <div key={index} className={`mb-4 p-4 rounded ${result.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
            <p><strong>Question {result.question_id + 1}:</strong> {examData.questions[result.question_id].question}</p>
            <p>Your answer: {result.user_answer}</p>
            <p>Correct answer: {result.correct_answer}</p>
          </div>
        ))}
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Render exam question and options
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{examData.title}</h2>
      <div className="mb-4 text-xl font-semibold">Time left: {formatTime(timeLeft)}</div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Question {currentQuestion + 1} of {examData.questions.length}
        </h3>
        <p className="mb-4">{examData.questions[currentQuestion].question}</p>
        <div className="space-y-2">
          {examData.questions[currentQuestion].options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${examData.questions[currentQuestion].id}`}
                value={option}
                checked={selectedAnswers[examData.questions[currentQuestion].id] === String.fromCharCode(65 + index)}
                onChange={() => handleAnswerSelect(examData.questions[currentQuestion].id, index)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span>{String.fromCharCode(65 + index)}) {option}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestion === examData.questions.length - 1 ? (
          <button
            onClick={submitExam}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Exam;
