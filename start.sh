#!/bin/bash
(cd backend && npm start) &
(cd frontend && npm run dev) &
wait