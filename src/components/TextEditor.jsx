import { createSignal, Show } from 'solid-js';
import { createEvent } from '../supabaseClient';

function TextEditor() {
  const [text, setText] = createSignal('');
  const [correctedText, setCorrectedText] = createSignal('');
  const [tashkeelText, setTashkeelText] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSpeaking, setIsSpeaking] = createSignal(false);

  const handleCorrectText = async () => {
    setIsLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `قم بتصحيح النص التالي لغويًا وإملائيًا وأعد فقط النص المصحح:\n\n"${text()}"`,
        response_type: 'text'
      });
      setCorrectedText(result);
    } catch (error) {
      console.error('Error correcting text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTashkeel = async () => {
    setIsLoading(true);
    try {
      const result = await createEvent('chatgpt_request', {
        prompt: `قم بإضافة التشكيل الكامل للنص العربي التالي وأعد فقط النص المشكَّل:\n\n"${text()}"`,
        response_type: 'text'
      });
      setTashkeelText(result);
    } catch (error) {
      console.error('Error adding tashkeel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDictation = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('متصفحك لا يدعم خاصية التعرف على الصوت');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => {
      setIsSpeaking(true);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    recognition.onend = () => {
      setIsSpeaking(false);
    };
    recognition.start();
  };

  return (
    <div class="p-4">
      <textarea
        class="w-full h-40 p-2 border border-gray-300 rounded-md box-border focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text()}
        onInput={(e) => setText(e.target.value)}
        placeholder="أدخل النص هنا"
      />
      <div class="flex flex-wrap space-x-4 mt-4">
        <button
          class={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer mb-2 ${isLoading() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleCorrectText}
          disabled={isLoading()}
        >
          {isLoading() ? 'جارٍ التصحيح...' : 'تصحيح النص'}
        </button>
        <button
          class={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded cursor-pointer mb-2 ${isLoading() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleAddTashkeel}
          disabled={isLoading()}
        >
          {isLoading() ? 'جارٍ إضافة التشكيل...' : 'إضافة التشكيل'}
        </button>
        <button
          class={`bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded cursor-pointer mb-2 ${isSpeaking() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleDictation}
          disabled={isSpeaking()}
        >
          {isSpeaking() ? 'جارٍ الإملاء...' : 'الإملاء'}
        </button>
      </div>
      <div class="mt-4">
        <Show when={correctedText()}>
          <h2 class="text-xl font-bold text-purple-600">النص المصحح:</h2>
          <p class="mt-2 text-gray-800">{correctedText()}</p>
        </Show>
        <Show when={tashkeelText()}>
          <h2 class="text-xl font-bold text-purple-600">النص المشكَّل:</h2>
          <p class="mt-2 text-gray-800">{tashkeelText()}</p>
        </Show>
      </div>
    </div>
  );
}

export default TextEditor;