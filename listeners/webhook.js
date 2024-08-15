/****************************************************
 Webhooks
 ****************************************************/

listeners.defaultWebhookSignnow = {
    label: 'Catch HTTP SignNow events',
    type: 'service',
    options: {
        service: 'http',
        event: 'webhook',
        matching: {
            path: '/signnow',
        }
    },
    callback: function(event) {
        let body = event.data.rawBody;
        let headers = event.data.headers;
        let signature = headers["X-SignNow-Signature"] || headers["x-signnow-signature"];
        if (pkg.signnow.utils.verifySignature(body, signature)) {
            sys.events.triggerEvent("signnow:webhook", event.data);
        } else {
            sys.logs.warn('[signnow] Invalid signature for webhook');
        }
    }
};