import React from 'react';

const EPPSQuestions = ({ questions, answers, onAnswer, currentQuestion }) => {
  if (!questions || questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div 
          key={question.id} 
          className={`bg-white rounded-lg shadow-md p-6 border-2 border-black transition-all ${
            currentQuestion === question.id ? 'block' : 'hidden'
          }`}
        >
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              {question.id}
            </span>
            <span>Pilih salah satu pernyataan yang paling sesuai dengan diri Anda:</span>
          </h3>
          
          <div className="space-y-4">
            <div 
              onClick={() => onAnswer(question.id, 'A')}
              className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                answers[question.id] === 'A' 
                  ? 'border-black bg-yellow-100 -translate-y-1 shadow-md' 
                  : 'border-gray-200 hover:border-black hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  answers[question.id] === 'A' 
                    ? 'bg-black text-white' 
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
                  ? 'border-black bg-yellow-100 -translate-y-1 shadow-md' 
                  : 'border-gray-200 hover:border-black hover:-translate-y-1 hover:shadow-md'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  answers[question.id] === 'B' 
                    ? 'bg-black text-white' 
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

export default EPPSQuestions;
