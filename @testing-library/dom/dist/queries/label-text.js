"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findByLabelText = exports.findAllByLabelText = exports.getByLabelText = exports.getAllByLabelText = exports.queryByLabelText = exports.queryAllByLabelText = void 0;

var _config = require("../config");

var _helpers = require("../helpers");

var _allUtils = require("./all-utils");

const labelledNodeNames = ['button', 'meter', 'output', 'progress', 'select', 'textarea', 'input'];

function queryAllLabels(container) {
  return Array.from(container.querySelectorAll('label,input')).map(node => {
    return {
      node,
      textToMatch: getLabelContent(node)
    };
  }).filter(({
    textToMatch
  }) => textToMatch !== null);
}

function queryAllLabelsByText(container, text, {
  exact = true,
  trim,
  collapseWhitespace,
  normalizer
} = {}) {
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  const textToMatchByLabels = queryAllLabels(container);
  return textToMatchByLabels.filter(({
    node,
    textToMatch
  }) => matcher(textToMatch, node, text, matchNormalizer)).map(({
    node
  }) => node);
}

function getTextContent(node) {
  if (labelledNodeNames.includes(node.nodeName.toLowerCase())) {
    return '';
  }

  if (node.nodeType === _helpers.TEXT_NODE) return node.textContent;
  return Array.from(node.childNodes).map(childNode => getTextContent(childNode)).join('');
}

function getLabelContent(node) {
  let textContent;

  if (node.tagName.toLowerCase() === 'label') {
    textContent = getTextContent(node);
  } else {
    textContent = node.value || node.textContent;
  }

  return textContent;
}

