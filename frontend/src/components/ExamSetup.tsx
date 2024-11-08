import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamSetup: React.FC = () => {
  const [duration, setDuration] = useState(60);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/exam', { state: { duration } });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Exam Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Exam Duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Exam
        </button>
      </form>
    </div>
  );
};

export default ExamSetup;