/****************************************************
 Dependencies
 ****************************************************/

let httpReference = dependencies.http;

let httpDependency = {
    get: httpReference.get,
    post: httpReference.post,
    put: httpReference.put,
    patch: httpReference.patch,
    delete: httpReference.delete,
    head: httpReference.head,
    options: httpReference.options
};
let httpService = {};

/**
 *
 * Handles a request with retry from the platform side.
 */
function handleRequestWithRetry(requestFn, options, callbackData, callbacks, retry) {
    try {
        return requestFn(options, callbackData, callbacks);
    } catch (error) {
        if (!retry && error.additionalInfo && error.additionalInfo.status === 401) {
            sys.logs.info("[signnow] Refreshing token for request " + options.path);
            refreshSignNowToken();
        } else {
            throw error;
        }
    }
    if (!retry) {
        return handleRequestWithRetry(requestFn, signnow(options), callbackData, callbacks, true);
    }
}

function createWrapperFunction(requestFn) {
    return function(options, callbackData, callbacks) {
        return handleRequestWithRetry(requestFn, options, callbackData, callbacks);
    };
}

for (let key in httpDependency) {
    if (typeof httpDependency[key] === 'function') httpService[key] = createWrapperFunction(httpDependency[key]);
}

/****************************************************
 Public API - Generic Functions
 ****************************************************/

/**
 * Sends an HTTP GET request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the GET request to.
 * @param {object} httpOptions  - The options to be included in the GET request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the GET request. [optional]
 * @return {object}             - The response of the GET request.
 */
exports.get = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    return httpService.get(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP POST request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the POST request to.
 * @param {object} httpOptions  - The options to be included in the POST request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the POST request. [optional]
 * @return {object}             - The response of the POST request.
 */
exports.post = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    let headers = options.headers || {};
    sys.logs.debug('[signnow] Set header Content-Type');
    headers = mergeJSON(headers, {
        "Content-Type": "application/x-www-form-urlencoded"
    });
    options.headers = headers;
    return httpService.post(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP PUT request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the PUT request to.
 * @param {object} httpOptions  - The options to be included in the PUT request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the POST request. [optional]
 * @return {object}             - The response of the PUT request.
 */
exports.put = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    let headers = options.headers || {};
    sys.logs.debug('[signnow] Set header Content-Type');
    headers = mergeJSON(headers, {
        "Content-Type": "application/x-www-form-urlencoded"
    });
    options.headers = headers;
    return httpService.put(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP PATCH request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the PATCH request to.
 * @param {object} httpOptions  - The options to be included in the PATCH request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the POST request. [optional]
 * @return {object}             - The response of the PATCH request.
 */
exports.patch = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    return httpService.patch(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP DELETE request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the DELETE request to.
 * @param {object} httpOptions  - The options to be included in the DELETE request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the DELETE request. [optional]
 * @return {object}             - The response of the DELETE request.
 */
exports.delete = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    return httpService.delete(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP HEAD request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the HEAD request to.
 * @param {object} httpOptions  - The options to be included in the HEAD request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the HEAD request. [optional]
 * @return {object}             - The response of the HEAD request.
 */
exports.head = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    return httpService.head(signnow(options), callbackData, callbacks);
};

/**
 * Sends an HTTP OPTIONS request to the specified URL with the provided HTTP options.
 *
 * @param {string} path         - The path to send the OPTIONS request to.
 * @param {object} httpOptions  - The options to be included in the OPTIONS request check http-service documentation.
 * @param {object} callbackData - Additional data to be passed to the callback functions. [optional]
 * @param {object} callbacks    - The callback functions to be called upon completion of the OPTIONS request. [optional]
 * @return {object}             - The response of the OPTIONS request.
 */
exports.options = function (path, httpOptions, callbackData, callbacks) {
    let options = checkHttpOptions(path, httpOptions);
    return httpService.options(signnow(options), callbackData, callbacks);
};

exports.clearTokensFromStorage = function () {
    sys.logs.warn("[signnow] Clearing token from storage.");
    sys.storage.remove('signnow-access-token');
    sys.storage.remove('signnow-refresh-token');
};

/****************************************************
 Private helpers
 ****************************************************/

function checkHttpOptions(path, options) {
    options = options || {};
    if (!!path) {
        if (isObject(path)) {
            // take the 'path' parameter as the options
            options = path || {};
        } else {
            if (!!options.path || !!options.params || !!options.body) {
                // options contain the http package format
                options.path = path;
            } else {
                // create html package
                options = {
                    path: path,
                    body: options
                }
            }
        }
    }
    return options;
}

function isObject(obj) {
    return !!obj && stringType(obj) === '[object Object]'
}

let stringType = Function.prototype.call.bind(Object.prototype.toString)

/****************************************************
 Configurator
 ****************************************************/

let signnow = function (options) {
    options = options || {};
    options = setApiUri(options);
    options = setRequestHeaders(options);
    options = setAuthorization(options);
    return options;
}

/****************************************************
 Private API
 ****************************************************/

function setApiUri(options) {
    let API_URL = config.get("signnowBaseUrl");
    let url = options.path || "";
    options.url = API_URL + url;
    sys.logs.debug('[signnow] Set url: ' + options.path + "->" + options.url);
    return options;
}

function setRequestHeaders(options) {
    let headers = options.headers || {};
    headers = mergeJSON(headers, {"Content-Type": "application/json"});
    headers = mergeJSON(headers, {"Accept": "application/json"});
    options.headers = headers;
    return options;
}

function setAuthorization(options) {
    sys.logs.debug('[signnow] Setting header token oauth');
    let authorization = (options.retry ? {} : options.authorization) || {};
    authorization = mergeJSON(authorization, {
        type: "oauth2",
        accessToken: sys.storage.get('signnow-access-token', {decrypt:true}),
        headerPrefix: "Bearer"
    });
    options.authorization = authorization;
    return options;
}

function refreshSignNowToken() {
    let API_URL = config.get("signnowBaseUrl");
    sys.utils.concurrency.lock('signnow-refresh-token', function() {
        const refreshTokenFromStorage = sys.storage.get('signnow-refresh-token', {decrypt: true});
        let refreshTokenResponse = httpService.post({
            url: `${API_URL}/oauth2/token`,
            headers: {
                "Accept": "application/json",
                "Content-Type": "multipart/form-data"
            },
            body: {
                "grant_type": "refresh_token",
                "refresh_token": refreshTokenFromStorage === undefined ? config.get("refreshToken") : refreshTokenFromStorage,
                "scope": "*"
            }
        });
        sys.logs.debug('[signnow] Refresh token response: ' + JSON.stringify(refreshTokenResponse));
        sys.storage.put('signnow-access-token', refreshTokenResponse.access_token, {encrypt: true});
        sys.storage.put('signnow-refresh-token', refreshTokenResponse.refresh_token, {encrypt: true});
    });
}


function mergeJSON(json1, json2) {
    let result = {};
    let key;
    for (key in json1) {
        if (json1.hasOwnProperty(key)) result[key] = json1[key];
    }
    for (key in json2) {
        if (json2.hasOwnProperty(key)) result[key] = json2[key];
    }
    return result;
}
