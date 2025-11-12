#!/bin/bash
(cd api && npm run dev) &
(cd web && npm run dev) &
wait