"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSuggestedQuery = getSuggestedQuery;

var _domAccessibilityApi = require("dom-accessibility-api");

var _matches = require("./matches");

var _getNodeText = require("./get-node-text");

var _config = require("./config");

var _roleHelpers = require("./role-helpers");

const normalize = (0, _matches.getDefaultNormalizer)();

function getLabelTextFor(element) {
  let label = element.labels && Array.from(element.labels).find(el => Boolean(normalize(el.textContent))); // non form elements that are using aria-labelledby won't be included in `element.labels`

  if (!label) {
    const ariaLabelledBy = element.getAttribute('aria-labelledby');

    if (ariaLabelledBy) {
      // this is only a temporary fix. The problem is that at the moment @testing-library/dom
      // not support label concatenation
      // see https://github.com/testing-library/dom-testing-library/issues/545
      const firstId = ariaLabelledBy.split(' ')[0]; // we're using this notation because with the # selector we would have to escape special characters e.g. user.name
      // see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector#Escaping_special_characters

      label = document.querySelector(`[id="${firstId}"]`);
    }
  }

  if (label) {
    return label.textContent;
  }

  return undefined;
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getRegExpMatcher(string) {
  return new RegExp(escapeRegExp(string.toLowerCase()), 'i');
}

function makeSuggestion(queryName, element, content, {
  variant,
  name
}) {
  let warning = '';
  const queryOptions = {};
  const queryArgs = [queryName === 'Role' || queryName === 'TestId' ? content : getRegExpMatcher(content)];

  if (name) {
    queryOptions.name = getRegExpMatcher(name);
  }

  if (queryName === 'Role' && (0, _roleHelpers.isInaccessible)(element)) {
    queryOptions.hidden = true;
    warning = `Element is inaccessible. This means that the element and all its children are invisible to screen readers.
    If you are using the aria-hidden prop, make sure this is the right choice for your case.
    `;
    console.warn(warning);
  }

  if (Object.keys(queryOptions).length > 0) {
    queryArgs.push(queryOptions);
  }

  const queryMethod = `${variant}By${queryName}`;
  return {
    queryName,
    queryMethod,
    queryArgs,
    variant,
    warning,

    toString() {
      let [text, options] = queryArgs;
      text = typeof text === 'string' ? `'${text}'` : text;
      options = options ? `, { ${Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(', ')} }` : '';
      return `${queryMethod}(${text}${options})`;
    }

  };
}

function canSuggest(currentMethod, requestedMethod, data) {
  return data && (!requestedMethod || requestedMethod.toLowerCase() === currentMethod.toLowerCase());
}

function getSuggestedQuery(element, variant = 'get', method) {
  var _element$getAttribute, _getImplicitAriaRoles;

  // don't create suggestions for script and style elements
  if (element.matches(_config.DEFAULT_IGNORE_TAGS)) {
    return undefined;
  } //We prefer to suggest something else if the role is generic


  const role = (_element$getAttribute = element.getAttribute('role')) != null ? _element$getAttribute : (_getImplicitAriaRoles = (0, _roleHelpers.getImplicitAriaRoles)(element)) == null ? void 0 : _getImplicitAriaRoles[0];

  if (role !== 'generic' && canSuggest('Role', method, role)) {
    return makeSuggestion('Role', element, role, {
      variant,
      name: (0, _domAccessibilityApi.computeAccessibleName)(element, {
        computedStyleSupportsPseudoElements: (0, _config.getConfig)().computedStyleSupportsPseudoElements
      })
    });
  }

  const labelText = getLabelTextFor(element);

  if (canSuggest('LabelText', method, labelText)) {
    return makeSuggestion('LabelText', element, labelText, {
      variant
    });
  }

  const placeholderText = element.getAttribute('placeholder');

  if (canSuggest('PlaceholderText', method, placeholderText)) {
    return makeSuggestion('PlaceholderText', element, placeholderText, {
      variant
    });
  }

  const textContent = normalize((0, _getNodeText.getNodeText)(element));

  if (canSuggest('Text', method, textContent)) {
    return makeSuggestion('Text', element, textContent, {
      variant
    });
  }

  if (canSuggest('DisplayValue', method, element.value)) {
    return makeSuggestion('DisplayValue', element, normalize(element.value), {
      variant
    });
  }

  const alt = element.getAttribute('alt');

  if (canSuggest('AltText', method, alt)) {
    return makeSuggestion('AltText', element, alt, {
      variant
    });
  }

  const title = element.getAttribute('title');

  if (canSuggest('Title', method, title)) {
    return makeSuggestion('Title', element, title, {
      variant
    });
  }

  const testId = element.getAttribute((0, _config.getConfig)().testIdAttribute);

  if (canSuggest('TestId', method, testId)) {
    return makeSuggestion('TestId', element, testId, {
      variant
    });
  }

  return undefined;
}