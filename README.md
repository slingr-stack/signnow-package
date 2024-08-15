# Overview

Repo: [https://github.com/slingr-stack/signnow-package](https://github.com/slingr-stack/signnow-package)

SignNow is a cloud-based e-signature solution that allows users to easily sign, send, and manage documents electronically. It offers a secure and efficient way to streamline workflows, eliminate paper, and accelerate business processes.

The SignNow package has the following features:

- Authentication for the SignNow API
- Shortcuts to access the SignNow API
- Support for webhooks

In most cases, you will be using the provided shortcuts to access the API. For example, you could use the API directly by doing an HTTP request like this:

```js
let res = pkg.signnow.api.get(`/document/${id}`);
```

# Configuration

First, you will need to set up an account in SignNow. Once you have a SignNow account, you will be able to configure the package with the settings listed below.

## Basic Token

Name: `basicToken`

The basic token is used for some specific requests, like getting bearer tokens or creating users. You can get this token from the API dashboard in SignNow.

## Refresh Token

Name: `refreshToken`

The package supports getting bearing tokens using a refresh token (see the [SignNow authentication docs](https://docs.signnow.com/docs/signnow/authentication)). This means that you will need to fetch a refresh token either using the credentials of the owner of the app or using an authorization code. We recommend using something like Postman and follow the instructions in the documentation of SignNow.

## Webhook URL

Name: `webhookUrl`

This is the URL you should configure for webhooks in SignNow. If you don't configure the webhooks URL in SignNow you app won't receive the events.

## Webhook Secret Key

Name: `webhookSecretKey`

This secret key is used to sign webhooks. When you set up the event subscription, you need to provide this key. The package will use that key to verify the signature of webhooks.

# Javascript API

## HTTP requests

You can make `GET`, `POST`, `PUT`, and `DELETE` requests to the [SignNow API](https://docs.signnow.com/docs/signnow/welcome) like this:

```js
let document = pkg.signnow.api.get(`/document/${documentId}`);
```

The package automatically handles authentication, so no need to worry about that.

For more information about making HTTP calls, please refer to the documentation of the [HTTP service](https://github.com/slingr-stack/http-service).

# Events

## Webhook

Every time SignNow sends an event to the webhooks URL (it needs to be configured in SignNow), this event will be triggered. The package takes care of verifying the signature if needed. The event's data is the raw content sent by SignNow.

# About Slingr

Slingr is a low-code rapid application development platform that accelerates development, with robust architecture for integrations and executing custom workflows and automation.

[More info about Slingr](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
