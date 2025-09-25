#!/bin/bash
cd /home/kavia/workspace/code-generation/event-management-system-26331-26340/event_management_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