function queryAllByLabelText(container, text, {
  selector = '*',
  exact = true,
  collapseWhitespace,
  trim,
  normalizer
} = {}) {
  (0, _helpers.checkContainerType)(container);
  const matcher = exact ? _allUtils.matches : _allUtils.fuzzyMatches;
  const matchNormalizer = (0, _allUtils.makeNormalizer)({
    collapseWhitespace,
    trim,
    normalizer
  });
  const matchingLabelledElements = Array.from(container.querySelectorAll('*')).filter(element => {
    return getLabels(element) || element.hasAttribute('aria-labelledby');
  }).reduce((labelledElements, labelledElement) => {
    const labelsId = labelledElement.getAttribute('aria-labelledby') ? labelledElement.getAttribute('aria-labelledby').split(' ') : [];
    let labelsValue = labelsId.length ? labelsId.map(labelId => {
      const labellingElement = container.querySelector(`[id="${labelId}"]`);
      return labellingElement ? getLabelContent(labellingElement) : '';
    }) : Array.from(getLabels(labelledElement)).map(label => {
      const textToMatch = getLabelContent(label);
      const formControlSelector = labelledNodeNames.join(',');
      const labelledFormControl = Array.from(label.querySelectorAll(formControlSelector)).filter(element => element.matches(selector))[0];

      if (labelledFormControl) {
        if (matcher(textToMatch, labelledFormControl, text, matchNormalizer)) labelledElements.push(labelledFormControl);
      }

      return textToMatch;
    });
    labelsValue = labelsValue.filter(Boolean);
    if (matcher(labelsValue.join(' '), labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);

    if (labelsValue.length > 1) {
      labelsValue.forEach((labelValue, index) => {
        if (matcher(labelValue, labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);
        const labelsFiltered = [...labelsValue];
        labelsFiltered.splice(index, 1);

        if (labelsFiltered.length > 1) {
          if (matcher(labelsFiltered.join(' '), labelledElement, text, matchNormalizer)) labelledElements.push(labelledElement);
        }
      });
    }

    return labelledElements;
  }, []).concat((0, _allUtils.queryAllByAttribute)('aria-label', container, text, {
    exact
  }));
  return Array.from(new Set(matchingLabelledElements)).filter(element => element.matches(selector));
} // the getAll* query would normally look like this:
// const getAllByLabelText = makeGetAllQuery(
//   queryAllByLabelText,
//   (c, text) => `Unable to find a label with the text of: ${text}`,
// )
// however, we can give a more helpful error message than the generic one,
// so we're writing this one out by hand.


const getAllByLabelText = (container, text, ...rest) => {
  const els = queryAllByLabelText(container, text, ...rest);

  if (!els.length) {
    const labels = queryAllLabelsByText(container, text, ...rest);

    if (labels.length) {
      const tagNames = labels.map(label => getTagNameOfElementAssociatedWithLabelViaFor(container, label)).filter(tagName => !!tagName);

      if (tagNames.length) {
        throw (0, _config.getConfig)().getElementError(tagNames.map(tagName => `Found a label with the text of: ${text}, however the element associated with this label (<${tagName} />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <${tagName} />, you can use aria-label or aria-labelledby instead.`).join('\n\n'), container);
      } else {
        throw (0, _config.getConfig)().getElementError(`Found a label with the text of: ${text}, however no form control was found associated to that label. Make sure you're using the "for" attribute or "aria-labelledby" attribute correctly.`, container);
      }
    } else {
      throw (0, _config.getConfig)().getElementError(`Unable to find a label with the text of: ${text}`, container);
    }
  }

  return els;
};

function getTagNameOfElementAssociatedWithLabelViaFor(container, label) {
  const htmlFor = label.getAttribute('for');

  if (!htmlFor) {
    return null;
  }

  const element = container.querySelector(`[id="${htmlFor}"]`);
  return element ? element.tagName.toLowerCase() : null;
} // the reason mentioned above is the same reason we're not using buildQueries


const getMultipleError = (c, text) => `Found multiple elements with the text of: ${text}`;

const queryByLabelText = (0, _allUtils.wrapSingleQueryWithSuggestion)((0, _allUtils.makeSingleQuery)(queryAllByLabelText, getMultipleError), queryAllByLabelText.name, 'query');
exports.queryByLabelText = queryByLabelText;
const getByLabelText = (0, _allUtils.makeSingleQuery)(getAllByLabelText, getMultipleError);
const findAllByLabelText = (0, _allUtils.makeFindQuery)((0, _allUtils.wrapAllByQueryWithSuggestion)(getAllByLabelText, getAllByLabelText.name, 'findAll'));
exports.findAllByLabelText = findAllByLabelText;
const findByLabelText = (0, _allUtils.makeFindQuery)((0, _allUtils.wrapSingleQueryWithSuggestion)(getByLabelText, getByLabelText.name, 'find'));
exports.findByLabelText = findByLabelText;
const getAllByLabelTextWithSuggestions = (0, _allUtils.wrapAllByQueryWithSuggestion)(getAllByLabelText, getAllByLabelText.name, 'getAll');
exports.getAllByLabelText = getAllByLabelTextWithSuggestions;
const getByLabelTextWithSuggestions = (0, _allUtils.wrapSingleQueryWithSuggestion)(getByLabelText, getAllByLabelText.name, 'get');
exports.getByLabelText = getByLabelTextWithSuggestions;
const queryAllByLabelTextWithSuggestions = (0, _allUtils.wrapAllByQueryWithSuggestion)(queryAllByLabelText, queryAllByLabelText.name, 'queryAll');
exports.queryAllByLabelText = queryAllByLabelTextWithSuggestions;

// Based on https://github.com/eps1lon/dom-accessibility-api/pull/352
function getLabels(element) {
  if (element.labels !== undefined) return element.labels;
  if (!isLabelable(element)) return null;
  const labels = element.ownerDocument.querySelectorAll('label');
  return Array.from(labels).filter(label => label.control === element);
}

function isLabelable(element) {
  return element.tagName.match(/BUTTON|METER|OUTPUT|PROGRESS|SELECT|TEXTAREA/) || element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden';
}