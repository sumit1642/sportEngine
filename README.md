NOTE: 

If in development mode then always set `ARCJET_MODE=DRY_RUN`, only then arcjet will allow the requests to be validated or else by default it will assume that the requests are coming from a live server and will throw public ip error and decision=DENY, it will start assuming that  

*Another Testing Error:*
- This command won't work properly because the arcjet assumes it as a bot, and thinks that this is not coming from a browser.
	```sh
	for i in {1..50}; do curl -s -o /dev/null -w "%{http_code}\n" 'http://localhost:8000/matches\'; done
	```
	*Fix available*
	```sh
	for i in {1..50}; do 
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
    -H "Accept: application/json" \
    'http://localhost:8000/matches'
	done
	```