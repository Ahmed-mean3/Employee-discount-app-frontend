#!/usr/bin/env bash
# template file
template="extensions/checkout-ui-2/src/config/config.template.txt"
# generated file
config="extensions/checkout-ui-2/src/config/config.ts"
# make sure that the EMPLOYEE_APP_BACKEND_KEY environment variable is set
if [ -z "${EMPLOYEE_APP_BACKEND_KEY}" ]; then
    echo -e "\033[0;31mMust set EMPLOYEE_APP_BACKEND_KEY environment variable"
    exit 1
fi

# generate the runtime file based on the template, using envsubst
envsubst < "$template" > extensions/checkout-ui-2/src/config/config.ts
# output what you did
echo -e "\033[0;32mWrote $EMPLOYEE_APP_BACKEND_KEY as EMPLOYEE_APP_BACKEND_KEY from $template to $config"