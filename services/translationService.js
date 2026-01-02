const { Translate } = require('@google-cloud/translate').v2;

// Initialize the Translate client
const translate = new Translate(); // Ensure your Google Cloud credentials are set up

async function translateMessage(content, targetLanguage) {
  try {
    const [translatedText] = await translate.translate(content, targetLanguage);
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

module.exports = { translateMessage };