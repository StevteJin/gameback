#!/bin/sh
pm2 flush && pm2 start ./bin/www -i 0 && pm2 logs