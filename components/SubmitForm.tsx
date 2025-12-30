
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SubmitFormProps {
  onClose: () => void;
  lang: Language;
}

const SubmitForm: React.FC<SubmitFormProps> = ({ onClose, lang }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-[#d0d7de] overflow-hidden">
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">{t.formTitle}</h2>
          <button onClick={onClose} className="text-[#636c76] hover:text-[#1f2328]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t.successTitle}</h3>
            <p className="text-gray-600 mt-2">{t.successDesc}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t.formLabelName}</label>
              <input required type="text" className="w-full border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. MyVibeTool" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">{t.formLabelUrl}</label>
              <input required type="url" className="w-full border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Link to your public announcement" />
            </div>

            <div className="p-4 border-2 border-dashed border-[#d0d7de] rounded-md bg-[#f6f8fa]">
              <label className="block text-sm font-semibold mb-2">{t.formVerify}</label>
              <p className="text-xs text-[#636c76] mb-3">{t.formVerifyDesc}</p>
              <input required type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>

            <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-md border border-blue-100">
              <input type="checkbox" required className="rounded border-blue-300" />
              <p className="text-xs text-blue-800">{t.formConfirm}</p>
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-[#d0d7de] rounded-md text-sm font-semibold hover:bg-[#f6f8fa]">{t.cancel}</button>
              <button 
                disabled={isSubmitting}
                type="submit" 
                className={`px-4 py-2 bg-[#2da44e] text-white rounded-md text-sm font-semibold hover:bg-[#2c974b] shadow-sm transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? t.verifying : t.submitBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitForm;
