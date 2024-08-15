/**
 * Verifies the signature of a payload against the provided signature header and secret.
 * @param {string} payload - The payload to verify.
 * @param {string} signature - The signature header
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
exports.verifySignature = function (payload, signature) {
    let webhooksSecret = config.get("webhookSecretKey")
    return sys.utils.crypto.verifySignatureWithHmac(payload, signature, webhooksSecret, "HmacSHA256");
};