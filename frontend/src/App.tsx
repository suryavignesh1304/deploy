import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import ExamSetup from './components/ExamSetup';
import Exam from './components/Exam';
import AnswerInput from './components/AnswerInput';

const App: React.FC = () => {
  return (
    <Router>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center max-sm:">CBT Exam System</h1>
        <Routes>
          <Route path="/" element={<FileUpload />} />
          <Route path="/answer-input" element={<AnswerInput />} />
          <Route path="/exam-setup" element={<ExamSetup />} />
          <Route path="/exam" element={<Exam />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;