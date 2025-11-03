# Frontier

The front facing client side for LLMs.

## Overview

- React
- Node.js
- Azure AI Foundry

A fullstack app that has a static web app client which holds a local chat session.
That chat history and new message is then sent to a Node.js backend which handle packaging and communication with the AI Foundry deployment of gpt-5-mini.
The chat body is scrollable without the write message field disapears, scrolls to the bottom automatically when messages comes. 
Sending messge is disabled while waiting for a reply from the backend.
<img width="569" height="494" alt="image" src="https://github.com/user-attachments/assets/87a7ba73-9e56-4fba-bf2a-5d071e72f35d" />

<img width="770" height="896" alt="image" src="https://github.com/user-attachments/assets/a0f00563-0563-4f73-8992-01fc81424230" />

## Potential Improvments
- copy message text button
- make previous messages editable
- retry/regenerate response
- add sessions module
- add auth



