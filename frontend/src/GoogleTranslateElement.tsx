import React, { useEffect } from 'react';

const GoogleTranslateElement: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
        'google_translate_element'
      );
    };

    return () => {
      const existingScript = document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]');
      if (existingScript) {
        existingScript.remove();
      }
      const googleTranslateElement = document.getElementById('google_translate_element');
      if (googleTranslateElement) {
        googleTranslateElement.innerHTML = '';
      }
    };
  }, []);

  return <div id="google_translate_element"></div>;
};

export default GoogleTranslateElement;
