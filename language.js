const languageKey = 'aman-site-language';
const languageButtons = [...document.querySelectorAll('.language-switch button')];
const languageBindings = new Map();
let currentLanguage = 'id';

function bindLanguage(node, property, english, indonesian, write) {
  if (!languageBindings.has(node)) languageBindings.set(node, new Map());
  const render = language => write(language === 'en' ? english : indonesian);
  languageBindings.get(node).set(property, render);
  render(currentLanguage);
}

function setLocalizedText(node, english, indonesian) {
  bindLanguage(node, 'text', english, indonesian, value => { node.textContent = value; });
}

function setLocalizedAttribute(node, attribute, english, indonesian) {
  bindLanguage(node, attribute, english, indonesian, value => node.setAttribute(attribute, value));
}

function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.title = language === 'en'
    ? 'AMAN Logistic Pte Ltd — From Singapore All the way home'
    : 'AMAN Logistic Pte Ltd — Dari Singapura sampai ke rumah';
  for (const bindings of languageBindings.values()) {
    for (const render of bindings.values()) render(language);
  }
  for (const button of languageButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  }
}

const languageComments = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
for (let marker = languageComments.nextNode(); marker; marker = languageComments.nextNode()) {
  if (!marker.data.startsWith('en:') || marker.nextSibling?.nodeType !== Node.TEXT_NODE) continue;
  const node = marker.nextSibling;
  const indonesian = node.data;
  const english = marker.data.slice(3) + indonesian.match(/\s*$/)[0];
  bindLanguage(node, 'text', english, indonesian, value => { node.data = value; });
}
for (const attribute of ['alt', 'aria-label', 'href', 'content']) {
  for (const node of document.querySelectorAll(`[data-en-${attribute}]`)) {
    setLocalizedAttribute(node, attribute, node.getAttribute(`data-en-${attribute}`), node.getAttribute(attribute));
  }
}

let savedLanguage;
try { savedLanguage = localStorage.getItem(languageKey); } catch {}
setLanguage(savedLanguage === 'en' ? 'en' : 'id');
for (const button of languageButtons) {
  button.addEventListener('click', () => {
    const language = button.dataset.language;
    setLanguage(language);
    try { localStorage.setItem(languageKey, language); } catch {}
  });
}
document.querySelector('.language-switch').hidden = false;
