import React from 'react';

const PapiQuestions = ({ questions, answers, onAnswer }) => {
  if (!questions || questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-8">
      {questions.map((question) => (
        <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Pertanyaan {question.id}
          </h3>
          
          <div className="space-y-4">
            <div 
              onClick={() => onAnswer(question.id, 'A')}
              className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                answers[question.id] === 'A' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  answers[question.id] === 'A' 
                    ? 'bg-blue-500 text-white' 
                    : 'border-2 border-gray-300'
                }`}>
                  {answers[question.id] === 'A' && <span>✓</span>}
                </div>
                <div>
                  <p className="text-gray-800">{question.pair[0].text}</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => onAnswer(question.id, 'B')}
              className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                answers[question.id] === 'B' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  answers[question.id] === 'B' 
                    ? 'bg-blue-500 text-white' 
                    : 'border-2 border-gray-300'
                }`}>
                  {answers[question.id] === 'B' && <span>✓</span>}
                </div>
                <div>
                  <p className="text-gray-800">{question.pair[1].text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PapiQuestions;
